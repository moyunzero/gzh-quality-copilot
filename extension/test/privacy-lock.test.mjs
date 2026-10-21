import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Canonical freeze — README must copy these arrays verbatim from manifest.json. */
const FROZEN_PERMISSIONS = ["downloads", "tabs", "scripting"];
const FROZEN_HOST_PERMISSIONS = ["https://mp.weixin.qq.com/*"];
const FROZEN_CONTENT_MATCHES = [
  "https://mp.weixin.qq.com/cgi-bin/appmsg*",
  "https://mp.weixin.qq.com/cgi-bin/appmsgpublish*",
];

describe("manifest privacy freeze", () => {
  it("locks permissions and host_permissions for README verbatim copy", () => {
    const m = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
    assert.equal(m.manifest_version, 3);
    assert.deepEqual(m.permissions, FROZEN_PERMISSIONS);
    assert.deepEqual(m.host_permissions, FROZEN_HOST_PERMISSIONS);
    assert.equal(m.content_scripts?.length, 1);
    assert.deepEqual(m.content_scripts[0].matches, FROZEN_CONTENT_MATCHES);
    assert.equal("optional_permissions" in m, false);
    assert.equal("optional_host_permissions" in m, false);
  });
});

describe("no forbidden extension behaviors", () => {
  it("grep of extension sources shows no upload/proxy-login/publish-to-server/Skill paths", () => {
    const deny = [
      /proxy-login/i,
      /proxyLogin/,
      /\bupload\b/i,
      /uploadToServer/,
      /publish-to-server/i,
      /publishToServer/,
      /skills\//,
      /SKILL\.md/,
      /chrome\.identity/,
      /XMLHttpRequest/,
    ];
    const files = [
      "src/popup.ts",
      "src/logic.ts",
      "src/content-list.ts",
      "src/background.ts",
      "manifest.json",
    ];
    for (const rel of files) {
      const text = readFileSync(join(root, rel), "utf8");
      for (const re of deny) {
        assert.equal(re.test(text), false, `${rel} matched ${re}`);
      }
    }
  });
});

describe("popup 会做/不会做 matches freeze", () => {
  it("lists frozen permissions/hosts in order and bans in 不会做", () => {
    const html = readFileSync(join(root, "popup.html"), "utf8");
    const willDoStart = html.indexOf('<p class="scope-label">会做</p>');
    const willNotStart = html.indexOf('<p class="scope-label">不会做</p>');
    assert.ok(willDoStart >= 0 && willNotStart > willDoStart);
    const willDo = html.slice(willDoStart, willNotStart);
    const willNot = html.slice(willNotStart);

    assert.match(willDo, /downloads[\s\S]*tabs[\s\S]*scripting/);
    assert.match(willDo, /https:\/\/mp\.weixin\.qq\.com\/\*/);
    assert.match(willNot, /代持登录/);
    assert.match(willNot, /代发/);
    assert.match(willNot, /读他号/);
    assert.match(willNot, /上传到本项目服务器/);
    assert.match(willNot, /嵌入 Skill/);
  });
});
