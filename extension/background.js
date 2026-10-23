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
  var BG_MULTI_STATUS_MESSAGE = "BG_MULTI_EXPORT_STATUS";
  var EXTRACT_PAGE_META_MESSAGE = "EXTRACT_LIST_PAGE_META";
  var MULTI_PAGE_CAP = 50;
  function sanitizeExportTitle(title) {
    return String(title ?? "").trim().replace(/\s+/g, " ").replace(/\s*原创\s*$/u, "").replace(/\s*已修改(?:…|\.{1,3})?\s*$/u, "").trim();
  }
  function isShareArticleUrl(url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== "mp.weixin.qq.com") return false;
      return parsed.pathname === "/s" || parsed.pathname.startsWith("/s/");
    } catch {
      return false;
    }
  }
  function rowDedupeKey(row) {
    const title = sanitizeExportTitle(String(row.title ?? ""));
    if (!title) return "";
    const url = typeof row.url === "string" ? row.url.trim() : "";
    return url ? `${title}\0${url}` : title;
  }
  function rowTitle(row) {
    return sanitizeExportTitle(String(row.title ?? ""));
  }
  function rowUrl(row) {
    return typeof row.url === "string" ? row.url.trim() : "";
  }
  function titlesAreNearDup(a, b) {
    const ta = sanitizeExportTitle(a);
    const tb = sanitizeExportTitle(b);
    if (!ta || !tb) return false;
    if (ta === tb) return true;
    const shorter = ta.length <= tb.length ? ta : tb;
    const longer = ta.length <= tb.length ? tb : ta;
    return shorter.length >= 6 && longer.startsWith(shorter);
  }
  function rowsAreNearDup(a, b) {
    const ta = rowTitle(a);
    const tb = rowTitle(b);
    if (!titlesAreNearDup(ta, tb)) return false;
    const ua = rowUrl(a);
    const ub = rowUrl(b);
    if (!ua || !ub) return ta === tb;
    if (ua === ub) return true;
    return isShareArticleUrl(ua) !== isShareArticleUrl(ub);
  }
  function preferNearDupRow(a, b) {
    const ua = rowUrl(a);
    const ub = rowUrl(b);
    const aShare = Boolean(ua) && isShareArticleUrl(ua);
    const bShare = Boolean(ub) && isShareArticleUrl(ub);
    if (aShare && !bShare) return a;
    if (bShare && !aShare) return b;
    const ta = rowTitle(a);
    const tb = rowTitle(b);
    if (tb.length > ta.length) return b;
    return a;
  }
  function collapseNearDupRowsOnce(rows) {
    const out = [];
    for (const row of rows) {
      let idx = -1;
      for (let i = 0; i < out.length; i++) {
        if (rowsAreNearDup(out[i], row)) {
          idx = i;
          break;
        }
      }
      if (idx < 0) {
        out.push(row);
        continue;
      }
      out[idx] = preferNearDupRow(out[idx], row);
    }
    return out;
  }
  function collapseNearDupRows(rows) {
    let out = rows;
    let prevLen = -1;
    while (out.length !== prevLen) {
      prevLen = out.length;
      out = collapseNearDupRowsOnce(out);
    }
    return out;
  }
  function mergePageRows(acc, page) {
    const seen = new Set(acc.map(rowDedupeKey).filter(Boolean));
    const out = [...acc];
    for (const row of page) {
      const key = rowDedupeKey(row);
      if (!key || seen.has(key)) continue;
      let nearIdx = -1;
      for (let i = 0; i < out.length; i++) {
        if (rowsAreNearDup(out[i], row)) {
          nearIdx = i;
          break;
        }
      }
      if (nearIdx >= 0) {
        const prev = out[nearIdx];
        const winner = preferNearDupRow(prev, row);
        if (winner !== prev) {
          const prevKey = rowDedupeKey(prev);
          if (prevKey) seen.delete(prevKey);
          out[nearIdx] = winner;
          seen.add(rowDedupeKey(winner));
        }
        continue;
      }
      seen.add(key);
      out.push(row);
    }
    return out;
  }
  function createMultiStartGate() {
    let inFlight = false;
    return {
      inFlight: () => inFlight,
      accept: () => {
        if (inFlight) return { ok: false, error: "busy" };
        inFlight = true;
        return { ok: true };
      },
      release: () => {
        inFlight = false;
      }
    };
  }
  function tabWaitShouldFinish(eventStatus, currentStatus) {
    return eventStatus === "complete" || currentStatus === "complete";
  }
  async function runUrlMultiExportLoop(deps) {
    let articles = [];
    const maxPages = deps.maxPages ?? MULTI_PAGE_CAP;
    for (let i = 0; i < maxPages; i++) {
      if (deps.shouldAbort()) break;
      let meta;
      try {
        meta = await deps.fetchMeta();
      } catch {
        break;
      }
      if (!meta || meta.ok === false) break;
      const page = Array.isArray(meta.articles) ? meta.articles : [];
      articles = mergePageRows(articles, page);
      if (!meta.nextUrl) break;
      if (deps.shouldAbort()) break;
      try {
        await deps.navigate(meta.nextUrl);
        await deps.waitAfterNavigate();
      } catch {
        break;
      }
    }
    return articles;
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
      if (key === "title") {
        const cleaned = sanitizeExportTitle(String(value));
        if (!cleaned) {
          out._missing.push(key);
        } else {
          out.title = cleaned;
        }
        continue;
      }
      out[key] = String(value);
    }
    return out;
  }
  function normalizeArticles(rawRows) {
    return { articles: collapseNearDupRows(rawRows.map(normalizeArticle)) };
  }

  // src/background.ts
  var multiCancelled = false;
  var multiGate = createMultiStartGate();
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
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        chrome.tabs.onUpdated.removeListener(onUpdated);
        reject(new Error("tab load timeout"));
      }, timeoutMs);
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }
      function onUpdated(id, info) {
        if (id !== tabId) return;
        if (tabWaitShouldFinish(info.status, void 0)) finish();
      }
      chrome.tabs.onUpdated.addListener(onUpdated);
      void chrome.tabs.get(tabId).then((tab) => {
        if (tabWaitShouldFinish(void 0, tab.status)) finish();
      }).catch(() => {
      });
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
    const keepAlive = setInterval(() => {
      void chrome.runtime.getPlatformInfo();
    }, 15e3);
    try {
      const articles = await runUrlMultiExportLoop({
        fetchMeta: () => fetchPageMeta(tabId),
        navigate: async (nextUrl) => {
          await chrome.tabs.update(tabId, { url: nextUrl });
        },
        waitAfterNavigate: async () => {
          await waitTabNavigateComplete(tabId);
          await delay(800);
        },
        shouldAbort: () => multiCancelled
      });
      if (articles.length > 0) {
        try {
          await downloadJson(normalizeArticles(articles), FIXTURE_FILENAME);
        } catch {
        }
      }
    } finally {
      clearInterval(keepAlive);
      multiGate.release();
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
      const gate = multiGate.accept();
      if (!gate.ok) {
        sendResponse({ ok: false, error: gate.error });
        return;
      }
      multiCancelled = false;
      sendResponse({ ok: true, started: true });
      void runMultiExport(tabId);
      return;
    }
    if (type === BG_CANCEL_MULTI_MESSAGE) {
      multiCancelled = true;
      sendResponse({ ok: true });
      return;
    }
    if (type === BG_MULTI_STATUS_MESSAGE) {
      sendResponse({ ok: true, inFlight: multiGate.inFlight() });
    }
  });
})();
