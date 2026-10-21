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
  var BG_START_MULTI_MESSAGE = "BG_START_MULTI_EXPORT";
  var BG_CANCEL_MULTI_MESSAGE = "BG_CANCEL_MULTI_EXPORT";
  var EXTRACT_PAGE_META_MESSAGE = "EXTRACT_LIST_PAGE_META";
  var MULTI_PAGE_CAP = 50;
  function rowDedupeKey(row) {
    const title = String(row.title ?? "").trim().replace(/\s+/g, " ").replace(/\s*原创\s*$/u, "").trim();
    if (!title) return "";
    const url = typeof row.url === "string" ? row.url.trim() : "";
    return url ? `${title}\0${url}` : title;
  }
  function mergePageRows(acc, page) {
    const seen = new Set(acc.map(rowDedupeKey).filter(Boolean));
    const out = [...acc];
    for (const row of page) {
      const key = rowDedupeKey(row);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(row);
    }
    return out;
  }
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

  // src/background.ts
  var multiCancelled = false;
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function downloadJson(payload, filename) {
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`;
    await chrome.downloads.download({
      url: dataUrl,
      filename,
      saveAs: false
    });
  }
  function waitTabNavigateComplete(tabId, timeoutMs = 25e3) {
    return new Promise((resolve, reject) => {
      let sawLoading = false;
      const timer = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        reject(new Error("tab load timeout"));
      }, timeoutMs);
      function onUpdated(id, info) {
        if (id !== tabId) return;
        if (info.status === "loading") sawLoading = true;
        if (info.status === "complete" && sawLoading) {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve();
        }
      }
      chrome.tabs.onUpdated.addListener(onUpdated);
    });
  }
  async function fetchPageMeta(tabId) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-list.js"]
    });
    let lastErr;
    for (let attempt = 0; attempt < 6; attempt++) {
      await delay(350 + attempt * 150);
      try {
        return await chrome.tabs.sendMessage(tabId, {
          type: EXTRACT_PAGE_META_MESSAGE
        });
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? "page meta failed"));
  }
  async function runMultiExport(tabId) {
    multiCancelled = false;
    const keepAlive = setInterval(() => {
      void chrome.runtime.getPlatformInfo();
    }, 15e3);
    let articles = [];
    try {
      for (let i = 0; i < MULTI_PAGE_CAP; i++) {
        if (multiCancelled) break;
        let meta;
        try {
          meta = await fetchPageMeta(tabId);
        } catch {
          break;
        }
        if (!meta || meta.ok === false) break;
        articles = mergePageRows(articles, meta.articles ?? []);
        if (!meta.nextUrl) break;
        if (multiCancelled) break;
        await chrome.tabs.update(tabId, { url: meta.nextUrl });
        try {
          await waitTabNavigateComplete(tabId);
        } catch {
          break;
        }
        await delay(800);
      }
      if (articles.length > 0) {
        await downloadJson(normalizeArticles(articles), FIXTURE_FILENAME);
      }
    } finally {
      clearInterval(keepAlive);
    }
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;
    const type = message.type;
    const tabId = message.tabId;
    if (type === BG_START_MULTI_MESSAGE) {
      if (typeof tabId !== "number") {
        sendResponse({ ok: false, error: "missing tabId" });
        return;
      }
      sendResponse({ ok: true, started: true });
      void runMultiExport(tabId);
      return;
    }
    if (type === BG_CANCEL_MULTI_MESSAGE) {
      multiCancelled = true;
      sendResponse({ ok: true });
    }
  });
})();
