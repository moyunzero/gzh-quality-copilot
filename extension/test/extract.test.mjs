import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  articlesFromEmbeddedPayload,
  coercePublishTime,
  extractArticlesFromHtml,
  mergeEmbeddedWithDom,
  metricsFromRowText,
  normalizeTitleForMatch,
  parseListJsonFromScriptText,
  resolveWechatRelativePublishTime,
} from "./content-list.mjs";
import { normalizeArticles } from "./logic.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("list fixture extract + normalize", () => {
  it("yields two articles with body in _missing and no body key", () => {
    const html = readFileSync(join(root, "fixtures/list-page.html"), "utf8");
    const raw = extractArticlesFromHtml(html);
    assert.equal(raw.length, 2);
    assert.equal(raw[0].title, "第一篇标题");
    assert.equal(raw[1].title, "第二篇标题");

    const { articles } = normalizeArticles(raw);
    assert.equal(articles.length, 2);
    for (const row of articles) {
      assert.equal("body" in row, false);
      assert.ok(row._missing.includes("body"));
    }
    assert.equal(articles[0].read_count, 100);
    assert.equal(typeof articles[0].read_count, "number");
  });

  it("falls back to DOM attribute rows when embedded JSON is absent", () => {
    const html = `
      <ul>
        <li class="mp-msg-item" data-title="仅 DOM 行" data-publish-time="2025-01-01" data-read-count="3"></li>
        <li class="mp-msg-item" data-title="第二行" data-read-count="7"></li>
      </ul>`;
    const raw = extractArticlesFromHtml(html);
    assert.equal(raw.length, 2);
    const { articles } = normalizeArticles(raw);
    assert.ok(articles[0]._missing.includes("body"));
    assert.equal(articles[0].title, "仅 DOM 行");
    assert.equal(articles[0].read_count, 3);
  });
});

describe("normalize _missing matrix", () => {
  it("always omits body and lists absent gold keys in _missing", () => {
    const { articles } = normalizeArticles([
      { title: "示例标题", publish_time: "2025-03-12", read_count: "100" },
    ]);
    const row = articles[0];
    assert.equal(row.title, "示例标题");
    assert.equal(row.read_count, 100);
    assert.equal("body" in row, false);
    assert.deepEqual(row._missing, [
      "like_count",
      "share_count",
      "wow_count",
      "url",
      "body",
    ]);
  });

  it("strips body even when raw row includes it", () => {
    const { articles } = normalizeArticles([{ title: "有正文", body: "不应出现" }]);
    assert.equal("body" in articles[0], false);
    assert.ok(articles[0]._missing.includes("body"));
  });
});

describe("empty extract → paste path", () => {
  it("normalize of empty extract is zero articles (no download payload)", () => {
    assert.deepEqual(normalizeArticles([]), { articles: [] });
    assert.equal(extractArticlesFromHtml("<html><body></body></html>").length, 0);
  });

  it("onExport maps zero articles to paste CTA without download", () => {
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    const fn = src.slice(src.indexOf("async function onExport"), src.indexOf("async function onFixtureExport"));
    assert.match(fn, /rawArticles\.length === 0/);
    assert.match(fn, /列表为空或无法解析/);
    const emptyBlock = fn.slice(
      fn.indexOf("rawArticles.length === 0"),
      fn.indexOf("normalizeArticles"),
    );
    assert.match(emptyBlock, /showPasteCta\(\)/);
    assert.match(emptyBlock, /return;/);
    assert.equal(emptyBlock.includes("downloadJson"), false);
  });

  it("onExport injects content-list when sendMessage fails, else asks to refresh", () => {
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    assert.match(src, /async function requestExtract/);
    assert.match(src, /chrome\.scripting\.executeScript/);
    assert.match(src, /files:\s*\["content-list\.js"\]/);
    const fn = src.slice(src.indexOf("async function onExport"), src.indexOf("async function onFixtureExport"));
    assert.match(fn, /请刷新已发表列表页后重试/);
  });
});

describe("double-busy guard", () => {
  it("ignores a second 导出 while exportRunning", () => {
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    assert.match(src, /let exportRunning = false/);
    assert.match(src, /aria-busy/);
    const onExport = src.slice(src.indexOf("async function onExport"), src.indexOf("async function onFixtureExport"));
    assert.match(onExport, /if \(exportRunning\) return;/);
    assert.match(onExport, /setBusy\(true(?:,\s*multi)?\)/);
    assert.match(onExport, /finally \{[\s\S]*setBusy\(false\)/);
  });
});

describe("nested app_msg_list JSON", () => {
  it("parses bracket-balanced objects with nested arrays", () => {
    const text = `var cgiData = {"meta":{"ok":1},"app_msg_list":[{"title":"嵌套标题","read_num":9,"tags":[{"k":1}]},{"title":"第二","read_num":2}]};`;
    const rows = parseListJsonFromScriptText(text);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].title, "嵌套标题");
    assert.equal(rows[0].read_count, 9);
  });

  it("maps nested appmsg_stat aliases onto count keys", () => {
    const rows = articlesFromEmbeddedPayload({
      app_msg_list: [
        {
          title: "有嵌套统计",
          link: "https://mp.weixin.qq.com/s/stat",
          appmsg_stat: { read_num: 42, like_num: 5, share_num: 1, looking_num: 2 },
        },
      ],
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].read_count, 42);
    assert.equal(rows[0].like_count, 5);
    assert.equal(rows[0].share_count, 1);
    assert.equal(rows[0].wow_count, 2);
  });
});

describe("embedded + DOM metrics merge", () => {
  it("fills counts from DOM when JSON has title/url only", () => {
    const html = readFileSync(join(root, "fixtures/list-page-metrics-dom.html"), "utf8");
    const raw = extractArticlesFromHtml(html);
    assert.equal(raw.length, 3);
    assert.equal(raw[0].url, "https://mp.weixin.qq.com/s/fixture-sand");
    assert.equal(raw[0].read_count, "1200");
    assert.equal(raw[0].like_count, "12");
    assert.equal(raw[1].read_count, "80");
    assert.equal(raw[1].wow_count, "2");
    assert.equal(raw[2].read_count, undefined);

    const { articles } = normalizeArticles(raw);
    assert.equal(articles[0].read_count, 1200);
    assert.equal(articles[0].like_count, 12);
    assert.equal(articles[0].share_count, 3);
    assert.equal(typeof articles[0].read_count, "number");
    assert.equal(articles[1].read_count, 80);
    assert.ok(articles[2]._missing.includes("read_count"));
    assert.ok(articles[2]._missing.includes("body"));
  });

  it("fills counts from WeUI appmsg-view inners + nested publish_info", () => {
    const html = readFileSync(join(root, "fixtures/list-page-metrics-weui.html"), "utf8");
    const raw = extractArticlesFromHtml(html);
    assert.equal(raw.length, 2);
    assert.equal(raw[0].url, "https://mp.weixin.qq.com/s/fixture-sand");
    assert.equal(raw[0].read_count, 1200);
    assert.equal(raw[0].like_count, 12);
    assert.equal(raw[0].share_count, 3);
    assert.equal(raw[0].wow_count, 1);
    assert.equal(raw[0].publish_time, "2024-10-15T21:46:40+08:00");
    assert.equal(raw[1].read_count, 80);
    assert.equal(raw[1].like_count, 2);
    assert.equal(raw[1].wow_count, 2);

    const { articles } = normalizeArticles(raw);
    assert.equal(articles[0].read_count, 1200);
    assert.equal(typeof articles[0].read_count, "number");
    assert.equal(articles[0].publish_time, "2024-10-15T21:46:40+08:00");
    assert.equal(articles[1].like_count, 2);
  });

  it("unwraps stringified publish_page → publish_info → appmsgex", () => {
    const rows = articlesFromEmbeddedPayload({
      publish_page: JSON.stringify({
        publish_list: [
          {
            publish_info: JSON.stringify({
              appmsgex: [
                {
                  title: "嵌套发表",
                  link: "https://mp.weixin.qq.com/s/nested",
                  create_time: 1700000000,
                },
              ],
            }),
          },
        ],
      }),
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, "嵌套发表");
    assert.equal(rows[0].url, "https://mp.weixin.qq.com/s/nested");
    assert.equal(rows[0].publish_time, "2023-11-15T06:13:20+08:00");
  });

  it("merges sparse app_msg_list with publish_list create_time", () => {
    const rows = articlesFromEmbeddedPayload({
      app_msg_list: [{ title: "同名篇", link: "https://mp.weixin.qq.com/s/a" }],
      publish_list: [
        {
          publish_info: JSON.stringify({
            appmsgex: [{ title: "同名篇  原创", link: "https://mp.weixin.qq.com/s/a", create_time: 1729000000 }],
          }),
        },
      ],
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].url, "https://mp.weixin.qq.com/s/a");
    assert.equal(rows[0].publish_time, "2024-10-15T21:46:40+08:00");
  });

  it("resolves WeChat relative publish_time UI strings to +08:00 ISO", () => {
    const now = new Date("2026-10-20T12:00:00+08:00");
    assert.equal(resolveWechatRelativePublishTime("今天22:00", now), "2026-10-20T22:00:00+08:00");
    assert.equal(resolveWechatRelativePublishTime("昨天22:00", now), "2026-10-19T22:00:00+08:00");
    assert.equal(resolveWechatRelativePublishTime("星期日22:00", now), "2026-10-18T22:00:00+08:00");
    assert.equal(resolveWechatRelativePublishTime("星期六09:29", now), "2026-10-17T09:29:00+08:00");
    assert.equal(resolveWechatRelativePublishTime("星期五17:53", now), "2026-10-16T17:53:00+08:00");
    assert.equal(resolveWechatRelativePublishTime("星期四22:00", now), "2026-10-15T22:00:00+08:00");
    assert.equal(resolveWechatRelativePublishTime("10月14日", now), "2026-10-14T00:00:00+08:00");
    assert.equal(coercePublishTime("今天12:55", now), "2026-10-20T12:55:00+08:00");
  });

  it("does not invent counts on title mismatch", () => {
    const merged = mergeEmbeddedWithDom(
      [{ title: "JSON 标题", url: "https://mp.weixin.qq.com/s/a" }],
      [{ title: "DOM 另一标题", read_count: "99" }],
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0].read_count, undefined);
    assert.equal(merged[0].url, "https://mp.weixin.qq.com/s/a");
  });

  it("normalizes trailing 原创 and whitespace for match only", () => {
    assert.equal(normalizeTitleForMatch("厨房沙漏底座里还有一张卡  原创"), "厨房沙漏底座里还有一张卡");
    assert.equal(normalizeTitleForMatch("  foo   bar  "), "foo bar");
  });

  it("keeps count _missing when neither JSON nor DOM provides it", () => {
    const { articles } = normalizeArticles([
      { title: "无指标", url: "https://mp.weixin.qq.com/s/none" },
    ]);
    assert.equal("read_count" in articles[0], false);
    assert.ok(articles[0]._missing.includes("read_count"));
    assert.ok(articles[0]._missing.includes("like_count"));
  });

  it("fills counts from plain-text row metrics when data-* attrs are absent", () => {
    const html = readFileSync(join(root, "fixtures/list-page-metrics-text.html"), "utf8");
    const raw = extractArticlesFromHtml(html);
    assert.equal(raw.length, 2);
    assert.equal(raw[0].read_count, 1200);
    assert.equal(raw[0].like_count, 12);
    assert.equal(raw[1].read_count, 80);
    const { articles } = normalizeArticles(raw);
    assert.equal(articles[0].read_count, 1200);
    assert.equal(typeof articles[0].read_count, "number");
  });

  it("parses leading engagement ints from row text", () => {
    const m = metricsFromRowText("厨房沙漏底座里还有一张卡\n原创\n1200 12 3 1", "厨房沙漏底座里还有一张卡");
    assert.equal(m.read_count, 1200);
    assert.equal(m.like_count, 12);
    assert.equal(m.share_count, 3);
    assert.equal(m.wow_count, 1);
  });

  it("strips title via normalized span so whitespace variants do not leak digits", () => {
    const m = metricsFromRowText(
      "标题  含  数字2024 与空格\n原创\n88 9 1 0",
      "标题 含 数字2024 与空格",
    );
    assert.equal(m.read_count, 88);
    assert.equal(m.like_count, 9);
  });

  it("skips years and month-day fragments when harvesting row ints", () => {
    const m = metricsFromRowText("厨房\n2024 03-15 1200 12 3 1", "厨房");
    assert.equal(m.read_count, 1200);
    assert.equal(m.like_count, 12);
    assert.equal(m.share_count, 3);
    assert.equal(m.wow_count, 1);
  });

  it("does not map comment_num to wow_count", () => {
    const rows = articlesFromEmbeddedPayload({
      app_msg_list: [{ title: "评论别名", comment_num: 99, looking_num: 2 }],
    });
    assert.equal(rows[0].wow_count, 2);
  });

  it("matches data-title before data-gzh-row / class on opening tags", () => {
    const html = `
      <script type="application/json" id="mp-list-embedded">
        {"app_msg_list":[{"title":"顺序测试","link":"https://mp.weixin.qq.com/s/order"}]}
      </script>
      <div data-title="顺序测试" data-gzh-row data-read-count="44"></div>
      <li data-title="另一篇" class="mp-msg-item" data-read-count="55"></li>`;
    const raw = extractArticlesFromHtml(html);
    assert.equal(raw[0].read_count, "44");
    assert.equal(raw.length, 1);
  });
});

describe("content script never navigates", () => {
  it("does not assign location or open article detail", () => {
    const src = readFileSync(join(root, "src/content-list.ts"), "utf8");
    assert.equal(src.includes("location.assign"), false);
    assert.equal(/location\.href\s*=/.test(src), false);
    assert.equal(src.includes("window.open"), false);
  });
});
