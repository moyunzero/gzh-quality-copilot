import {
  BG_CANCEL_MULTI_MESSAGE,
  BG_START_MULTI_MESSAGE,
  EXTRACT_PAGE_META_MESSAGE,
  FIXTURE_FILENAME,
  MULTI_PAGE_CAP,
  mergePageRows,
  normalizeArticles,
  type PageMetaReply,
  type RawRow,
} from "./logic";

/** Cancel flag for the in-flight background multi-export loop. */
let multiCancelled = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadJson(payload: unknown, filename: string): Promise<void> {
  const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`;
  await chrome.downloads.download({
    url: dataUrl,
    filename,
    saveAs: false,
  });
}

/** Wait until the tab finishes a navigation (loading → complete). */
function waitTabNavigateComplete(tabId: number, timeoutMs = 25000): Promise<void> {
  return new Promise((resolve, reject) => {
    let sawLoading = false;
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      reject(new Error("tab load timeout"));
    }, timeoutMs);

    function onUpdated(id: number, info: chrome.tabs.TabChangeInfo): void {
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

async function fetchPageMeta(tabId: number): Promise<PageMetaReply> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content-list.js"],
  });

  let lastErr: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    await delay(350 + attempt * 150);
    try {
      return (await chrome.tabs.sendMessage(tabId, {
        type: EXTRACT_PAGE_META_MESSAGE,
      })) as PageMetaReply;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? "page meta failed"));
}

/**
 * Drive pagination via begin/count URL navigation (WeChat list does full reload).
 * Keeps the service worker alive with a short interval ping.
 */
async function runMultiExport(tabId: number): Promise<void> {
  multiCancelled = false;
  const keepAlive = setInterval(() => {
    void chrome.runtime.getPlatformInfo();
  }, 15000);

  let articles: RawRow[] = [];

  try {
    for (let i = 0; i < MULTI_PAGE_CAP; i++) {
      if (multiCancelled) break;

      let meta: PageMetaReply;
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
      // Allow WeUI list + embedded publish_list to settle after reload.
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
  const type = (message as { type?: string }).type;
  const tabId = (message as { tabId?: number }).tabId;

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
