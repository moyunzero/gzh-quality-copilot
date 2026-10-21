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
  var EXTRACT_MULTI_MESSAGE = "EXTRACT_LIST_MULTI";
  var CANCEL_MULTI_MESSAGE = "CANCEL_LIST_MULTI";
  var BG_START_MULTI_MESSAGE = "BG_START_MULTI_EXPORT";
  var BG_CANCEL_MULTI_MESSAGE = "BG_CANCEL_MULTI_EXPORT";
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
  async function downloadJson(payload, filename) {
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`;
    await chrome.downloads.download({
      url: dataUrl,
      filename,
      saveAs: false
    });
  }
  async function runMultiExport(tabId) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-list.js"]
    });
    const reply = await chrome.tabs.sendMessage(tabId, {
      type: EXTRACT_MULTI_MESSAGE
    });
    if (!reply || typeof reply !== "object" || !("ok" in reply) || reply.ok === false) {
      return;
    }
    const raw = reply.articles ?? [];
    if (raw.length === 0) return;
    const payload = normalizeArticles(raw);
    await downloadJson(payload, FIXTURE_FILENAME);
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
      if (typeof tabId === "number") {
        void chrome.tabs.sendMessage(tabId, { type: CANCEL_MULTI_MESSAGE }).catch(() => void 0);
      }
      sendResponse({ ok: true });
    }
  });
})();
