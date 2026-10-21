import {
  assertGoldPayload,
  EXTRACT_MESSAGE,
  FIXTURE_FILENAME,
  normalizeArticles,
  tabExportContext,
  type ExtractReply,
  type RawRow,
  type TabExportContext,
} from "./logic";

const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const fixtureBtn = document.getElementById("fixture-btn") as HTMLButtonElement;
const pasteBtn = document.getElementById("paste-btn") as HTMLButtonElement;
const pasteHelp = document.getElementById("paste-help") as HTMLParagraphElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const progressEl = document.getElementById("progress") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLElement;
const progressCheck = document.getElementById("progress-check") as HTMLElement;

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

function setBusy(busy: boolean): void {
  exportRunning = busy;
  exportBtn.disabled = busy;
  fixtureBtn.disabled = busy;
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

async function onExport(): Promise<void> {
  if (exportRunning) return;
  setBusy(true);

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

    setProgress(0.2);

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
  } catch {
    resetProgress();
    showStatus("本地下载失败。", "danger");
    showPasteCta();
  } finally {
    setBusy(false);
  }
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

fixtureBtn.addEventListener("click", () => {
  void onFixtureExport();
});

pasteBtn.addEventListener("click", () => {
  reveal(pasteHelp);
});

void refreshContextStatus();
