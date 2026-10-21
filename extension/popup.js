"use strict";
(() => {
  // src/logic.ts
  var GOLD_KEYS = [
    "title",
    "publish_time",
    "read_count",
    "like_count",
    "share_count",
    "wow_count",
    "url",
    "body"
  ];
  var COUNT_KEYS = ["read_count", "like_count", "share_count", "wow_count"];
  var FIXTURE_FILENAME = "articles.interchange.json";
  var EXTRACT_MESSAGE = "EXTRACT_LIST";
  var EXTRACT_MULTI_MESSAGE = "EXTRACT_LIST_MULTI";
  var CANCEL_MULTI_MESSAGE = "CANCEL_LIST_MULTI";
  function isCountKey(key) {
    return COUNT_KEYS.includes(key);
  }
  function parseCount(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return void 0;
    const n = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : void 0;
  }
  function hasPresentValue(value) {
    if (value === void 0 || value === null) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  }
  function normalizeArticle(raw) {
    const out = { _missing: [] };
    for (const key of GOLD_KEYS) {
      if (key === "body") {
        out._missing.push("body");
        continue;
      }
      const value = raw[key];
      if (!hasPresentValue(value)) {
        out._missing.push(key);
        continue;
      }
      if (isCountKey(key)) {
        const n = parseCount(value);
        if (n === void 0) {
          out._missing.push(key);
        } else {
          out[key] = n;
        }
        continue;
      }
      out[key] = String(value);
    }
    return out;
  }
  function normalizeArticles(rawRows) {
    return { articles: rawRows.map(normalizeArticle) };
  }
  function isMpListUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== "mp.weixin.qq.com") return false;
      const path = parsed.pathname;
      return path.startsWith("/cgi-bin/appmsg") || path.startsWith("/cgi-bin/appmsgpublish");
    } catch {
      return false;
    }
  }
  function tabExportContext(url) {
    if (isMpListUrl(url)) {
      return {
        kind: "ready",
        statusKind: "ok",
        message: "\u672C\u53F7\u5DF2\u53D1\u8868\u5217\u8868\uFF0C\u53EF\u5BFC\u51FA\u3002"
      };
    }
    if (url) {
      try {
        const parsed = new URL(url);
        if (parsed.hostname === "mp.weixin.qq.com") {
          return {
            kind: "not-ready",
            statusKind: "danger",
            message: "\u8BF7\u5148\u767B\u5F55\u672C\u53F7\u5217\u8868\u3002"
          };
        }
      } catch {
      }
    }
    return {
      kind: "not-list",
      statusKind: "danger",
      message: "\u5F53\u524D\u4E0D\u662F\u5DF2\u53D1\u8868\u5217\u8868\u9875\u3002"
    };
  }
  function assertGoldPayload(data) {
    if (!data || typeof data !== "object" || !("articles" in data)) {
      throw new Error("missing articles");
    }
    const articles = data.articles;
    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error("empty articles");
    }
    const first = articles[0];
    if (!first || typeof first !== "object") {
      throw new Error("bad article");
    }
    const row = first;
    for (const key of GOLD_KEYS) {
      if (!(key in row)) throw new Error(`missing ${key}`);
    }
    for (const key of COUNT_KEYS) {
      if (typeof row[key] !== "number") throw new Error(`${key} not number`);
    }
  }

  // src/popup.ts
  var exportBtn = document.getElementById("export-btn");
  var cancelBtn = document.getElementById("cancel-btn");
  var fixtureBtn = document.getElementById("fixture-btn");
  var pasteBtn = document.getElementById("paste-btn");
  var pasteHelp = document.getElementById("paste-help");
  var statusEl = document.getElementById("status");
  var progressEl = document.getElementById("progress");
  var progressBar = document.getElementById("progress-bar");
  var progressCheck = document.getElementById("progress-check");
  var multipageOpt = document.getElementById("multipage-opt");
  var exportRunning = false;
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function reveal(el) {
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
  function hide(el) {
    el.hidden = true;
    el.classList.remove("is-in");
  }
  function showStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.classList.remove("is-danger", "is-ok", "is-note");
    statusEl.classList.add(`is-${kind}`);
    reveal(statusEl);
  }
  function applyContextStatus(ctx) {
    showStatus(ctx.message, ctx.statusKind);
    if (ctx.kind !== "ready") {
      showPasteCta();
    }
  }
  async function refreshContextStatus() {
    hidePaste();
    if (!hasChromeTabs()) {
      applyContextStatus(tabExportContext(void 0));
      return;
    }
    let tab;
    try {
      tab = await activeTab();
    } catch {
      applyContextStatus(tabExportContext(void 0));
      return;
    }
    applyContextStatus(tabExportContext(tab?.url));
  }
  function hidePaste() {
    hide(pasteBtn);
    hide(pasteHelp);
  }
  function resetProgress() {
    hide(progressEl);
    progressBar.style.setProperty("--p", "0");
    progressCheck.classList.remove("is-in");
  }
  function setProgress(p) {
    progressEl.hidden = false;
    progressBar.style.setProperty("--p", String(p));
  }
  function markProgressComplete() {
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
  function showPasteCta() {
    reveal(pasteBtn);
  }
  function hasChromeTabs() {
    return typeof chrome !== "undefined" && typeof chrome.tabs?.query === "function";
  }
  function hasChromeDownloads() {
    return typeof chrome !== "undefined" && typeof chrome.downloads?.download === "function";
  }
  function setBusy(busy, multi = false) {
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
  async function activeTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }
  async function downloadJson(payload, filename) {
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`;
    await chrome.downloads.download({
      url: dataUrl,
      filename,
      saveAs: false
    });
  }
  async function requestExtract(tabId) {
    try {
      return await chrome.tabs.sendMessage(tabId, {
        type: EXTRACT_MESSAGE
      });
    } catch {
      if (typeof chrome.scripting?.executeScript !== "function") {
        throw new Error("inject unavailable");
      }
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content-list.js"]
      });
      return await chrome.tabs.sendMessage(tabId, {
        type: EXTRACT_MESSAGE
      });
    }
  }
  async function requestMultiExtract(tabId) {
    if (typeof chrome.scripting?.executeScript !== "function") {
      throw new Error("inject unavailable");
    }
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-list.js"]
    });
    const reply = await chrome.tabs.sendMessage(tabId, {
      type: EXTRACT_MULTI_MESSAGE
    });
    if (!reply || typeof reply !== "object" || !("ok" in reply)) {
      throw new Error("multi extract unavailable \u2014 refresh the list tab");
    }
    return reply;
  }
  async function requestCancel(tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: CANCEL_MULTI_MESSAGE });
    } catch {
    }
  }
  function stopReasonMessage(reason, count, pages) {
    const base = `\u5DF2\u4E0B\u8F7D ${FIXTURE_FILENAME}\uFF08${count} \u7BC7 / ${pages} \u9875\uFF09`;
    switch (reason) {
      case "cancel":
        return count > 0 ? `\u5DF2\u53D6\u6D88\u3002${base}` : "\u5DF2\u53D6\u6D88\u3002";
      case "cap":
        return `${base} \xB7 \u5DF2\u8FBE\u7FFB\u9875\u4E0A\u9650`;
      case "error":
        return count > 0 ? `\u7FFB\u9875\u4E2D\u65AD\u3002${base}` : "\u5217\u8868\u4E3A\u7A7A\u6216\u65E0\u6CD5\u89E3\u6790\u3002";
      case "end":
        if (pages <= 1) {
          return `${base}\u3002\u82E5\u540E\u53F0\u8FD8\u6709\u5206\u9875\u5374\u53EA\u6709\u4E00\u9875\uFF0C\u8BF7\u5237\u65B0\u5217\u8868\u9875\u540E\u91CD\u8BD5\uFF08\u4E0B\u4E00\u9875\u63A7\u4EF6\u53EF\u80FD\u672A\u8BC6\u522B\uFF09\u3002`;
        }
        return `${base} \xB7 \u5DF2\u5230\u672B\u9875`;
      default: {
        const _exhaustive = reason;
        return _exhaustive;
      }
    }
  }
  async function finishWithArticles(rawArticles, stopReason, pagesWalked) {
    if (rawArticles.length === 0) {
      resetProgress();
      if (stopReason === "cancel") {
        showStatus("\u5DF2\u53D6\u6D88\u3002", "note");
      } else {
        showStatus("\u5217\u8868\u4E3A\u7A7A\u6216\u65E0\u6CD5\u89E3\u6790\u3002", "danger");
      }
      showPasteCta();
      return;
    }
    const payload = normalizeArticles(rawArticles);
    setProgress(0.8);
    await downloadJson(payload, FIXTURE_FILENAME);
    markProgressComplete();
    const kind = stopReason === "cancel" || stopReason === "error" || stopReason === "end" && pagesWalked <= 1 ? "note" : "ok";
    showStatus(stopReasonMessage(stopReason, rawArticles.length, pagesWalked), kind);
  }
  var cancelTabId;
  async function onExport() {
    if (exportRunning) return;
    const multi = multipageOpt.checked;
    setBusy(true, multi);
    try {
      hidePaste();
      resetProgress();
      if (!hasChromeTabs()) {
        applyContextStatus(tabExportContext(void 0));
        return;
      }
      let tab;
      try {
        tab = await activeTab();
      } catch {
        applyContextStatus(tabExportContext(void 0));
        return;
      }
      const ctx = tabExportContext(tab?.url);
      if (ctx.kind !== "ready") {
        applyContextStatus(ctx);
        return;
      }
      if (!hasChromeDownloads() || tab?.id === void 0) {
        showStatus("\u672C\u5730\u4E0B\u8F7D\u5931\u8D25\u3002", "danger");
        showPasteCta();
        return;
      }
      cancelTabId = tab.id;
      setProgress(0.2);
      if (!multi) {
        let reply2;
        try {
          reply2 = await requestExtract(tab.id);
        } catch {
          resetProgress();
          showStatus("\u8BF7\u5237\u65B0\u5DF2\u53D1\u8868\u5217\u8868\u9875\u540E\u91CD\u8BD5\u3002", "danger");
          showPasteCta();
          return;
        }
        setProgress(0.55);
        if (!reply2 || reply2.ok === false) {
          resetProgress();
          showStatus("\u5217\u8868\u4E3A\u7A7A\u6216\u65E0\u6CD5\u89E3\u6790\u3002", "danger");
          showPasteCta();
          return;
        }
        const rawArticles = reply2.articles ?? [];
        if (rawArticles.length === 0) {
          resetProgress();
          showStatus("\u5217\u8868\u4E3A\u7A7A\u6216\u65E0\u6CD5\u89E3\u6790\u3002", "danger");
          showPasteCta();
          return;
        }
        const payload = normalizeArticles(rawArticles);
        setProgress(0.8);
        await downloadJson(payload, FIXTURE_FILENAME);
        markProgressComplete();
        showStatus(`\u5DF2\u4E0B\u8F7D ${FIXTURE_FILENAME}`, "ok");
        return;
      }
      showStatus("\u6B63\u5728\u7FFB\u9875\u5BFC\u51FA\u2026\u53EF\u70B9\u53D6\u6D88\u3002", "note");
      setProgress(0.35);
      let reply;
      try {
        reply = await requestMultiExtract(tab.id);
      } catch {
        resetProgress();
        showStatus("\u7FFB\u9875\u811A\u672C\u672A\u5C31\u7EEA\uFF1A\u8BF7\u5237\u65B0\u5DF2\u53D1\u8868\u5217\u8868\u9875\u540E\u91CD\u8BD5\u3002", "danger");
        showPasteCta();
        return;
      }
      setProgress(0.7);
      if (!reply || reply.ok === false) {
        resetProgress();
        showStatus("\u5217\u8868\u4E3A\u7A7A\u6216\u65E0\u6CD5\u89E3\u6790\u3002", "danger");
        showPasteCta();
        return;
      }
      await finishWithArticles(reply.articles ?? [], reply.stopReason, reply.pagesWalked);
    } catch {
      resetProgress();
      showStatus("\u672C\u5730\u4E0B\u8F7D\u5931\u8D25\u3002", "danger");
      showPasteCta();
    } finally {
      cancelTabId = void 0;
      setBusy(false);
    }
  }
  async function onCancel() {
    if (!exportRunning || cancelTabId === void 0) return;
    cancelBtn.disabled = true;
    showStatus("\u6B63\u5728\u53D6\u6D88\u2026", "note");
    await requestCancel(cancelTabId);
  }
  async function onFixtureExport() {
    if (exportRunning) return;
    setBusy(true);
    fixtureBtn.setAttribute("aria-busy", "true");
    try {
      hidePaste();
      resetProgress();
      if (!hasChromeDownloads()) {
        showStatus("\u672C\u5730\u4E0B\u8F7D\u5931\u8D25\u3002", "danger");
        showPasteCta();
        return;
      }
      setProgress(0.2);
      const fixtureUrl = chrome.runtime.getURL("fixtures/tracer.json");
      const res = await fetch(fixtureUrl);
      if (!res.ok) throw new Error("fixture missing");
      setProgress(0.55);
      const payload = await res.json();
      assertGoldPayload(payload);
      setProgress(0.8);
      await downloadJson(payload, FIXTURE_FILENAME);
      markProgressComplete();
      showStatus(`\u5DF2\u4E0B\u8F7D ${FIXTURE_FILENAME}`, "ok");
    } catch {
      resetProgress();
      showStatus("\u672C\u5730\u4E0B\u8F7D\u5931\u8D25\u3002", "danger");
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
})();
