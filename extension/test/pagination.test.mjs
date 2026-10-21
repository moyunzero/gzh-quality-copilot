import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { findNextPageControl, mergePageRows, walkListPages } from "./content-list.mjs";
import { computeNextListPageUrl, totalPagesFromPagerText } from "./logic.mjs";

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

describe("popup cancel empty + end copy", () => {
  it("empty cancel shows paste CTA; end status mentions 末页", () => {
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    const finish = src.slice(src.indexOf("async function finishWithArticles"), src.indexOf("let cancelTabId"));
    assert.match(finish, /stopReason === "cancel"[\s\S]*showPasteCta\(\)/);
    assert.match(src, /已到末页/);
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
    assert.match(src, /multipageOpt\.checked/);
    const onExport = src.slice(src.indexOf("async function onExport"), src.indexOf("async function onCancel"));
    assert.match(onExport, /if \(!multi\)/);
    assert.match(onExport, /requestExtract/);
    assert.match(onExport, /startBackgroundMulti/);
  });
});

describe("background multi export", () => {
  it("service worker paginates via begin URL and downloads without awaiting popup", () => {
    const src = readFileSync(join(root, "src/background.ts"), "utf8");
    const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
    assert.equal(manifest.background?.service_worker, "background.js");
    assert.match(src, /BG_START_MULTI_MESSAGE/);
    assert.match(src, /EXTRACT_PAGE_META_MESSAGE/);
    assert.match(src, /tabs\.update/);
    assert.match(src, /chrome\.downloads\.download/);
    assert.match(src, /sendResponse\(\{ ok: true, started: true \}\)/);
    assert.match(src, /getPlatformInfo/);
  });
});
