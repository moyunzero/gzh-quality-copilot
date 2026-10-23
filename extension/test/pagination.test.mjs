import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { findNextPageControl, mergePageRows, walkListPages } from "./content-list.mjs";
import {
  EXTRACT_PAGE_META_MESSAGE,
  buildPageMetaOk,
  collapseNearDupRows,
  computeNextListPageUrl,
  createMultiStartGate,
  isShareArticleUrl,
  mergePageRows as mergePageRowsLogic,
  normalizeArticles,
  popupExportKind,
  preferNearDupRow,
  runUrlMultiExportLoop,
  sanitizeExportTitle,
  tabWaitShouldFinish,
  totalPagesFromPagerText,
} from "./logic.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("computeNextListPageUrl", () => {
  it("advances begin by count until last page", () => {
    const base =
      "https://mp.weixin.qq.com/cgi-bin/appmsgpublish?sub=list&begin=0&count=10&token=t&lang=zh_CN";
    const nums = ["1", "2", "16"];
    assert.equal(totalPagesFromPagerText(nums), 16);
    const next = computeNextListPageUrl(base, nums);
    assert.ok(next);
    assert.match(next, /begin=10/);
    const last =
      "https://mp.weixin.qq.com/cgi-bin/appmsgpublish?sub=list&begin=150&count=10&token=t&lang=zh_CN";
    assert.equal(computeNextListPageUrl(last, nums), null);
  });

  it("returns null for non-mp hosts", () => {
    assert.equal(computeNextListPageUrl("https://example.com/?begin=0&count=10", ["1", "2"]), null);
  });
});

describe("mergePageRows", () => {
  it("grows across pages and skips duplicate titles", () => {
    const page1 = [{ title: "甲" }, { title: "乙" }];
    const page2 = [{ title: "乙" }, { title: "丙" }];
    const merged = mergePageRows(page1, page2);
    assert.equal(merged.length, 3);
    assert.deepEqual(
      merged.map((r) => r.title),
      ["甲", "乙", "丙"],
    );
  });
});

describe("export title sanitize + near-dup collapse", () => {
  const share = "https://mp.weixin.qq.com/s/fullArticleId";
  const tempkey =
    "https://mp.weixin.qq.com/cgi-bin/appmsg?action=list_card&tempkey=abc123&token=t";

  it("sanitizeExportTitle strips 已修改 / 已修改… and keeps stem", () => {
    assert.equal(sanitizeExportTitle("标题已修改"), "标题");
    assert.equal(sanitizeExportTitle("标题已修改…"), "标题");
    assert.equal(sanitizeExportTitle("标题 已修改..."), "标题");
    assert.equal(sanitizeExportTitle("标题  原创"), "标题");
    assert.equal(sanitizeExportTitle("  foo   bar  已修改…"), "foo bar");
  });

  it("isShareArticleUrl accepts /s/ and /s?", () => {
    assert.equal(isShareArticleUrl("https://mp.weixin.qq.com/s/abc"), true);
    assert.equal(isShareArticleUrl("https://mp.weixin.qq.com/s?__biz=x&mid=1"), true);
    assert.equal(isShareArticleUrl(tempkey), false);
  });

  it("preferNearDupRow: /s/ wins, else longer title, else first-seen", () => {
    const truncated = { title: "厨房沙漏底座", url: tempkey };
    const fuller = { title: "厨房沙漏底座里还有一张卡", url: share };
    assert.equal(preferNearDupRow(truncated, fuller), fuller);
    assert.equal(preferNearDupRow(fuller, truncated), fuller);

    const shortShare = { title: "同一标题已修改", url: share };
    const longTemp = { title: "同一标题加长后缀说明", url: tempkey };
    assert.equal(preferNearDupRow(longTemp, shortShare), shortShare);

    const a = { title: "够长前缀标题甲", url: tempkey };
    const b = { title: "够长前缀标题甲乙", url: tempkey };
    assert.equal(preferNearDupRow(a, b), b);
    assert.equal(preferNearDupRow(b, a), b);
  });

  it("collapseNearDupRows keeps one preferred row for truncated+tempkey vs fuller+/s/", () => {
    const rows = [
      { title: "厨房沙漏底座里还有", url: tempkey, read_count: 1 },
      { title: "厨房沙漏底座里还有一张卡", url: share, read_count: 9 },
    ];
    const collapsed = collapseNearDupRows(rows);
    assert.equal(collapsed.length, 1);
    assert.equal(collapsed[0].url, share);
    assert.equal(collapsed[0].title, "厨房沙漏底座里还有一张卡");
  });

  it("collapseNearDupRows absorbs two tempkey prefix rows when a later /s/ arrives", () => {
    const temp2 =
      "https://mp.weixin.qq.com/cgi-bin/appmsg?action=list_card&tempkey=def456&token=t";
    const rows = [
      { title: "厨房沙漏底座里还有", url: tempkey },
      { title: "厨房沙漏底座里还有一张", url: temp2 },
      { title: "厨房沙漏底座里还有一张卡", url: share },
    ];
    const collapsed = collapseNearDupRows(rows);
    assert.equal(collapsed.length, 1);
    assert.equal(collapsed[0].url, share);
    assert.equal(collapsed[0].title, "厨房沙漏底座里还有一张卡");

    const { articles } = normalizeArticles(rows);
    assert.equal(articles.length, 1);
    assert.equal(articles[0].url, share);
  });

  it("mergePageRows collapses near-dups with /s/ preference", () => {
    const merged = mergePageRowsLogic(
      [{ title: "计时器跳的是隔壁", url: tempkey }],
      [{ title: "计时器跳的是隔壁那张卡", url: share }],
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0].url, share);
  });

  it("distinct articles stay both when titles and URLs differ", () => {
    const a = { title: "第一篇完全不同", url: "https://mp.weixin.qq.com/s/aaa" };
    const b = { title: "第二篇完全不同", url: "https://mp.weixin.qq.com/s/bbb" };
    assert.equal(collapseNearDupRows([a, b]).length, 2);
    assert.equal(mergePageRowsLogic([a], [b]).length, 2);
  });

  it("normalizeArticles strips 已修改 and collapses near-dups for all export paths", () => {
    const { articles } = normalizeArticles([
      {
        title: "厨房沙漏底座里还有 已修改…",
        url: tempkey,
        read_count: 1,
        like_count: 0,
        share_count: 0,
        wow_count: 0,
      },
      {
        title: "厨房沙漏底座里还有一张卡",
        url: share,
        read_count: 9,
        like_count: 1,
        share_count: 0,
        wow_count: 0,
      },
    ]);
    assert.equal(articles.length, 1);
    assert.equal(articles[0].title, "厨房沙漏底座里还有一张卡");
    assert.equal(articles[0].url, share);
    assert.equal(articles[0].read_count, 9);
    assert.ok(articles[0]._missing.includes("body"));
  });
});

describe("findNextPageControl", () => {
  it("skips disabled 下一页 and returns a later enabled control", () => {
    const disabled = {
      textContent: "下一页",
      className: "disabled",
      disabled: true,
      getAttribute: (name) => (name === "aria-disabled" ? "true" : null),
    };
    const enabled = {
      textContent: "下一页",
      className: "",
      disabled: false,
      getAttribute: () => null,
    };
    const root = {
      querySelectorAll: () => [disabled, enabled],
    };
    assert.equal(findNextPageControl(root), enabled);
  });

  it("returns null when only disabled next exists", () => {
    const disabled = {
      textContent: "下一页",
      className: "weui-desktop-pagination__nav_disabled",
      disabled: true,
      getAttribute: (name) => (name === "aria-disabled" ? "true" : null),
    };
    const root = {
      querySelectorAll: (sel) => (sel.includes("button") || sel.includes("a,") ? [disabled] : []),
      querySelector: () => null,
    };
    assert.equal(findNextPageControl(root), null);
  });

  it("picks last non-prev WeUI mini button as next", () => {
    const prev = {
      textContent: "上一页",
      className: "weui-desktop-btn weui-desktop-btn_default weui-desktop-btn_mini",
      disabled: false,
      getAttribute: () => null,
    };
    const next = {
      textContent: "",
      className: "weui-desktop-btn weui-desktop-btn_default weui-desktop-btn_mini",
      disabled: false,
      getAttribute: () => null,
    };
    const pager = {
      querySelector: () => null,
      querySelectorAll: (sel) => {
        if (sel.includes("btn_mini")) return [prev, next];
        if (sel.includes("pagination__num")) return [];
        return [];
      },
    };
    const root = {
      querySelectorAll: (sel) => (sel.includes("a, button") ? [] : []),
      querySelector: (sel) => (sel.includes("pagination") ? pager : null),
    };
    assert.equal(findNextPageControl(root), next);
  });
});

describe("walkListPages", () => {
  it("unchecked path equivalent: one extract when no next", async () => {
    let extracts = 0;
    const result = await walkListPages({
      extract: () => {
        extracts += 1;
        return [{ title: `仅一页-${extracts}` }];
      },
      findNext: () => null,
      clickNext: async () => {},
      waitAfterClick: async () => {},
      shouldAbort: () => false,
    });
    assert.equal(result.pagesWalked, 1);
    assert.equal(result.articles.length, 1);
    assert.equal(result.stopReason, "end");
    assert.equal(extracts, 1);
  });

  it("multi-page merge yields more rows than page one", async () => {
    const pages = [[{ title: "P1A" }, { title: "P1B" }], [{ title: "P2A" }, { title: "P2B" }]];
    let idx = 0;
    let nextEl = { id: "next" };
    const result = await walkListPages({
      extract: () => pages[Math.min(idx, pages.length - 1)],
      findNext: () => (idx < pages.length - 1 ? nextEl : null),
      clickNext: async () => {
        idx += 1;
      },
      waitAfterClick: async () => {},
      shouldAbort: () => false,
      maxPages: 10,
    });
    assert.ok(result.articles.length > pages[0].length);
    assert.equal(result.articles.length, 4);
    assert.equal(result.stopReason, "end");
    assert.ok(result.pagesWalked >= 2);
  });

  it("cancel mid-run stops with cancel reason", async () => {
    let extracts = 0;
    let abort = false;
    const result = await walkListPages({
      extract: () => {
        extracts += 1;
        if (extracts === 1) abort = true;
        return [{ title: `R${extracts}` }];
      },
      findNext: () => ({ id: "next" }),
      clickNext: async () => {},
      waitAfterClick: async () => {},
      shouldAbort: () => abort,
      maxPages: 10,
    });
    assert.equal(result.stopReason, "cancel");
    assert.ok(result.articles.length >= 1);
  });

  it("treats click-with-no-list-change as soft-fail error not end", async () => {
    const result = await walkListPages({
      extract: () => [{ title: "同页" }],
      findNext: () => ({ id: "next" }),
      clickNext: async () => {},
      waitAfterClick: async () => {},
      shouldAbort: () => false,
      maxPages: 10,
    });
    assert.equal(result.stopReason, "error");
    assert.equal(result.articles.length, 1);
  });
});

describe("popupExportKind", () => {
  it("maps checkbox to single vs background-multi (opt-in cannot invert silently)", () => {
    assert.equal(popupExportKind(false), "single");
    assert.equal(popupExportKind(true), "background-multi");
  });
});

describe("popup cancel unlock", () => {
  it("onCancel requires ack, shows 已取消, waits SW idle, then clears busy", () => {
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    const onCancel = src.slice(src.indexOf("async function onCancel"), src.indexOf("async function onFixtureExport"));
    assert.match(onCancel, /requestCancel/);
    assert.match(onCancel, /waitMultiIdle/);
    assert.match(onCancel, /BG_MULTI_STATUS_MESSAGE|waitMultiIdle/);
    assert.match(onCancel, /取消失败/);
    assert.match(onCancel, /setBusy\(false\)/);
    assert.match(onCancel, /已取消/);
    assert.ok(onCancel.indexOf("waitMultiIdle") < onCancel.lastIndexOf("setBusy(false)"));
    assert.doesNotMatch(src, /finishWithArticles|stopReasonMessage/);
  });
});

describe("popup multipage UI wiring", () => {
  it("ships checkbox and cancel control; default export stays single-page unless opt-in", () => {
    const html = readFileSync(join(root, "popup.html"), "utf8");
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    assert.match(html, /id="multipage-opt"/);
    assert.match(html, /翻完所有页/);
    assert.match(html, /id="cancel-btn"/);
    assert.match(src, /BG_START_MULTI_MESSAGE/);
    assert.match(src, /BG_CANCEL_MULTI_MESSAGE/);
    assert.match(src, /popupExportKind\(multipageOpt\.checked\)/);
    const onExport = src.slice(src.indexOf("async function onExport"), src.indexOf("async function onCancel"));
    assert.match(onExport, /kind === "single"/);
    assert.match(onExport, /requestExtract/);
    assert.match(onExport, /startBackgroundMulti/);
    const singleBlock = onExport.slice(
      onExport.indexOf('if (kind === "single")'),
      onExport.indexOf("showStatus(\"正在翻页导出"),
    );
    assert.match(singleBlock, /requestExtract/);
    assert.doesNotMatch(singleBlock, /startBackgroundMulti/);
  });
});

describe("buildPageMetaOk / EXTRACT_PAGE_META", () => {
  it("returns articles + nextUrl shape used by page-meta message", () => {
    const href =
      "https://mp.weixin.qq.com/cgi-bin/appmsgpublish?sub=list&begin=0&count=10&token=t&lang=zh_CN";
    const meta = buildPageMetaOk(href, [{ title: "甲" }], ["1", "2", "3"], 1);
    assert.equal(meta.ok, true);
    assert.equal(meta.articles.length, 1);
    assert.ok(meta.nextUrl);
    assert.match(meta.nextUrl, /begin=10/);
    assert.equal(meta.pageNow, 1);
    assert.equal(meta.totalPages, 3);
  });

  it("content message API answers EXTRACT_PAGE_META_MESSAGE", () => {
    assert.equal(EXTRACT_PAGE_META_MESSAGE, "EXTRACT_LIST_PAGE_META");
    const src = readFileSync(join(root, "src/content-list.ts"), "utf8");
    assert.match(src, /type === EXTRACT_PAGE_META_MESSAGE[\s\S]*sendResponse\(handlePageMeta\(\)\)/);
    assert.match(src, /buildPageMetaOk/);
  });
});

describe("runUrlMultiExportLoop", () => {
  it("navigates and merges multiple pages then stops without nextUrl", async () => {
    const pages = [
      { ok: true, articles: [{ title: "P1A" }, { title: "P1B" }], nextUrl: "https://mp.weixin.qq.com/cgi-bin/appmsgpublish?begin=10&count=10", pageNow: 1, totalPages: 2 },
      { ok: true, articles: [{ title: "P2A" }], nextUrl: null, pageNow: 2, totalPages: 2 },
    ];
    let idx = 0;
    const navigated = [];
    const articles = await runUrlMultiExportLoop({
      fetchMeta: async () => pages[idx++],
      navigate: async (url) => {
        navigated.push(url);
      },
      waitAfterNavigate: async () => {},
      shouldAbort: () => false,
    });
    assert.equal(articles.length, 3);
    assert.equal(navigated.length, 1);
    assert.match(navigated[0], /begin=10/);
  });

  it("cancel flag stops further navigate after first page", async () => {
    let abort = false;
    let fetches = 0;
    const navigated = [];
    const articles = await runUrlMultiExportLoop({
      fetchMeta: async () => {
        fetches += 1;
        if (fetches === 1) abort = true;
        return {
          ok: true,
          articles: [{ title: `R${fetches}` }],
          nextUrl: "https://mp.weixin.qq.com/cgi-bin/appmsgpublish?begin=10&count=10",
          pageNow: fetches,
          totalPages: 5,
        };
      },
      navigate: async (url) => {
        navigated.push(url);
      },
      waitAfterNavigate: async () => {},
      shouldAbort: () => abort,
    });
    assert.equal(articles.length, 1);
    assert.equal(navigated.length, 0);
  });

  it("navigate rejection returns partial merge without throwing", async () => {
    const articles = await runUrlMultiExportLoop({
      fetchMeta: async () => ({
        ok: true,
        articles: [{ title: "P1" }],
        nextUrl: "https://mp.weixin.qq.com/cgi-bin/appmsgpublish?begin=10&count=10",
        pageNow: 1,
        totalPages: 3,
      }),
      navigate: async () => {
        throw new Error("tabs.update failed");
      },
      waitAfterNavigate: async () => {},
      shouldAbort: () => false,
    });
    assert.equal(articles.length, 1);
    assert.equal(articles[0].title, "P1");
  });
});

describe("createMultiStartGate", () => {
  it("rejects second accept while in flight and allows after release", () => {
    const gate = createMultiStartGate();
    assert.deepEqual(gate.accept(), { ok: true });
    assert.equal(gate.inFlight(), true);
    assert.deepEqual(gate.accept(), { ok: false, error: "busy" });
    gate.release();
    assert.equal(gate.inFlight(), false);
    assert.deepEqual(gate.accept(), { ok: true });
  });
});

describe("tabWaitShouldFinish", () => {
  it("resolves on complete event or already-complete snapshot without prior loading", () => {
    assert.equal(tabWaitShouldFinish("complete", undefined), true);
    assert.equal(tabWaitShouldFinish(undefined, "complete"), true);
    assert.equal(tabWaitShouldFinish("loading", "loading"), false);
    assert.equal(tabWaitShouldFinish(undefined, "loading"), false);
  });
});

describe("background multi export", () => {
  it("service worker uses runUrlMultiExportLoop, gate, and downloads without awaiting popup", () => {
    const src = readFileSync(join(root, "src/background.ts"), "utf8");
    const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
    assert.equal(manifest.background?.service_worker, "background.js");
    assert.match(src, /BG_START_MULTI_MESSAGE/);
    assert.match(src, /BG_MULTI_STATUS_MESSAGE/);
    assert.match(src, /EXTRACT_PAGE_META_MESSAGE/);
    assert.match(src, /runUrlMultiExportLoop/);
    assert.match(src, /createMultiStartGate|multiGate/);
    assert.match(src, /multiCancelled = false/);
    assert.match(src, /tabs\.update/);
    assert.match(src, /chrome\.downloads\.download/);
    assert.match(src, /sendResponse\(\{ ok: true, started: true \}\)/);
    assert.match(src, /getPlatformInfo/);
    assert.match(src, /tabWaitShouldFinish/);
    assert.doesNotMatch(src, /sawLoading/);
    // Cancel clear happens before started ack, not at runMultiExport entry.
    assert.match(
      src,
      /multiCancelled = false;\s*sendResponse\(\{ ok: true, started: true \}\)/,
    );
    const runBody = src.slice(src.indexOf("async function runMultiExport"), src.indexOf("chrome.runtime.onMessage"));
    assert.doesNotMatch(runBody, /multiCancelled = false/);
  });
});
