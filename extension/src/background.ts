import {
  BG_CANCEL_MULTI_MESSAGE,
  BG_START_MULTI_MESSAGE,
  CANCEL_MULTI_MESSAGE,
  EXTRACT_MULTI_MESSAGE,
  FIXTURE_FILENAME,
  normalizeArticles,
  type MultiExtractReply,
  type RawRow,
} from "./logic";

async function downloadJson(payload: unknown, filename: string): Promise<void> {
  const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`;
  await chrome.downloads.download({
    url: dataUrl,
    filename,
    saveAs: false,
  });
}

async function runMultiExport(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content-list.js"],
  });
  const reply = (await chrome.tabs.sendMessage(tabId, {
    type: EXTRACT_MULTI_MESSAGE,
  })) as MultiExtractReply | undefined;

  if (!reply || typeof reply !== "object" || !("ok" in reply) || reply.ok === false) {
    return;
  }
  const raw: RawRow[] = reply.articles ?? [];
  if (raw.length === 0) return;
  const payload = normalizeArticles(raw);
  await downloadJson(payload, FIXTURE_FILENAME);
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
    // Ack immediately — popup may close when the tab is clicked during pagination.
    sendResponse({ ok: true, started: true });
    void runMultiExport(tabId);
    return;
  }

  if (type === BG_CANCEL_MULTI_MESSAGE) {
    if (typeof tabId === "number") {
      void chrome.tabs.sendMessage(tabId, { type: CANCEL_MULTI_MESSAGE }).catch(() => undefined);
    }
    sendResponse({ ok: true });
  }
});
