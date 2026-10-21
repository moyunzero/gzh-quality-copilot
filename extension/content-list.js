"use strict";
(() => {
  // src/logic.ts
  var EXTRACT_MESSAGE = "EXTRACT_LIST";
  var EXTRACT_MULTI_MESSAGE = "EXTRACT_LIST_MULTI";
  var CANCEL_MULTI_MESSAGE = "CANCEL_LIST_MULTI";
  var MULTI_PAGE_CAP = 50;

  // src/content-list.ts
  var MERGE_COUNT_KEYS = ["read_count", "like_count", "share_count", "wow_count"];
  function normalizeTitleForMatch(title) {
    return title.trim().replace(/\s+/g, " ").replace(/\s*原创\s*$/u, "").trim();
  }
  function hasPresentField(row, key) {
    const value = row[key];
    if (value === void 0 || value === null) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  }
  function nestedStat(item) {
    const raw = item.appmsg_stat ?? item.app_msg_stat ?? item.stat;
    if (raw && typeof raw === "object") return raw;
    return {};
  }
  function mapRawFields(item) {
    const stat = nestedStat(item);
    const title = item.title ?? item.Title;
    const publish_time = item.publish_time ?? item.update_time ?? item.create_time ?? item.date ?? item.update_time_str;
    const read_count = item.read_count ?? item.read_num ?? item.readNum ?? item.read ?? stat.read_num ?? stat.read_count ?? stat.readNum;
    const like_count = item.like_count ?? item.like_num ?? item.likeNum ?? item.old_like_num ?? item.like ?? stat.like_num ?? stat.like_count ?? stat.old_like_num ?? stat.likeNum;
    const share_count = item.share_count ?? item.share_num ?? item.shareNum ?? item.share ?? stat.share_num ?? stat.share_count ?? stat.shareNum;
    const wow_count = item.wow_count ?? item.wow_num ?? item.looking_num ?? item.wow ?? stat.looking_num ?? stat.wow_num ?? stat.wow_count;
    const url = item.url ?? item.link ?? item.content_url ?? item.contentUrl;
    const row = {};
    if (title !== void 0 && title !== null && String(title).trim() !== "") {
      row.title = String(title).trim();
    }
    const coercedTime = coercePublishTime(publish_time);
    if (coercedTime) row.publish_time = coercedTime;
    if (read_count !== void 0 && read_count !== null) row.read_count = read_count;
    if (like_count !== void 0 && like_count !== null) row.like_count = like_count;
    if (share_count !== void 0 && share_count !== null) row.share_count = share_count;
    if (wow_count !== void 0 && wow_count !== null) row.wow_count = wow_count;
    if (url !== void 0 && url !== null && String(url).trim() !== "") {
      row.url = String(url).trim();
    }
    return row;
  }
  var pad2 = (n) => String(n).padStart(2, "0");
  function shanghaiParts(now) {
    const t = new Date(now.getTime() + 8 * 3600 * 1e3);
    return {
      y: t.getUTCFullYear(),
      mo: t.getUTCMonth(),
      d: t.getUTCDate(),
      dow: t.getUTCDay()
    };
  }
  function formatShanghaiYmdHm(y, mo0, d, hh, mm) {
    return `${y}-${pad2(mo0 + 1)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}:00+08:00`;
  }
  function formatUnixPublishTime(secOrMs) {
    if (!Number.isFinite(secOrMs)) return String(secOrMs);
    const ms = secOrMs > 1e12 ? secOrMs : secOrMs * 1e3;
    const t = new Date(ms + 8 * 3600 * 1e3);
    if (Number.isNaN(t.getTime())) return String(secOrMs);
    return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}T${pad2(t.getUTCHours())}:${pad2(t.getUTCMinutes())}:${pad2(t.getUTCSeconds())}+08:00`;
  }
  var WEEKDAY_ZH = {
    \u65E5: 0,
    \u5929: 0,
    \u4E00: 1,
    \u4E8C: 2,
    \u4E09: 3,
    \u56DB: 4,
    \u4E94: 5,
    \u516D: 6
  };
  function resolveWechatRelativePublishTime(raw, now = /* @__PURE__ */ new Date()) {
    const s = raw.trim().replace(/\s+/g, "");
    if (!s) return void 0;
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s;
    const timeMatch = s.match(/(\d{1,2}):(\d{2})$/);
    const hh = timeMatch ? Number(timeMatch[1]) : 0;
    const mm = timeMatch ? Number(timeMatch[2]) : 0;
    if (timeMatch && (hh > 23 || mm > 59)) return void 0;
    const datePart = timeMatch ? s.slice(0, -timeMatch[0].length) : s;
    const { y: cy, mo: cmo, d: cd, dow } = shanghaiParts(now);
    let y = cy;
    let mo = cmo;
    let d = cd;
    if (datePart === "\u4ECA\u5929" || datePart === "\u4ECA\u65E5") {
    } else if (datePart === "\u6628\u5929" || datePart === "\u6628\u65E5") {
      const prev = new Date(Date.UTC(cy, cmo, cd - 1));
      y = prev.getUTCFullYear();
      mo = prev.getUTCMonth();
      d = prev.getUTCDate();
    } else if (/^(?:星期|周)[日天一二三四五六]$/u.test(datePart)) {
      const target = WEEKDAY_ZH[datePart.slice(-1)];
      let delta = (dow - target + 7) % 7;
      if (delta === 0) delta = 7;
      const prev = new Date(Date.UTC(cy, cmo, cd - delta));
      y = prev.getUTCFullYear();
      mo = prev.getUTCMonth();
      d = prev.getUTCDate();
    } else {
      const withYear = datePart.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/u);
      const noYear = datePart.match(/^(\d{1,2})月(\d{1,2})日$/u);
      if (withYear) {
        y = Number(withYear[1]);
        mo = Number(withYear[2]) - 1;
        d = Number(withYear[3]);
      } else if (noYear) {
        mo = Number(noYear[1]) - 1;
        d = Number(noYear[2]);
        y = cy;
        const candidateUtc = Date.UTC(y, mo, d, hh, mm) - 8 * 3600 * 1e3;
        if (candidateUtc > now.getTime()) y = cy - 1;
      } else {
        return void 0;
      }
    }
    if (mo < 0 || mo > 11 || d < 1 || d > 31) return void 0;
    return formatShanghaiYmdHm(y, mo, d, hh, mm);
  }
  function coercePublishTime(value, now = /* @__PURE__ */ new Date()) {
    if (value === void 0 || value === null) return void 0;
    if (typeof value === "number" && Number.isFinite(value)) {
      if (value >= 1e9) return formatUnixPublishTime(value);
      return String(value);
    }
    const s = String(value).trim();
    if (!s) return void 0;
    if (/^\d{10,13}$/.test(s)) return formatUnixPublishTime(Number(s));
    return resolveWechatRelativePublishTime(s, now) ?? s;
  }
  function mergeRowsByTitle(sources) {
    const byTitle = /* @__PURE__ */ new Map();
    const order = [];
    for (const rows of sources) {
      for (const row of rows) {
        if (typeof row.title !== "string" || row.title.length === 0) continue;
        const key = normalizeTitleForMatch(row.title);
        if (!key) continue;
        const existing = byTitle.get(key);
        if (!existing) {
          byTitle.set(key, { ...row });
          order.push(key);
          continue;
        }
        for (const [field, value] of Object.entries(row)) {
          if (!hasPresentField(existing, field) && value !== void 0 && value !== null) {
            if (typeof value === "string" && value.trim() === "") continue;
            existing[field] = value;
          }
        }
      }
    }
    return order.map((k) => byTitle.get(k));
  }
  function asObjectArray(value) {
    if (!Array.isArray(value)) return [];
    return value.filter((x) => !!x && typeof x === "object");
  }
  function parseJsonObject(value) {
    if (value && typeof value === "object") return value;
    if (typeof value !== "string") return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
    }
    return null;
  }
  function unwrapPayloadRoot(payload) {
    const root = parseJsonObject(payload);
    if (!root) return null;
    const page = parseJsonObject(root.publish_page);
    return page ?? root;
  }
  function rowsFromPublishList(list) {
    const out = [];
    for (const item of asObjectArray(list)) {
      const direct = mapRawFields(item);
      if (typeof direct.title === "string" && direct.title.length > 0) {
        out.push(direct);
        continue;
      }
      const info = parseJsonObject(item.publish_info);
      if (!info) continue;
      const appmsgs = asObjectArray(info.appmsgex ?? info.appmsg_info ?? info.app_msg_list);
      const sentTime = info.sent_info && typeof info.sent_info === "object" ? info.sent_info.time : void 0;
      for (const a of appmsgs) {
        const row = mapRawFields(a);
        if (!hasPresentField(row, "publish_time")) {
          const coerced = coercePublishTime(sentTime);
          if (coerced) row.publish_time = coerced;
        }
        if (typeof row.title === "string" && row.title.length > 0) out.push(row);
      }
    }
    return out;
  }
  function rowsFromListCandidate(candidate, isPublishList) {
    if (isPublishList) return rowsFromPublishList(candidate);
    return asObjectArray(candidate).map(mapRawFields).filter((r) => typeof r.title === "string" && r.title.length > 0);
  }
  function articlesFromEmbeddedPayload(payload) {
    const root = unwrapPayloadRoot(payload);
    if (!root) return [];
    const candidates = [
      { value: root.publish_list, publishList: true },
      { value: root.data?.publish_list, publishList: true },
      { value: root.app_msg_list, publishList: false },
      { value: root.list, publishList: false },
      { value: root.articles, publishList: false },
      { value: root.app_msg_info?.list, publishList: false },
      { value: root.data?.app_msg_list, publishList: false },
      { value: root.data?.list, publishList: false }
    ];
    const sources = [];
    for (const { value, publishList } of candidates) {
      const rows = rowsFromListCandidate(value, publishList);
      if (rows.length > 0) sources.push(rows);
    }
    return mergeRowsByTitle(sources);
  }
  function mergeEmbeddedWithDom(embedded, dom) {
    if (embedded.length === 0) return dom;
    if (dom.length === 0) return embedded;
    const domByTitle = /* @__PURE__ */ new Map();
    for (const row of dom) {
      if (typeof row.title !== "string" || row.title.length === 0) continue;
      const key = normalizeTitleForMatch(row.title);
      if (key && !domByTitle.has(key)) domByTitle.set(key, row);
    }
    return embedded.map((row) => {
      const title = typeof row.title === "string" ? row.title : "";
      const domRow = title ? domByTitle.get(normalizeTitleForMatch(title)) : void 0;
      if (!domRow) return row;
      const merged = { ...row };
      if (!hasPresentField(merged, "publish_time") && hasPresentField(domRow, "publish_time")) {
        merged.publish_time = domRow.publish_time;
      }
      for (const key of MERGE_COUNT_KEYS) {
        if (!hasPresentField(merged, key) && hasPresentField(domRow, key)) {
          merged[key] = domRow[key];
        }
      }
      return merged;
    });
  }
  function sliceBalancedObject(text, start) {
    if (text[start] !== "{") return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (inString) {
        if (escape) {
          escape = false;
          continue;
        }
        if (c === "\\") {
          escape = true;
          continue;
        }
        if (c === '"') inString = false;
        continue;
      }
      if (c === '"') {
        inString = true;
        continue;
      }
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
    return null;
  }
  function objectStartContaining(text, keyAt) {
    let best = -1;
    for (let i = 0; i <= keyAt; i++) {
      if (text[i] !== "{") continue;
      const slice = sliceBalancedObject(text, i);
      if (slice && i + slice.length > keyAt) best = i;
    }
    return best;
  }
  function parseListJsonFromScriptText(text) {
    const sources = [];
    for (const key of ["publish_list", "app_msg_list"]) {
      const marker = `"${key}"`;
      let from = 0;
      while (from < text.length) {
        const keyAt = text.indexOf(marker, from);
        if (keyAt < 0) break;
        const brace = objectStartContaining(text, keyAt);
        if (brace >= 0) {
          const slice = sliceBalancedObject(text, brace);
          if (slice) {
            try {
              const rows = articlesFromEmbeddedPayload(JSON.parse(slice));
              if (rows.length > 0) sources.push(rows);
            } catch {
            }
          }
        }
        from = keyAt + marker.length;
      }
    }
    return mergeRowsByTitle(sources);
  }
  function extractFromEmbeddedScript(doc) {
    const fixture = doc.querySelector("#mp-list-embedded");
    if (fixture?.textContent) {
      try {
        const rows = articlesFromEmbeddedPayload(JSON.parse(fixture.textContent));
        if (rows.length > 0) return rows;
      } catch {
      }
    }
    const scripts = Array.from(doc.querySelectorAll("script"));
    for (const script of scripts) {
      const text = script.textContent ?? "";
      if (!text.includes("app_msg_list") && !text.includes("publish_list")) continue;
      const rows = parseListJsonFromScriptText(text);
      if (rows.length > 0) return rows;
    }
    return [];
  }
  function collapseWsWithRawMap(text) {
    let collapsed = "";
    const rawAt = [];
    let i = 0;
    const n = text.length;
    while (i < n && /\s/u.test(text[i])) i++;
    let pendingSpace = false;
    while (i < n) {
      if (/\s/u.test(text[i])) {
        pendingSpace = collapsed.length > 0;
        while (i < n && /\s/u.test(text[i])) i++;
        continue;
      }
      if (pendingSpace) {
        collapsed += " ";
        rawAt.push(i - 1);
        pendingSpace = false;
      }
      collapsed += text[i];
      rawAt.push(i);
      i++;
    }
    return { collapsed, rawAt };
  }
  function stripNormalizedTitleSpan(text, titleHint) {
    const normTitle = normalizeTitleForMatch(titleHint);
    if (!normTitle) return text;
    const { collapsed, rawAt } = collapseWsWithRawMap(text);
    const idx = collapsed.indexOf(normTitle);
    if (idx < 0 || rawAt.length === 0) return text;
    const rawStart = rawAt[idx];
    let rawEnd = rawAt[idx + normTitle.length - 1] + 1;
    const after = text.slice(rawEnd);
    const trail = after.match(/^\s*原创\s*/u);
    if (trail) rawEnd += trail[0].length;
    return `${text.slice(0, rawStart)} ${text.slice(rawEnd)}`;
  }
  function isYearToken(tok) {
    return /^(?:19|20)\d{2}$/.test(tok);
  }
  function isMonthDayFragment(tok) {
    return /^(?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])$/.test(tok);
  }
  function countIntToken(tok) {
    if (isMonthDayFragment(tok) || isYearToken(tok)) return null;
    if (!/^\d{1,7}$/.test(tok)) return null;
    const n = Number(tok);
    return Number.isFinite(n) ? n : null;
  }
  function metricIntsFromMostlyIntLine(line) {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;
    const scored = [];
    let intCount = 0;
    let considered = 0;
    for (const tok of tokens) {
      if (isMonthDayFragment(tok) || isYearToken(tok)) continue;
      considered++;
      const n = countIntToken(tok);
      scored.push(n);
      if (n !== null) intCount++;
    }
    if (intCount < 2 || intCount * 2 < considered) return null;
    let best = null;
    let run = [];
    for (const n of scored) {
      if (n !== null) {
        run.push(n);
      } else {
        if (run.length >= 2) best = run;
        run = [];
      }
    }
    if (run.length >= 2) best = run;
    return best ? best.slice(0, 4) : null;
  }
  function lastCountIntRun(text) {
    const tokens = text.trim().split(/\s+/).filter(Boolean);
    let best = null;
    let run = [];
    for (const tok of tokens) {
      const n = countIntToken(tok);
      if (n !== null) {
        run.push(n);
      } else {
        if (run.length >= 2) best = run;
        run = [];
      }
    }
    if (run.length >= 2) best = run;
    return best ? best.slice(0, 4) : null;
  }
  function metricsFromRowText(text, titleHint) {
    let rest = titleHint ? stripNormalizedTitleSpan(text, titleHint) : text;
    rest = rest.replace(/原创|转载|视频号|已发表/gu, "\n");
    let nums = null;
    for (const line of rest.split(/\n+/)) {
      const fromLine = metricIntsFromMostlyIntLine(line);
      if (fromLine) nums = fromLine;
    }
    if (!nums) nums = lastCountIntRun(rest);
    if (!nums || nums.length === 0) return {};
    const out = { read_count: nums[0] };
    if (nums[1] !== void 0) out.like_count = nums[1];
    if (nums[2] !== void 0) out.share_count = nums[2];
    if (nums[3] !== void 0) out.wow_count = nums[3];
    return out;
  }
  function applyTextMetrics(row, text) {
    const fromText = metricsFromRowText(text, typeof row.title === "string" ? row.title : void 0);
    for (const key of MERGE_COUNT_KEYS) {
      if (!hasPresentField(row, key) && fromText[key] !== void 0) {
        row[key] = fromText[key];
      }
    }
  }
  function parseMetricText(raw) {
    if (raw == null) return null;
    const t = raw.replace(/,/g, "").trim();
    if (!t) return null;
    const wan = /^(\d+(?:\.\d+)?)\s*万$/u.exec(t);
    if (wan) {
      const n2 = Number(wan[1]) * 1e4;
      return Number.isFinite(n2) ? Math.round(n2) : null;
    }
    if (!/^\d{1,9}$/.test(t)) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  var WEUI_METRIC_CLASSES = [
    { key: "read_count", cls: "appmsg-view" },
    { key: "like_count", cls: "appmsg-like" },
    { key: "share_count", cls: "appmsg-share" },
    { key: "wow_count", cls: "appmsg-haokan" }
  ];
  function metricsFromWeuiScope(scope) {
    const out = {};
    for (const { key, cls } of WEUI_METRIC_CLASSES) {
      const el = scope.querySelector(`.${cls} .weui-desktop-mass-media__data__inner`) ?? scope.querySelector(`.${cls}__disable .weui-desktop-mass-media__data__inner`);
      const n = parseMetricText(el?.textContent ?? null);
      if (n !== null) out[key] = n;
    }
    return out;
  }
  function applyWeuiMetrics(row, scope) {
    const from = metricsFromWeuiScope(scope);
    for (const key of MERGE_COUNT_KEYS) {
      if (!hasPresentField(row, key) && from[key] !== void 0) {
        row[key] = from[key];
      }
    }
  }
  function metricsFromWeuiHtml(inner) {
    const out = {};
    for (const { key, cls } of WEUI_METRIC_CLASSES) {
      const re = new RegExp(
        `${cls}(?:__disable)?[\\s\\S]*?weui-desktop-mass-media__data__inner[^>]*>([^<]*)`,
        "i"
      );
      const n = parseMetricText(inner.match(re)?.[1] ?? null);
      if (n !== null) out[key] = n;
    }
    return out;
  }
  function applyPartialMetrics(row, from) {
    for (const key of MERGE_COUNT_KEYS) {
      if (!hasPresentField(row, key) && from[key] !== void 0) {
        row[key] = from[key];
      }
    }
  }
  var ROW_ROOT_SELECTOR = ".mp-msg-item, [data-gzh-row], .weui-desktop-mass-appmsg__bd, .publish_hover_content, .weui-desktop-mass-appmsg, .weui-desktop-mass, li, tr";
  function publishTimeFromUrl(url) {
    if (!url) return void 0;
    try {
      const u = new URL(url, "https://mp.weixin.qq.com");
      const send = u.searchParams.get("send_time");
      if (send && /^\d{10,13}$/.test(send)) return formatUnixPublishTime(Number(send));
    } catch {
    }
    return void 0;
  }
  function publishTimeFromMassDom(scope) {
    const mass = scope.closest(".weui-desktop-mass") ?? scope;
    const timeEl = mass.querySelector(".weui-desktop-mass__time") ?? mass.querySelector("[class*='mass__time']");
    const raw = timeEl?.textContent?.trim();
    if (raw) return raw.replace(/\s+/g, "");
    const head = (mass.textContent ?? "").slice(0, 160);
    const m = head.match(/(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日|\d{1,2}\s*月\s*\d{1,2}\s*日)/u);
    if (m?.[1]) return m[1].replace(/\s+/g, "");
    return void 0;
  }
  function publishTimeFromMassHtml(beforeAndInner) {
    const timeAttr = beforeAndInner.match(
      /weui-desktop-mass__time[^>]*>([^<]+)</i
    )?.[1]?.trim();
    if (timeAttr) return timeAttr.replace(/\s+/g, "");
    const m = beforeAndInner.slice(0, 400).replace(/<[^>]+>/g, "\n").match(/(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日|\d{1,2}\s*月\s*\d{1,2}\s*日)/u);
    if (m?.[1]) return m[1].replace(/\s+/g, "");
    return void 0;
  }
  function pushDomCard(rows, seen, el) {
    const titleEl = el.matches(".weui-desktop-mass-appmsg__title") ? el : el.querySelector(".weui-desktop-mass-appmsg__title");
    const titleAttr = el.getAttribute("data-title") ?? "";
    const title = titleAttr || titleEl?.textContent?.trim() || (el.matches(".weui-desktop-mass-appmsg__title") ? el.textContent?.trim() : "") || "";
    if (!title) return;
    const key = normalizeTitleForMatch(title);
    if (!key || seen.has(key)) return;
    seen.add(key);
    const row = { title };
    const publish = el.getAttribute("data-publish-time");
    const read = el.getAttribute("data-read-count");
    const like = el.getAttribute("data-like-count");
    const share = el.getAttribute("data-share-count");
    const wow = el.getAttribute("data-wow-count");
    const url = el.getAttribute("data-url") ?? el.getAttribute("href") ?? titleEl?.getAttribute("href") ?? el.querySelector("a[href]")?.getAttribute("href");
    const coercedAttr = coercePublishTime(publish);
    if (coercedAttr) row.publish_time = coercedAttr;
    if (read !== null && read !== "") row.read_count = read;
    if (like !== null && like !== "") row.like_count = like;
    if (share !== null && share !== "") row.share_count = share;
    if (wow !== null && wow !== "") row.wow_count = wow;
    if (url) row.url = url;
    const rowRoot = el.closest(ROW_ROOT_SELECTOR) ?? el;
    if (!hasPresentField(row, "publish_time")) {
      const fromDom = publishTimeFromUrl(typeof row.url === "string" ? row.url : void 0) ?? publishTimeFromMassDom(rowRoot);
      const coerced = coercePublishTime(fromDom);
      if (coerced) row.publish_time = coerced;
    }
    applyWeuiMetrics(row, rowRoot);
    applyTextMetrics(row, rowRoot.textContent ?? "");
    rows.push(row);
  }
  function extractFromDomRows(doc) {
    const rows = [];
    const seen = /* @__PURE__ */ new Set();
    const cards = Array.from(
      doc.querySelectorAll(
        ".weui-desktop-mass-appmsg__bd, .publish_hover_content, .mp-msg-item[data-title], [data-gzh-row]"
      )
    );
    for (const node of cards) {
      pushDomCard(rows, seen, node);
    }
    for (const node of Array.from(doc.querySelectorAll(".weui-desktop-mass-appmsg__title"))) {
      const el = node;
      if (el.closest(".weui-desktop-mass-appmsg__bd, .publish_hover_content")) continue;
      pushDomCard(rows, seen, el);
    }
    return rows;
  }
  function extractArticlesFromDocument(doc) {
    const embedded = extractFromEmbeddedScript(doc);
    const dom = extractFromDomRows(doc);
    return mergeEmbeddedWithDom(embedded, dom);
  }
  function rowFromOpeningTag(tag, title) {
    const row = { title };
    const pub = tag.match(/data-publish-time=["']([^"']*)["']/i)?.[1];
    const read = tag.match(/data-read-count=["']([^"']*)["']/i)?.[1];
    const like = tag.match(/data-like-count=["']([^"']*)["']/i)?.[1];
    const share = tag.match(/data-share-count=["']([^"']*)["']/i)?.[1];
    const wow = tag.match(/data-wow-count=["']([^"']*)["']/i)?.[1];
    const url = tag.match(/data-url=["']([^"']*)["']/i)?.[1];
    if (pub) row.publish_time = pub;
    if (read !== void 0 && read !== "") row.read_count = read;
    if (like !== void 0 && like !== "") row.like_count = like;
    if (share !== void 0 && share !== "") row.share_count = share;
    if (wow !== void 0 && wow !== "") row.wow_count = wow;
    if (url) row.url = url;
    return row;
  }
  function extractWeuiCardsFromHtml(html, rows, seen) {
    const cardRe = /<(?:div|section|li)\b[^>]*\b(?:weui-desktop-mass-appmsg__bd|publish_hover_content)\b[^>]*>([\s\S]*?)<\/(?:div|section|li)>/gi;
    let m;
    while ((m = cardRe.exec(html)) !== null) {
      const inner = m[1] ?? "";
      const aMatch = inner.match(
        /<a\b[^>]*\bweui-desktop-mass-appmsg__title\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a\s*>/i
      ) ?? inner.match(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*\bweui-desktop-mass-appmsg__title\b[^>]*>([\s\S]*?)<\/a\s*>/i
      );
      const title = (aMatch?.[2] ?? "").replace(/<[^>]+>/g, "").trim();
      if (!title) continue;
      const key = normalizeTitleForMatch(title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const row = { title };
      const href = aMatch?.[1]?.trim();
      if (href) row.url = href;
      const before = html.slice(Math.max(0, m.index - 500), m.index);
      const fromDom = publishTimeFromUrl(href) ?? publishTimeFromMassHtml(`${before}
${inner}`);
      const coerced = coercePublishTime(fromDom);
      if (coerced) row.publish_time = coerced;
      applyPartialMetrics(row, metricsFromWeuiHtml(inner));
      applyTextMetrics(row, `${title}
${inner.replace(/<[^>]+>/g, "\n")}`);
      rows.push(row);
    }
  }
  function extractDomRowsFromHtml(html) {
    const rows = [];
    const seen = /* @__PURE__ */ new Set();
    extractWeuiCardsFromHtml(html, rows, seen);
    const attrRe = /<(?:li|div|a)\b[^>]*\bdata-title=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = attrRe.exec(html)) !== null) {
      const tag = m[0];
      const isMsgItem = /\bclass=["'][^"']*\bmp-msg-item\b[^"']*["']/i.test(tag);
      const isGzhRow = /\bdata-gzh-row\b/i.test(tag);
      if (!isMsgItem && !isGzhRow) continue;
      const title = m[1]?.trim();
      if (!title) continue;
      const key = normalizeTitleForMatch(title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const row = rowFromOpeningTag(tag, title);
      const after = html.slice(m.index + tag.length, m.index + tag.length + 400);
      const close = after.match(/^([\s\S]*?)<\/(?:li|div|a)>/i);
      if (close) applyTextMetrics(row, `${title}
${close[1].replace(/<[^>]+>/g, "\n")}`);
      rows.push(row);
    }
    return rows;
  }
  function extractArticlesFromHtml(html) {
    let embedded = [];
    const embeddedMatch = html.match(
      /<script[^>]*\bid=["']mp-list-embedded["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (embeddedMatch?.[1]) {
      try {
        embedded = articlesFromEmbeddedPayload(JSON.parse(embeddedMatch[1].trim()));
      } catch {
        embedded = [];
      }
    }
    const dom = extractDomRowsFromHtml(html);
    return mergeEmbeddedWithDom(embedded, dom);
  }
  function handleExtract() {
    try {
      const articles = extractArticlesFromDocument(document);
      return { ok: true, articles };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
  function rowDedupeKey(row) {
    const title = normalizeTitleForMatch(String(row.title ?? ""));
    if (!title) return "";
    const url = typeof row.url === "string" ? row.url.trim() : "";
    return url ? `${title}\0${url}` : title;
  }
  function mergePageRows(acc, page) {
    const seen = new Set(acc.map(rowDedupeKey).filter(Boolean));
    const out = [...acc];
    for (const row of page) {
      const key = rowDedupeKey(row);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(row);
    }
    return out;
  }
  function controlLooksDisabled(el) {
    if (el.getAttribute("aria-disabled") === "true") return true;
    if (el.disabled) return true;
    const cls = el.className?.toString?.() ?? "";
    if (/\bdisabled\b/i.test(cls) || /__nav_disabled\b/i.test(cls) || /_disabled\b/i.test(cls)) {
      return true;
    }
    return false;
  }
  function findNextPageControl(root) {
    const nodes = root.querySelectorAll("a, button, span[role='button'], div[role='button']");
    for (const node of Array.from(nodes)) {
      const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text !== "\u4E0B\u4E00\u9875" && !/^下一页/.test(text) && text !== "\u4E0B\u9875") continue;
      if (controlLooksDisabled(node)) continue;
      return node;
    }
    const doc = root;
    const pager = ("querySelector" in doc ? doc.querySelector(".weui-desktop-pagination") : null) ?? null;
    const scope = pager ?? root;
    const currentEl = "querySelector" in scope ? scope.querySelector(".weui-desktop-pagination__num_current") : null;
    const pageNow = currentEl ? parseInt((currentEl.textContent ?? "").trim(), 10) : NaN;
    const miniBtns = Array.from(
      "querySelectorAll" in scope ? scope.querySelectorAll(
        ".weui-desktop-btn.weui-desktop-btn_default.weui-desktop-btn_mini, button.weui-desktop-btn_mini, a.weui-desktop-btn_mini"
      ) : []
    );
    if (miniBtns.length > 0) {
      let candidate;
      if (!Number.isNaN(pageNow) && pageNow <= 1) {
        candidate = miniBtns[0];
      } else if (miniBtns.length >= 2) {
        candidate = miniBtns[1];
      } else {
        candidate = miniBtns[miniBtns.length - 1];
      }
      if (candidate && !controlLooksDisabled(candidate)) return candidate;
    }
    if (!Number.isNaN(pageNow) && "querySelectorAll" in scope) {
      const want = String(pageNow + 1);
      for (const num of Array.from(scope.querySelectorAll(".weui-desktop-pagination__num"))) {
        if ((num.textContent ?? "").trim() === want && !controlLooksDisabled(num)) {
          return num;
        }
      }
    }
    return null;
  }
  async function walkListPages(opts) {
    const maxPages = opts.maxPages ?? MULTI_PAGE_CAP;
    let articles = [];
    let pagesWalked = 0;
    let stopReason = "end";
    try {
      while (pagesWalked < maxPages) {
        if (opts.shouldAbort()) {
          stopReason = "cancel";
          break;
        }
        const page = opts.extract();
        articles = mergePageRows(articles, page);
        pagesWalked += 1;
        if (opts.shouldAbort()) {
          stopReason = "cancel";
          break;
        }
        const next = opts.findNext();
        if (!next) {
          stopReason = "end";
          break;
        }
        if (pagesWalked >= maxPages) {
          stopReason = "cap";
          break;
        }
        const beforeKeys = new Set(page.map(rowDedupeKey).filter(Boolean));
        const beforeFp = [...beforeKeys].sort().join("|");
        await opts.clickNext(next);
        await opts.waitAfterClick(beforeFp);
        if (opts.shouldAbort()) {
          stopReason = "cancel";
          break;
        }
        const after = opts.extract();
        const afterKeys = after.map(rowDedupeKey).filter(Boolean);
        const changed = afterKeys.some((k) => !beforeKeys.has(k));
        if (!changed) {
          articles = mergePageRows(articles, after);
          stopReason = "error";
          break;
        }
      }
      if (pagesWalked >= maxPages && stopReason === "end") {
        const next = opts.findNext();
        if (next) stopReason = "cap";
      }
    } catch {
      stopReason = "error";
    }
    return { articles, stopReason, pagesWalked };
  }
  var multiAbort = false;
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function handleMultiExtract() {
    multiAbort = false;
    try {
      const fingerprint = () => extractArticlesFromDocument(document).map(rowDedupeKey).filter(Boolean).sort().join("|");
      const result = await walkListPages({
        extract: () => extractArticlesFromDocument(document),
        findNext: () => findNextPageControl(document),
        clickNext: (el) => {
          el.click();
        },
        waitAfterClick: async (beforeFp) => {
          const deadline = Date.now() + 6e3;
          while (Date.now() < deadline) {
            if (multiAbort) return;
            await delay(250);
            if (fingerprint() !== beforeFp) return;
          }
        },
        shouldAbort: () => multiAbort,
        maxPages: MULTI_PAGE_CAP
      });
      return {
        ok: true,
        articles: result.articles,
        stopReason: result.stopReason,
        pagesWalked: result.pagesWalked
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        stopReason: "error"
      };
    }
  }
  function installListMessageApi() {
    const w = window;
    w.__gzhQcListApi = {
      onMessage(message, sendResponse) {
        if (!message || typeof message !== "object") return;
        const type = message.type;
        if (type === CANCEL_MULTI_MESSAGE) {
          multiAbort = true;
          sendResponse({ ok: true });
          return;
        }
        if (type === EXTRACT_MESSAGE) {
          sendResponse(handleExtract());
          return;
        }
        if (type === EXTRACT_MULTI_MESSAGE) {
          void handleMultiExtract().then(sendResponse);
          return true;
        }
      }
    };
    if (!w.__gzhQcListRouter) {
      w.__gzhQcListRouter = true;
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        const api = window.__gzhQcListApi;
        if (!api) return;
        return api.onMessage(message, sendResponse);
      });
    }
  }
  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage && typeof window !== "undefined") {
    installListMessageApi();
  }
})();
