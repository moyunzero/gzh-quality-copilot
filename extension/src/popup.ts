import {
  assertGoldPayload,
  BG_CANCEL_MULTI_MESSAGE,
  BG_START_MULTI_MESSAGE,
  EXTRACT_MESSAGE,
  FIXTURE_FILENAME,
  normalizeArticles,
  tabExportContext,
  type ExtractReply,
  type RawRow,
  type TabExportContext,
  type WalkStopReason,
} from "./logic";

const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const fixtureBtn = document.getElementById("fixture-btn") as HTMLButtonElement;
const pasteBtn = document.getElementById("paste-btn") as HTMLButtonElement;
const pasteHelp = document.getElementById("paste-help") as HTMLParagraphElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const progressEl = document.getElementById("progress") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLElement;
const progressCheck = document.getElementById("progress-check") as HTMLElement;
const multipageOpt = document.getElementById("multipage-opt") as HTMLInputElement;

let exportRunning = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reveal(el: HTMLElement): void {
  el.hidden = false;
  if (prefersReducedMotion()) {
    el.classList.add("is-in");
    return;
  }
  el.classList.remove("is-in");
  requestAnimationFrame(() => {
    el.classList.add("is-in");
  });
}

function hide(el: HTMLElement): void {
  el.hidden = true;
  el.classList.remove("is-in");
}

function showStatus(text: string, kind: "danger" | "ok" | "note"): void {
  statusEl.textContent = text;
  statusEl.classList.remove("is-danger", "is-ok", "is-note");
  statusEl.classList.add(`is-${kind}`);
  reveal(statusEl);
}

function applyContextStatus(ctx: TabExportContext): void {
  showStatus(ctx.message, ctx.statusKind);
  if (ctx.kind !== "ready") {
    showPasteCta();
  }
}

/** Pre-export status from active tab URL; no extract required. */
async function refreshContextStatus(): Promise<void> {
  hidePaste();
  if (!hasChromeTabs()) {
    applyContextStatus(tabExportContext(undefined));
    return;
  }
  let tab: chrome.tabs.Tab | undefined;
  try {
    tab = await activeTab();
  } catch {
    applyContextStatus(tabExportContext(undefined));
    return;
  }
  applyContextStatus(tabExportContext(tab?.url));
}

function hidePaste(): void {
  hide(pasteBtn);
  hide(pasteHelp);
}

function resetProgress(): void {
  hide(progressEl);
  progressBar.style.setProperty("--p", "0");
  progressCheck.classList.remove("is-in");
}

function setProgress(p: number): void {
  progressEl.hidden = false;
  progressBar.style.setProperty("--p", String(p));
}

function markProgressComplete(): void {
  setProgress(1);
  if (prefersReducedMotion()) {
    progressCheck.classList.add("is-in");
    return;
  }
  progressCheck.classList.remove("is-in");
  requestAnimationFrame(() => {
    progressCheck.classList.add("is-in");
  });
}

function showPasteCta(): void {
  reveal(pasteBtn);
}

function hasChromeTabs(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.tabs?.query === "function";
}

function hasChromeDownloads(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.downloads?.download === "function";
}

function setBusy(busy: boolean, multi = false): void {
  exportRunning = busy;
  exportBtn.disabled = busy;
  fixtureBtn.disabled = busy;
  multipageOpt.disabled = busy;
  if (busy && multi) {
    reveal(cancelBtn);
    cancelBtn.disabled = false;
  } else {
    hide(cancelBtn);
  }
  if (busy) {
    exportBtn.setAttribute("aria-busy", "true");
  } else {
    exportBtn.removeAttribute("aria-busy");
    fixtureBtn.removeAttribute("aria-busy");
  }
}

async function activeTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function downloadJson(payload: unknown, filename: string): Promise<void> {
  const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`;
  await chrome.downloads.download({
    url: dataUrl,
    filename,
    saveAs: false,
  });
}

/** Content scripts do not re-inject after extension reload; inject once then retry. */
async function requestExtract(tabId: number): Promise<ExtractReply> {
  try {
    return (await chrome.tabs.sendMessage(tabId, {
      type: EXTRACT_MESSAGE,
    })) as ExtractReply;
  } catch {
    if (typeof chrome.scripting?.executeScript !== "function") {
      throw new Error("inject unavailable");
    }
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-list.js"],
    });
    return (await chrome.tabs.sendMessage(tabId, {
      type: EXTRACT_MESSAGE,
    })) as ExtractReply;
  }
}

/** Kick off multi-page walk in the service worker so download survives popup close. */
async function startBackgroundMulti(tabId: number): Promise<void> {
  const reply = (await chrome.runtime.sendMessage({
    type: BG_START_MULTI_MESSAGE,
    tabId,
  })) as { ok?: boolean; started?: boolean; error?: string } | undefined;
  if (!reply?.ok || !reply.started) {
    throw new Error(reply?.error ?? "background multi start failed");
  }
}

async function requestCancel(tabId: number): Promise<void> {
  try {
    await chrome.runtime.sendMessage({ type: BG_CANCEL_MULTI_MESSAGE, tabId });
  } catch {
    /* extension context may be gone */
  }
}

function stopReasonMessage(reason: WalkStopReason, count: number, pages: number): string {
  const base = `已下载 ${FIXTURE_FILENAME}（${count} 篇 / ${pages} 页）`;
  switch (reason) {
    case "cancel":
      return count > 0 ? `已取消。${base}` : "已取消。";
    case "cap":
      return `${base} · 已达翻页上限`;
    case "error":
      return count > 0 ? `翻页中断。${base}` : "列表为空或无法解析。";
    case "end":
      if (pages <= 1) {
        return `${base}。若后台还有分页却只有一页，请刷新列表页后重试（下一页控件可能未识别）。`;
      }
      return `${base} · 已到末页`;
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }
}

async function finishWithArticles(
  rawArticles: RawRow[],
  stopReason: WalkStopReason,
  pagesWalked: number,
): Promise<void> {
  if (rawArticles.length === 0) {
    resetProgress();
    if (stopReason === "cancel") {
      showStatus("已取消。", "note");
    } else {
      showStatus("列表为空或无法解析。", "danger");
    }
    showPasteCta();
    return;
  }
  const payload = normalizeArticles(rawArticles);
  setProgress(0.8);
  await downloadJson(payload, FIXTURE_FILENAME);
  markProgressComplete();
  const kind =
    stopReason === "cancel" || stopReason === "error" || (stopReason === "end" && pagesWalked <= 1)
      ? "note"
      : "ok";
  showStatus(stopReasonMessage(stopReason, rawArticles.length, pagesWalked), kind);
}

let cancelTabId: number | undefined;

async function onExport(): Promise<void> {
  if (exportRunning) return;
  const multi = multipageOpt.checked;
  setBusy(true, multi);
  /** When true, leave cancel affordance up — SW owns the walk/download. */
  let backgroundMultiRunning = false;

  try {
    hidePaste();
    resetProgress();
    if (!hasChromeTabs()) {
      applyContextStatus(tabExportContext(undefined));
      return;
    }

    let tab: chrome.tabs.Tab | undefined;
    try {
      tab = await activeTab();
    } catch {
      applyContextStatus(tabExportContext(undefined));
      return;
    }

    const ctx = tabExportContext(tab?.url);
    if (ctx.kind !== "ready") {
      applyContextStatus(ctx);
      return;
    }

    if (!hasChromeDownloads() || tab?.id === undefined) {
      showStatus("本地下载失败。", "danger");
      showPasteCta();
      return;
    }

    cancelTabId = tab.id;
    setProgress(0.2);

    if (!multi) {
      let reply: ExtractReply;
      try {
        reply = await requestExtract(tab.id);
      } catch {
        resetProgress();
        showStatus("请刷新已发表列表页后重试。", "danger");
        showPasteCta();
        return;
      }

      setProgress(0.55);

      if (!reply || reply.ok === false) {
        resetProgress();
        showStatus("列表为空或无法解析。", "danger");
        showPasteCta();
        return;
      }

      const rawArticles: RawRow[] = reply.articles ?? [];
      if (rawArticles.length === 0) {
        resetProgress();
        showStatus("列表为空或无法解析。", "danger");
        showPasteCta();
        return;
      }

      const payload = normalizeArticles(rawArticles);
      setProgress(0.8);
      await downloadJson(payload, FIXTURE_FILENAME);
      markProgressComplete();
      showStatus(`已下载 ${FIXTURE_FILENAME}`, "ok");
      return;
    }

    showStatus("正在翻页导出…可关闭弹窗，完成后自动下载；未关时可点取消。", "note");
    setProgress(0.45);
    try {
      await startBackgroundMulti(tab.id);
    } catch {
      resetProgress();
      showStatus("翻页导出未能启动：请刷新已发表列表页后重试。", "danger");
      showPasteCta();
      return;
    }
    markProgressComplete();
    // Download runs in the service worker; do not await walk here (popup dies on page click).
    showStatus("翻页进行中：请稍候查看下载（articles.interchange.json）。", "note");
    backgroundMultiRunning = true;
    exportRunning = true;
    reveal(cancelBtn);
    cancelBtn.disabled = false;
    exportBtn.disabled = true;
    fixtureBtn.disabled = true;
    multipageOpt.disabled = true;
  } catch {
    resetProgress();
    showStatus("本地下载失败。", "danger");
    showPasteCta();
  } finally {
    if (!backgroundMultiRunning) {
      cancelTabId = undefined;
      setBusy(false);
    }
  }
}

async function onCancel(): Promise<void> {
  if (!exportRunning || cancelTabId === undefined) return;
  cancelBtn.disabled = true;
  showStatus("正在取消…", "note");
  await requestCancel(cancelTabId);
}

async function onFixtureExport(): Promise<void> {
  if (exportRunning) return;
  setBusy(true);
  fixtureBtn.setAttribute("aria-busy", "true");

  try {
    hidePaste();
    resetProgress();
    if (!hasChromeDownloads()) {
      showStatus("本地下载失败。", "danger");
      showPasteCta();
      return;
    }

    setProgress(0.2);
    const fixtureUrl = chrome.runtime.getURL("fixtures/tracer.json");
    const res = await fetch(fixtureUrl);
    if (!res.ok) throw new Error("fixture missing");
    setProgress(0.55);
    const payload: unknown = await res.json();
    assertGoldPayload(payload);
    setProgress(0.8);
    await downloadJson(payload, FIXTURE_FILENAME);
    markProgressComplete();
    showStatus(`已下载 ${FIXTURE_FILENAME}`, "ok");
  } catch {
    resetProgress();
    showStatus("本地下载失败。", "danger");
    showPasteCta();
  } finally {
    setBusy(false);
  }
}

exportBtn.addEventListener("click", () => {
  void onExport();
});

cancelBtn.addEventListener("click", () => {
  void onCancel();
});

fixtureBtn.addEventListener("click", () => {
  void onFixtureExport();
});

pasteBtn.addEventListener("click", () => {
  reveal(pasteHelp);
});

void refreshContextStatus();
