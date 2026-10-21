import {
  CANCEL_MULTI_MESSAGE,
  EXTRACT_MESSAGE,
  EXTRACT_MULTI_MESSAGE,
  MULTI_PAGE_CAP,
  type ExtractReply,
  type MultiExtractReply,
  type RawRow,
  type WalkStopReason,
} from "./logic";

const MERGE_COUNT_KEYS = ["read_count", "like_count", "share_count", "wow_count"] as const;

/** Trim, collapse whitespace, strip trailing 原创 — for exact title match only. */
export function normalizeTitleForMatch(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*原创\s*$/u, "")
    .trim();
}

function hasPresentField(row: RawRow, key: string): boolean {
  const value = row[key];
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function nestedStat(item: Record<string, unknown>): Record<string, unknown> {
  const raw = item.appmsg_stat ?? item.app_msg_stat ?? item.stat;
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

/** Map common WeChat / fixture field names onto gold keys (no body). */
function mapRawFields(item: Record<string, unknown>): RawRow {
  const stat = nestedStat(item);
  const title = item.title ?? item.Title;
  const publish_time =
    item.publish_time ?? item.update_time ?? item.create_time ?? item.date ?? item.update_time_str;
  const read_count =
    item.read_count ??
    item.read_num ??
    item.readNum ??
    item.read ??
    stat.read_num ??
    stat.read_count ??
    stat.readNum;
  const like_count =
    item.like_count ??
    item.like_num ??
    item.likeNum ??
    item.old_like_num ??
    item.like ??
    stat.like_num ??
    stat.like_count ??
    stat.old_like_num ??
    stat.likeNum;
  const share_count =
    item.share_count ??
    item.share_num ??
    item.shareNum ??
    item.share ??
    stat.share_num ??
    stat.share_count ??
    stat.shareNum;
  const wow_count =
    item.wow_count ??
    item.wow_num ??
    item.looking_num ??
    item.wow ??
    stat.looking_num ??
    stat.wow_num ??
    stat.wow_count;
  const url = item.url ?? item.link ?? item.content_url ?? item.contentUrl;

  const row: RawRow = {};
  if (title !== undefined && title !== null && String(title).trim() !== "") {
    row.title = String(title).trim();
  }
  const coercedTime = coercePublishTime(publish_time);
  if (coercedTime) row.publish_time = coercedTime;
  if (read_count !== undefined && read_count !== null) row.read_count = read_count;
  if (like_count !== undefined && like_count !== null) row.like_count = like_count;
  if (share_count !== undefined && share_count !== null) row.share_count = share_count;
  if (wow_count !== undefined && wow_count !== null) row.wow_count = wow_count;
  if (url !== undefined && url !== null && String(url).trim() !== "") {
    row.url = String(url).trim();
  }
  return row;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Calendar parts in Asia/Shanghai for `now`. */
function shanghaiParts(now: Date): { y: number; mo: number; d: number; dow: number } {
  const t = new Date(now.getTime() + 8 * 3600 * 1000);
  return {
    y: t.getUTCFullYear(),
    mo: t.getUTCMonth(),
    d: t.getUTCDate(),
    dow: t.getUTCDay(),
  };
}

function formatShanghaiYmdHm(y: number, mo0: number, d: number, hh: number, mm: number): string {
  return `${y}-${pad2(mo0 + 1)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}:00+08:00`;
}

/** Unix sec/ms → `YYYY-MM-DDTHH:mm:ss+08:00` (MP backend is China time). */
export function formatUnixPublishTime(secOrMs: number): string {
  if (!Number.isFinite(secOrMs)) return String(secOrMs);
  const ms = secOrMs > 1e12 ? secOrMs : secOrMs * 1000;
  const t = new Date(ms + 8 * 3600 * 1000);
  if (Number.isNaN(t.getTime())) return String(secOrMs);
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}T${pad2(t.getUTCHours())}:${pad2(t.getUTCMinutes())}:${pad2(t.getUTCSeconds())}+08:00`;
}

const WEEKDAY_ZH: Record<string, number> = {
  日: 0,
  天: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
};

/**
 * Resolve WeChat list UI relative times (今天/昨天/星期X/M月D日) to absolute +08:00 ISO.
 * `星期X` means the most recent past that weekday (never "today" — UI uses 今天 for that).
 */
export function resolveWechatRelativePublishTime(raw: string, now = new Date()): string | undefined {
  const s = raw.trim().replace(/\s+/g, "");
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s;

  const timeMatch = s.match(/(\d{1,2}):(\d{2})$/);
  const hh = timeMatch ? Number(timeMatch[1]) : 0;
  const mm = timeMatch ? Number(timeMatch[2]) : 0;
  if (timeMatch && (hh > 23 || mm > 59)) return undefined;
  const datePart = timeMatch ? s.slice(0, -timeMatch[0].length) : s;

  const { y: cy, mo: cmo, d: cd, dow } = shanghaiParts(now);
  let y = cy;
  let mo = cmo;
  let d = cd;

  if (datePart === "今天" || datePart === "今日") {
    /* keep today */
  } else if (datePart === "昨天" || datePart === "昨日") {
    const prev = new Date(Date.UTC(cy, cmo, cd - 1));
    y = prev.getUTCFullYear();
    mo = prev.getUTCMonth();
    d = prev.getUTCDate();
  } else if (/^(?:星期|周)[日天一二三四五六]$/u.test(datePart)) {
    const target = WEEKDAY_ZH[datePart.slice(-1)]!;
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
      const candidateUtc = Date.UTC(y, mo, d, hh, mm) - 8 * 3600 * 1000;
      if (candidateUtc > now.getTime()) y = cy - 1;
    } else {
      return undefined;
    }
  }

  if (mo < 0 || mo > 11 || d < 1 || d > 31) return undefined;
  return formatShanghaiYmdHm(y, mo, d, hh, mm);
}

export function coercePublishTime(value: unknown, now = new Date()): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 1e9) return formatUnixPublishTime(value);
    return String(value);
  }
  const s = String(value).trim();
  if (!s) return undefined;
  if (/^\d{10,13}$/.test(s)) return formatUnixPublishTime(Number(s));
  return resolveWechatRelativePublishTime(s, now) ?? s;
}

/** Merge list sources by normalized title; later rows fill missing fields only. */
export function mergeRowsByTitle(sources: RawRow[][]): RawRow[] {
  const byTitle = new Map<string, RawRow>();
  const order: string[] = [];
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
        if (!hasPresentField(existing, field) && value !== undefined && value !== null) {
          if (typeof value === "string" && value.trim() === "") continue;
          existing[field] = value;
        }
      }
    }
  }
  return order.map((k) => byTitle.get(k)!);
}

function asObjectArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
}

/** `publish_page` / `publish_info` are often stringified JSON on live MP pages. */
function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  return null;
}

function unwrapPayloadRoot(payload: unknown): Record<string, unknown> | null {
  const root = parseJsonObject(payload);
  if (!root) return null;
  const page = parseJsonObject(root.publish_page);
  return page ?? root;
}

/** Flatten `publish_list[]` → `publish_info` → `appmsgex[]` (live appmsgpublish shape). */
function rowsFromPublishList(list: unknown): RawRow[] {
  const out: RawRow[] = [];
  for (const item of asObjectArray(list)) {
    const direct = mapRawFields(item);
    if (typeof direct.title === "string" && direct.title.length > 0) {
      out.push(direct);
      continue;
    }

    const info = parseJsonObject(item.publish_info);
    if (!info) continue;
    const appmsgs = asObjectArray(info.appmsgex ?? info.appmsg_info ?? info.app_msg_list);
    const sentTime =
      info.sent_info && typeof info.sent_info === "object"
        ? (info.sent_info as Record<string, unknown>).time
        : undefined;

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

function rowsFromListCandidate(candidate: unknown, isPublishList: boolean): RawRow[] {
  if (isPublishList) return rowsFromPublishList(candidate);
  return asObjectArray(candidate)
    .map(mapRawFields)
    .filter((r) => typeof r.title === "string" && r.title.length > 0);
}

/** Pull list arrays from known WeChat / fixture JSON shapes. */
export function articlesFromEmbeddedPayload(payload: unknown): RawRow[] {
  const root = unwrapPayloadRoot(payload);
  if (!root) return [];

  // Prefer publish_list (has create_time) over sparse app_msg_list (title/url only).
  const candidates: { value: unknown; publishList: boolean }[] = [
    { value: root.publish_list, publishList: true },
    { value: (root.data as Record<string, unknown> | undefined)?.publish_list, publishList: true },
    { value: root.app_msg_list, publishList: false },
    { value: root.list, publishList: false },
    { value: root.articles, publishList: false },
    { value: (root.app_msg_info as Record<string, unknown> | undefined)?.list, publishList: false },
    { value: (root.data as Record<string, unknown> | undefined)?.app_msg_list, publishList: false },
    { value: (root.data as Record<string, unknown> | undefined)?.list, publishList: false },
  ];

  const sources: RawRow[][] = [];
  for (const { value, publishList } of candidates) {
    const rows = rowsFromListCandidate(value, publishList);
    if (rows.length > 0) sources.push(rows);
  }
  return mergeRowsByTitle(sources);
}

/**
 * Keep embedded title/url; fill missing counts from DOM rows with the same
 * normalized title. No fuzzy match — mismatch leaves counts absent.
 */
export function mergeEmbeddedWithDom(embedded: RawRow[], dom: RawRow[]): RawRow[] {
  if (embedded.length === 0) return dom;
  if (dom.length === 0) return embedded;

  const domByTitle = new Map<string, RawRow>();
  for (const row of dom) {
    if (typeof row.title !== "string" || row.title.length === 0) continue;
    const key = normalizeTitleForMatch(row.title);
    if (key && !domByTitle.has(key)) domByTitle.set(key, row);
  }

  return embedded.map((row) => {
    const title = typeof row.title === "string" ? row.title : "";
    const domRow = title ? domByTitle.get(normalizeTitleForMatch(title)) : undefined;
    if (!domRow) return row;

    const merged: RawRow = { ...row };
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

/** Bracket-balanced `{...}` slice from `start` (must be `{`), respecting JSON strings. */
function sliceBalancedObject(text: string, start: number): string | null {
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

/** Innermost `{` whose balanced slice covers `keyAt`. */
function objectStartContaining(text: string, keyAt: number): number {
  let best = -1;
  for (let i = 0; i <= keyAt; i++) {
    if (text[i] !== "{") continue;
    const slice = sliceBalancedObject(text, i);
    if (slice && i + slice.length > keyAt) best = i;
  }
  return best;
}

export function parseListJsonFromScriptText(text: string): RawRow[] {
  const sources: RawRow[][] = [];
  // publish_list first so create_time wins over title/url-only app_msg_list.
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
            /* try next occurrence */
          }
        }
      }
      from = keyAt + marker.length;
    }
  }
  return mergeRowsByTitle(sources);
}

function extractFromEmbeddedScript(doc: ParentNode): RawRow[] {
  const fixture = doc.querySelector("#mp-list-embedded");
  if (fixture?.textContent) {
    try {
      const rows = articlesFromEmbeddedPayload(JSON.parse(fixture.textContent));
      if (rows.length > 0) return rows;
    } catch {
      /* fall through */
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

/** Collapse whitespace like normalizeTitleForMatch (without stripping 原创); map each norm char → raw index. */
function collapseWsWithRawMap(text: string): { collapsed: string; rawAt: number[] } {
  let collapsed = "";
  const rawAt: number[] = [];
  let i = 0;
  const n = text.length;
  while (i < n && /\s/u.test(text[i]!)) i++;
  let pendingSpace = false;
  while (i < n) {
    if (/\s/u.test(text[i]!)) {
      pendingSpace = collapsed.length > 0;
      while (i < n && /\s/u.test(text[i]!)) i++;
      continue;
    }
    if (pendingSpace) {
      collapsed += " ";
      rawAt.push(i - 1);
      pendingSpace = false;
    }
    collapsed += text[i]!;
    rawAt.push(i);
    i++;
  }
  return { collapsed, rawAt };
}

/** Remove the raw span that corresponds to the normalized title match (incl. trailing 原创). */
function stripNormalizedTitleSpan(text: string, titleHint: string): string {
  const normTitle = normalizeTitleForMatch(titleHint);
  if (!normTitle) return text;

  const { collapsed, rawAt } = collapseWsWithRawMap(text);
  const idx = collapsed.indexOf(normTitle);
  if (idx < 0 || rawAt.length === 0) return text;

  const rawStart = rawAt[idx]!;
  let rawEnd = rawAt[idx + normTitle.length - 1]! + 1;
  const after = text.slice(rawEnd);
  const trail = after.match(/^\s*原创\s*/u);
  if (trail) rawEnd += trail[0].length;
  return `${text.slice(0, rawStart)} ${text.slice(rawEnd)}`;
}

function isYearToken(tok: string): boolean {
  return /^(?:19|20)\d{2}$/.test(tok);
}

function isMonthDayFragment(tok: string): boolean {
  return /^(?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])$/.test(tok);
}

/** Count int if 1–7 digits and not a year; month-day fragments are never counts. */
function countIntToken(tok: string): number | null {
  if (isMonthDayFragment(tok) || isYearToken(tok)) return null;
  if (!/^\d{1,7}$/.test(tok)) return null;
  const n = Number(tok);
  return Number.isFinite(n) ? n : null;
}

/** Last run of 2+ count-ints on a mostly-integer line; otherwise null. */
function metricIntsFromMostlyIntLine(line: string): number[] | null {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  const scored: (number | null)[] = [];
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

  // Last contiguous run of count-ints with length >= 2
  let best: number[] | null = null;
  let run: number[] = [];
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

/** Last space-separated run of 2+ count-ints anywhere in text. */
function lastCountIntRun(text: string): number[] | null {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  let best: number[] | null = null;
  let run: number[] = [];
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

/**
 * Publish-list rows often show engagement as plain integers after the title
 * (read / like / share / wow) with no data-* attrs.
 * Prefer a mostly-integer line (2+ ints); else the last such run. Skip years / month-day.
 */
export function metricsFromRowText(text: string, titleHint?: string): Partial<RawRow> {
  let rest = titleHint ? stripNormalizedTitleSpan(text, titleHint) : text;
  rest = rest.replace(/原创|转载|视频号|已发表/gu, "\n");

  let nums: number[] | null = null;
  for (const line of rest.split(/\n+/)) {
    const fromLine = metricIntsFromMostlyIntLine(line);
    if (fromLine) nums = fromLine;
  }
  if (!nums) nums = lastCountIntRun(rest);
  if (!nums || nums.length === 0) return {};

  const out: Partial<RawRow> = { read_count: nums[0] };
  if (nums[1] !== undefined) out.like_count = nums[1];
  if (nums[2] !== undefined) out.share_count = nums[2];
  if (nums[3] !== undefined) out.wow_count = nums[3];
  return out;
}

function applyTextMetrics(row: RawRow, text: string): void {
  const fromText = metricsFromRowText(text, typeof row.title === "string" ? row.title : undefined);
  for (const key of MERGE_COUNT_KEYS) {
    if (!hasPresentField(row, key) && fromText[key] !== undefined) {
      row[key] = fromText[key];
    }
  }
}

/** Live publish-list UI: `.appmsg-view|like|share|haokan .weui-desktop-mass-media__data__inner`. */
export function parseMetricText(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const t = raw.replace(/,/g, "").trim();
  if (!t) return null;
  const wan = /^(\d+(?:\.\d+)?)\s*万$/u.exec(t);
  if (wan) {
    const n = Number(wan[1]) * 10000;
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  if (!/^\d{1,9}$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const WEUI_METRIC_CLASSES: { key: (typeof MERGE_COUNT_KEYS)[number]; cls: string }[] = [
  { key: "read_count", cls: "appmsg-view" },
  { key: "like_count", cls: "appmsg-like" },
  { key: "share_count", cls: "appmsg-share" },
  { key: "wow_count", cls: "appmsg-haokan" },
];

export function metricsFromWeuiScope(scope: Element): Partial<RawRow> {
  const out: Partial<RawRow> = {};
  for (const { key, cls } of WEUI_METRIC_CLASSES) {
    const el =
      scope.querySelector(`.${cls} .weui-desktop-mass-media__data__inner`) ??
      scope.querySelector(`.${cls}__disable .weui-desktop-mass-media__data__inner`);
    const n = parseMetricText(el?.textContent ?? null);
    if (n !== null) out[key] = n;
  }
  return out;
}

function applyWeuiMetrics(row: RawRow, scope: Element): void {
  const from = metricsFromWeuiScope(scope);
  for (const key of MERGE_COUNT_KEYS) {
    if (!hasPresentField(row, key) && from[key] !== undefined) {
      row[key] = from[key];
    }
  }
}

/** Regex twin of metricsFromWeuiScope for offline HTML fixtures. */
export function metricsFromWeuiHtml(inner: string): Partial<RawRow> {
  const out: Partial<RawRow> = {};
  for (const { key, cls } of WEUI_METRIC_CLASSES) {
    const re = new RegExp(
      `${cls}(?:__disable)?[\\s\\S]*?weui-desktop-mass-media__data__inner[^>]*>([^<]*)`,
      "i",
    );
    const n = parseMetricText(inner.match(re)?.[1] ?? null);
    if (n !== null) out[key] = n;
  }
  return out;
}

function applyPartialMetrics(row: RawRow, from: Partial<RawRow>): void {
  for (const key of MERGE_COUNT_KEYS) {
    if (!hasPresentField(row, key) && from[key] !== undefined) {
      row[key] = from[key];
    }
  }
}

const ROW_ROOT_SELECTOR =
  ".mp-msg-item, [data-gzh-row], .weui-desktop-mass-appmsg__bd, .publish_hover_content, .weui-desktop-mass-appmsg, .weui-desktop-mass, li, tr";

function publishTimeFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url, "https://mp.weixin.qq.com");
    const send = u.searchParams.get("send_time");
    if (send && /^\d{10,13}$/.test(send)) return formatUnixPublishTime(Number(send));
  } catch {
    /* ignore */
  }
  return undefined;
}

function publishTimeFromMassDom(scope: Element): string | undefined {
  const mass = (scope.closest(".weui-desktop-mass") as Element | null) ?? scope;
  const timeEl =
    mass.querySelector(".weui-desktop-mass__time") ??
    mass.querySelector("[class*='mass__time']");
  const raw = timeEl?.textContent?.trim();
  if (raw) return raw.replace(/\s+/g, "");
  const head = (mass.textContent ?? "").slice(0, 160);
  const m = head.match(/(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日|\d{1,2}\s*月\s*\d{1,2}\s*日)/u);
  if (m?.[1]) return m[1].replace(/\s+/g, "");
  return undefined;
}

function publishTimeFromMassHtml(beforeAndInner: string): string | undefined {
  const timeAttr = beforeAndInner.match(
    /weui-desktop-mass__time[^>]*>([^<]+)</i,
  )?.[1]?.trim();
  if (timeAttr) return timeAttr.replace(/\s+/g, "");
  const m = beforeAndInner
    .slice(0, 400)
    .replace(/<[^>]+>/g, "\n")
    .match(/(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日|\d{1,2}\s*月\s*\d{1,2}\s*日)/u);
  if (m?.[1]) return m[1].replace(/\s+/g, "");
  return undefined;
}

function pushDomCard(rows: RawRow[], seen: Set<string>, el: Element): void {
  const titleEl = el.matches(".weui-desktop-mass-appmsg__title")
    ? el
    : (el.querySelector(".weui-desktop-mass-appmsg__title") as Element | null);
  const titleAttr = el.getAttribute("data-title") ?? "";
  const title =
    titleAttr ||
    titleEl?.textContent?.trim() ||
    (el.matches(".weui-desktop-mass-appmsg__title") ? el.textContent?.trim() : "") ||
    "";
  if (!title) return;

  const key = normalizeTitleForMatch(title);
  if (!key || seen.has(key)) return;
  seen.add(key);

  const row: RawRow = { title };
  const publish = el.getAttribute("data-publish-time");
  const read = el.getAttribute("data-read-count");
  const like = el.getAttribute("data-like-count");
  const share = el.getAttribute("data-share-count");
  const wow = el.getAttribute("data-wow-count");
  const url =
    el.getAttribute("data-url") ??
    el.getAttribute("href") ??
    titleEl?.getAttribute("href") ??
    el.querySelector("a[href]")?.getAttribute("href");

  const coercedAttr = coercePublishTime(publish);
  if (coercedAttr) row.publish_time = coercedAttr;
  if (read !== null && read !== "") row.read_count = read;
  if (like !== null && like !== "") row.like_count = like;
  if (share !== null && share !== "") row.share_count = share;
  if (wow !== null && wow !== "") row.wow_count = wow;
  if (url) row.url = url;

  const rowRoot = (el.closest(ROW_ROOT_SELECTOR) as Element | null) ?? el;
  if (!hasPresentField(row, "publish_time")) {
    const fromDom =
      publishTimeFromUrl(typeof row.url === "string" ? row.url : undefined) ??
      publishTimeFromMassDom(rowRoot);
    const coerced = coercePublishTime(fromDom);
    if (coerced) row.publish_time = coerced;
  }
  applyWeuiMetrics(row, rowRoot);
  applyTextMetrics(row, rowRoot.textContent ?? "");
  rows.push(row);
}

function extractFromDomRows(doc: ParentNode): RawRow[] {
  const rows: RawRow[] = [];
  const seen = new Set<string>();

  const cards = Array.from(
    doc.querySelectorAll(
      ".weui-desktop-mass-appmsg__bd, .publish_hover_content, .mp-msg-item[data-title], [data-gzh-row]",
    ),
  );
  for (const node of cards) {
    pushDomCard(rows, seen, node as Element);
  }

  // Titles outside card containers (older fixtures / partial markup)
  for (const node of Array.from(doc.querySelectorAll(".weui-desktop-mass-appmsg__title"))) {
    const el = node as Element;
    if (el.closest(".weui-desktop-mass-appmsg__bd, .publish_hover_content")) continue;
    pushDomCard(rows, seen, el);
  }

  return rows;
}

/** Current-page only; never navigates. Merge embedded title/url with DOM counts. */
export function extractArticlesFromDocument(doc: ParentNode): RawRow[] {
  const embedded = extractFromEmbeddedScript(doc);
  const dom = extractFromDomRows(doc);
  return mergeEmbeddedWithDom(embedded, dom);
}

function rowFromOpeningTag(tag: string, title: string): RawRow {
  const row: RawRow = { title };
  const pub = tag.match(/data-publish-time=["']([^"']*)["']/i)?.[1];
  const read = tag.match(/data-read-count=["']([^"']*)["']/i)?.[1];
  const like = tag.match(/data-like-count=["']([^"']*)["']/i)?.[1];
  const share = tag.match(/data-share-count=["']([^"']*)["']/i)?.[1];
  const wow = tag.match(/data-wow-count=["']([^"']*)["']/i)?.[1];
  const url = tag.match(/data-url=["']([^"']*)["']/i)?.[1];
  if (pub) row.publish_time = pub;
  if (read !== undefined && read !== "") row.read_count = read;
  if (like !== undefined && like !== "") row.like_count = like;
  if (share !== undefined && share !== "") row.share_count = share;
  if (wow !== undefined && wow !== "") row.wow_count = wow;
  if (url) row.url = url;
  return row;
}

function extractWeuiCardsFromHtml(html: string, rows: RawRow[], seen: Set<string>): void {
  const cardRe =
    /<(?:div|section|li)\b[^>]*\b(?:weui-desktop-mass-appmsg__bd|publish_hover_content)\b[^>]*>([\s\S]*?)<\/(?:div|section|li)>/gi;
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html)) !== null) {
    const inner = m[1] ?? "";
    const aMatch =
      inner.match(
        /<a\b[^>]*\bweui-desktop-mass-appmsg__title\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a\s*>/i,
      ) ??
      inner.match(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*\bweui-desktop-mass-appmsg__title\b[^>]*>([\s\S]*?)<\/a\s*>/i,
      );
    const title = (aMatch?.[2] ?? "").replace(/<[^>]+>/g, "").trim();
    if (!title) continue;
    const key = normalizeTitleForMatch(title);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const row: RawRow = { title };
    const href = aMatch?.[1]?.trim();
    if (href) row.url = href;
    const before = html.slice(Math.max(0, m.index - 500), m.index);
    const fromDom =
      publishTimeFromUrl(href) ?? publishTimeFromMassHtml(`${before}\n${inner}`);
    const coerced = coercePublishTime(fromDom);
    if (coerced) row.publish_time = coerced;
    applyPartialMetrics(row, metricsFromWeuiHtml(inner));
    applyTextMetrics(row, `${title}\n${inner.replace(/<[^>]+>/g, "\n")}`);
    rows.push(row);
  }
}

function extractDomRowsFromHtml(html: string): RawRow[] {
  const rows: RawRow[] = [];
  const seen = new Set<string>();

  extractWeuiCardsFromHtml(html, rows, seen);

  // data-title anywhere on the opening tag; require mp-msg-item class or data-gzh-row (any order).
  const attrRe = /<(?:li|div|a)\b[^>]*\bdata-title=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
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
    if (close) applyTextMetrics(row, `${title}\n${close[1].replace(/<[^>]+>/g, "\n")}`);
    rows.push(row);
  }

  return rows;
}

/** Offline HTML fixture path (no Document required). */
export function extractArticlesFromHtml(html: string): RawRow[] {
  let embedded: RawRow[] = [];
  const embeddedMatch = html.match(
    /<script[^>]*\bid=["']mp-list-embedded["'][^>]*>([\s\S]*?)<\/script>/i,
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

function handleExtract(): ExtractReply {
  try {
    const articles = extractArticlesFromDocument(document);
    return { ok: true, articles };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Dedupe key for multi-page merge (title + optional url). */
export function rowDedupeKey(row: RawRow): string {
  const title = normalizeTitleForMatch(String(row.title ?? ""));
  if (!title) return "";
  const url = typeof row.url === "string" ? row.url.trim() : "";
  return url ? `${title}\0${url}` : title;
}

/** Append page rows into accumulator; skip duplicate keys. */
export function mergePageRows(acc: RawRow[], page: RawRow[]): RawRow[] {
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

function controlLooksDisabled(el: Element): boolean {
  if (el.getAttribute("aria-disabled") === "true") return true;
  if ((el as HTMLButtonElement).disabled) return true;
  const cls = el.className?.toString?.() ?? "";
  if (/\bdisabled\b/i.test(cls) || /__nav_disabled\b/i.test(cls) || /_disabled\b/i.test(cls)) {
    return true;
  }
  return false;
}

/**
 * Find a usable next-page control. Live MP (appmsgpublish) uses WeUI mini buttons
 * inside `.weui-desktop-pagination`, often without a clean「下一页」label.
 */
export function findNextPageControl(root: ParentNode): HTMLElement | null {
  const nodes = root.querySelectorAll("a, button, span[role='button'], div[role='button']");
  for (const node of Array.from(nodes)) {
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text !== "下一页" && !/^下一页/.test(text) && text !== "下页") continue;
    if (controlLooksDisabled(node)) continue;
    return node as HTMLElement;
  }

  const doc = root as Document | Element;
  const pager =
    ("querySelector" in doc ? doc.querySelector(".weui-desktop-pagination") : null) ?? null;
  const scope: ParentNode = pager ?? root;
  const currentEl =
    "querySelector" in scope
      ? scope.querySelector(".weui-desktop-pagination__num_current")
      : null;
  const pageNow = currentEl ? parseInt((currentEl.textContent ?? "").trim(), 10) : NaN;

  const miniBtns = Array.from(
    "querySelectorAll" in scope
      ? scope.querySelectorAll(
          ".weui-desktop-btn.weui-desktop-btn_default.weui-desktop-btn_mini, button.weui-desktop-btn_mini, a.weui-desktop-btn_mini",
        )
      : [],
  ) as HTMLElement[];

  if (miniBtns.length > 0) {
    // Prefer last enabled mini button that is not「上一页」(typically「下一页」icon/text).
    const enabled = miniBtns.filter((b) => !controlLooksDisabled(b));
    const nextish = enabled.filter((b) => {
      const t = (b.textContent ?? "").replace(/\s+/g, " ").trim();
      return !/^上一?页/.test(t);
    });
    const candidate = nextish[nextish.length - 1] ?? enabled[enabled.length - 1];
    if (candidate) return candidate;
  }

  // Click the page number after current, when present.
  if (!Number.isNaN(pageNow) && "querySelectorAll" in scope) {
    const want = String(pageNow + 1);
    for (const num of Array.from(scope.querySelectorAll(".weui-desktop-pagination__num"))) {
      if ((num.textContent ?? "").trim() === want && !controlLooksDisabled(num)) {
        return num as HTMLElement;
      }
    }
  }

  return null;
}

export type WalkListPagesOpts = {
  extract: () => RawRow[];
  findNext: () => HTMLElement | null;
  clickNext: (el: HTMLElement) => void | Promise<void>;
  waitAfterClick: (beforeFingerprint: string) => Promise<void>;
  shouldAbort: () => boolean;
  maxPages?: number;
};

/** Pure multi-page driver for fixtures + live DOM. */
export async function walkListPages(
  opts: WalkListPagesOpts,
): Promise<{ articles: RawRow[]; stopReason: WalkStopReason; pagesWalked: number }> {
  const maxPages = opts.maxPages ?? MULTI_PAGE_CAP;
  let articles: RawRow[] = [];
  let pagesWalked = 0;
  let stopReason: WalkStopReason = "end";

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
        // Clicked next but list did not change — soft-fail (not true end-of-list).
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

let multiAbort = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleMultiExtract(): Promise<MultiExtractReply> {
  multiAbort = false;
  try {
    const fingerprint = () =>
      extractArticlesFromDocument(document)
        .map(rowDedupeKey)
        .filter(Boolean)
        .sort()
        .join("|");
    const result = await walkListPages({
      extract: () => extractArticlesFromDocument(document),
      findNext: () => findNextPageControl(document),
      clickNext: (el) => {
        el.click();
      },
      waitAfterClick: async (beforeFp) => {
        const deadline = Date.now() + 6000;
        while (Date.now() < deadline) {
          if (multiAbort) return;
          await delay(250);
          if (fingerprint() !== beforeFp) return;
        }
      },
      shouldAbort: () => multiAbort,
      maxPages: MULTI_PAGE_CAP,
    });
    return {
      ok: true,
      articles: result.articles,
      stopReason: result.stopReason,
      pagesWalked: result.pagesWalked,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      stopReason: "error",
    };
  }
}

/** Latest handlers — reinject updates this even when the router already exists. */
function installListMessageApi(): void {
  const w = window as Window & {
    __gzhQcListApi?: {
      onMessage: (
        message: unknown,
        sendResponse: (r: unknown) => void,
      ) => boolean | void;
    };
    __gzhQcListRouter?: boolean;
  };
  w.__gzhQcListApi = {
    onMessage(message, sendResponse) {
      if (!message || typeof message !== "object") return;
      const type = (message as { type?: string }).type;
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
    },
  };
  if (!w.__gzhQcListRouter) {
    w.__gzhQcListRouter = true;
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const api = (
        window as Window & {
          __gzhQcListApi?: {
            onMessage: (message: unknown, sendResponse: (r: unknown) => void) => boolean | void;
          };
        }
      ).__gzhQcListApi;
      if (!api) return;
      return api.onMessage(message, sendResponse);
    });
  }
}

declare global {
  interface Window {
    __gzhQcListBound?: boolean;
    __gzhQcListRouter?: boolean;
  }
}

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage && typeof window !== "undefined") {
  installListMessageApi();
}
