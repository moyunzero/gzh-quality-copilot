import {
  BG_CANCEL_MULTI_MESSAGE,
  BG_MULTI_STATUS_MESSAGE,
  BG_START_MULTI_MESSAGE,
  EXTRACT_PAGE_META_MESSAGE,
  FIXTURE_FILENAME,
  createMultiStartGate,
  normalizeArticles,
  runUrlMultiExportLoop,
  tabWaitShouldFinish,
  type PageMetaReply,
} from "./logic";

/** Cancel flag for the in-flight background multi-export loop. */
let multiCancelled = false;
const multiGate = createMultiStartGate();

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

/** Wait until the tab reports status complete (loading optional — avoids missed races). */
function waitTabNavigateComplete(tabId: number, timeoutMs = 25000): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      chrome.tabs.onUpdated.removeListener(onUpdated);
      reject(new Error("tab load timeout"));
    }, timeoutMs);

    function finish(): void {
      if (done) return;
      done = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      resolve();
    }

    function onUpdated(id: number, info: chrome.tabs.TabChangeInfo): void {
      if (id !== tabId) return;
      if (tabWaitShouldFinish(info.status, undefined)) finish();
    }

    chrome.tabs.onUpdated.addListener(onUpdated);
    void chrome.tabs
      .get(tabId)
      .then((tab) => {
        if (tabWaitShouldFinish(undefined, tab.status)) finish();
      })
      .catch(() => {
        /* tab may be gone; let timeout handle */
      });
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
  const keepAlive = setInterval(() => {
    void chrome.runtime.getPlatformInfo();
  }, 15000);

  try {
    const articles = await runUrlMultiExportLoop({
      fetchMeta: () => fetchPageMeta(tabId),
      navigate: async (nextUrl) => {
        await chrome.tabs.update(tabId, { url: nextUrl });
      },
      waitAfterNavigate: async () => {
        await waitTabNavigateComplete(tabId);
        // Allow WeUI list + embedded publish_list to settle after reload.
        await delay(800);
      },
      shouldAbort: () => multiCancelled,
    });

    if (articles.length > 0) {
      try {
        await downloadJson(normalizeArticles(articles), FIXTURE_FILENAME);
      } catch {
        /* hybrid: no popup surface for download errors */
      }
    }
  } finally {
    clearInterval(keepAlive);
    multiGate.release();
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
    const gate = multiGate.accept();
    if (!gate.ok) {
      sendResponse({ ok: false, error: gate.error });
      return;
    }
    // Clear cancel before ack so a cancel between ack and loop start is not wiped.
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
