import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { assertGoldPayload, exportIsOffList, fixtureDownloadPlan, isMpListUrl } from "./logic.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("off list page", () => {
  it("treats non-appmsg tabs as paste-only, no download", () => {
    assert.equal(exportIsOffList("https://example.com/"), true);
    assert.equal(exportIsOffList("https://mp.weixin.qq.com/cgi-bin/home"), true);
    assert.equal(isMpListUrl("https://mp.weixin.qq.com/cgi-bin/appmsg"), true);
    assert.equal(isMpListUrl("https://mp.weixin.qq.com/cgi-bin/appmsgpublish"), true);
    assert.equal(isMpListUrl("https://mp.weixin.qq.com/foo/appmsg"), false);
    assert.equal(exportIsOffList("https://mp.weixin.qq.com/cgi-bin/appmsg"), false);
  });

  it("shows the off-list error in danger color and paste CTA", () => {
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    const css = readFileSync(join(root, "popup.css"), "utf8");
    const fn = src.slice(src.indexOf("async function onExport"), src.indexOf("async function onFixtureExport"));
    const offListBlock = fn.match(/if \(!isMpListUrl\(tab\?\.url\)\) \{[\s\S]*?\n    \}/)?.[0] ?? "";
    assert.ok(offListBlock);
    assert.equal(offListBlock.includes("downloadJson"), false);
    assert.match(offListBlock, /showStatus\("当前不是已发表列表页。", "danger"\)/);
    assert.match(offListBlock, /showPasteCta\(\)/);
    assert.match(css, /\.status\.is-danger\s*\{\s*color:\s*var\(--danger\)/);
  });
});

describe("fixture download", () => {
  it("packages gold-shaped articles JSON for local download", () => {
    const payload = JSON.parse(readFileSync(join(root, "fixtures/tracer.json"), "utf8"));
    const plan = fixtureDownloadPlan(payload);
    assert.equal(plan.filename, "articles.interchange.json");
    const parsed = JSON.parse(plan.json);
    assertGoldPayload(parsed);
    assert.equal(typeof parsed.articles[0].read_count, "number");
  });

  it("maps downloads API failure to the paste CTA", () => {
    const src = readFileSync(join(root, "src/popup.ts"), "utf8");
    const fn = src.slice(src.indexOf("async function onFixtureExport"));
    assert.match(fn, /catch \{[\s\S]*showPasteCta\(\)/);
    assert.match(fn, /本地下载失败/);
  });
});

describe("reduced motion", () => {
  it("disables 200ms transitions when prefers-reduced-motion: reduce", () => {
    const css = readFileSync(join(root, "popup.css"), "utf8");
    assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
    const reduceBlock = css.slice(css.search(/@media \(prefers-reduced-motion:\s*reduce\)/));
    assert.match(reduceBlock, /transition:\s*none/);
  });
});
