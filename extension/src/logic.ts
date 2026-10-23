export const GOLD_KEYS = [
  "title",
  "publish_time",
  "read_count",
  "like_count",
  "share_count",
  "wow_count",
  "url",
  "body",
] as const;

export type GoldKey = (typeof GOLD_KEYS)[number];

export const COUNT_KEYS = ["read_count", "like_count", "share_count", "wow_count"] as const;

export type CountKey = (typeof COUNT_KEYS)[number];

export const FIXTURE_FILENAME = "articles.interchange.json";

/** Popup ↔ content-script message type for list extract. */
export const EXTRACT_MESSAGE = "EXTRACT_LIST" as const;
/** Opt-in multi-page walk (content script). */
export const EXTRACT_MULTI_MESSAGE = "EXTRACT_LIST_MULTI" as const;
/** Abort in-flight multi-page walk. */
export const CANCEL_MULTI_MESSAGE = "CANCEL_LIST_MULTI" as const;

/** Popup → service worker: start multi-page export (download survives popup close). */
export const BG_START_MULTI_MESSAGE = "BG_START_MULTI_EXPORT" as const;
/** Popup → service worker: cancel in-flight multi-page export. */
export const BG_CANCEL_MULTI_MESSAGE = "BG_CANCEL_MULTI_EXPORT" as const;
/** Popup → service worker: is a multi-page walk still running? */
export const BG_MULTI_STATUS_MESSAGE = "BG_MULTI_EXPORT_STATUS" as const;
/** Background ↔ content: one list page extract + next URL (sync). */
export const EXTRACT_PAGE_META_MESSAGE = "EXTRACT_LIST_PAGE_META" as const;

/** Safety cap so a broken pager cannot loop forever. */
export const MULTI_PAGE_CAP = 50;

export type RawRow = Record<string, unknown>;

export type ExtractOk = { ok: true; articles: RawRow[] };
export type ExtractErr = { ok: false; error: string };
export type ExtractReply = ExtractOk | ExtractErr;

export type WalkStopReason = "end" | "cancel" | "cap" | "error";

export type MultiExtractOk = {
  ok: true;
  articles: RawRow[];
  stopReason: WalkStopReason;
  pagesWalked: number;
};
export type MultiExtractErr = { ok: false; error: string; stopReason: "error" };
export type MultiExtractReply = MultiExtractOk | MultiExtractErr;

export type PageMetaOk = {
  ok: true;
  articles: RawRow[];
  nextUrl: string | null;
  pageNow: number;
  totalPages: number;
};
export type PageMetaErr = { ok: false; error: string };
export type PageMetaReply = PageMetaOk | PageMetaErr;

/**
 * Export-path title sanitize: whitespace, trailing 原创, trailing「已修改」/「已修改…」.
 * Extract/DOM match keeps its own normalizeTitleForMatch — do not overload that.
 */
export function sanitizeExportTitle(title: string): string {
  return String(title ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*原创\s*$/u, "")
    .replace(/\s*已修改(?:…|\.{1,3})?\s*$/u, "")
    .trim();
}

/** True for mp.weixin article share URLs (`/s/…` or `/s?…`). */
export function isShareArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "mp.weixin.qq.com") return false;
    return parsed.pathname === "/s" || parsed.pathname.startsWith("/s/");
  } catch {
    return false;
  }
}

/** Dedupe key for multi-page merge (sanitized title + optional url). */
export function rowDedupeKey(row: RawRow): string {
  const title = sanitizeExportTitle(String(row.title ?? ""));
  if (!title) return "";
  const url = typeof row.url === "string" ? row.url.trim() : "";
  return url ? `${title}\0${url}` : title;
}

type TitleUrlRow = { title?: string; url?: string };

function rowTitle(row: TitleUrlRow): string {
  return sanitizeExportTitle(String(row.title ?? ""));
}

function rowUrl(row: TitleUrlRow): string {
  return typeof row.url === "string" ? row.url.trim() : "";
}

/** Titles related after sanitize: equal, or one is a prefix of the other (min shorter len 6). */
export function titlesAreNearDup(a: string, b: string): boolean {
  const ta = sanitizeExportTitle(a);
  const tb = sanitizeExportTitle(b);
  if (!ta || !tb) return false;
  if (ta === tb) return true;
  const shorter = ta.length <= tb.length ? ta : tb;
  const longer = ta.length <= tb.length ? tb : ta;
  return shorter.length >= 6 && longer.startsWith(shorter);
}

/**
 * Near-dup: related titles plus URL-class signal (share `/s/` vs list/tempkey),
 * or exact sanitized title when either URL is missing.
 */
export function rowsAreNearDup(a: TitleUrlRow, b: TitleUrlRow): boolean {
  const ta = rowTitle(a);
  const tb = rowTitle(b);
  if (!titlesAreNearDup(ta, tb)) return false;

  const ua = rowUrl(a);
  const ub = rowUrl(b);
  if (!ua || !ub) return ta === tb;
  if (ua === ub) return true;

  return isShareArticleUrl(ua) !== isShareArticleUrl(ub);
}

/** Survivor: `/s/` URL → longer sanitized title → first-seen (`a`). */
export function preferNearDupRow<T extends TitleUrlRow>(a: T, b: T): T {
  const ua = rowUrl(a);
  const ub = rowUrl(b);
  const aShare = Boolean(ua) && isShareArticleUrl(ua);
  const bShare = Boolean(ub) && isShareArticleUrl(ub);
  if (aShare && !bShare) return a;
  if (bShare && !aShare) return b;

  const ta = rowTitle(a);
  const tb = rowTitle(b);
  if (tb.length > ta.length) return b;
  return a;
}

/** One left-to-right pass; keeps preferNearDupRow winner at first-seen index. */
function collapseNearDupRowsOnce<T extends TitleUrlRow>(rows: T[]): T[] {
  const out: T[] = [];
  for (const row of rows) {
    let idx = -1;
    for (let i = 0; i < out.length; i++) {
      if (rowsAreNearDup(out[i]!, row)) {
        idx = i;
        break;
      }
    }
    if (idx < 0) {
      out.push(row);
      continue;
    }
    out[idx] = preferNearDupRow(out[idx]!, row);
  }
  return out;
}

/**
 * Collapse near-dups until length stabilizes so a later `/s/` can absorb
 * multiple preceding tempkey prefix rows (e.g. [temp1, temp2, /s/] → [/s/]).
 */
export function collapseNearDupRows<T extends TitleUrlRow>(rows: T[]): T[] {
  let out = rows;
  let prevLen = -1;
  while (out.length !== prevLen) {
    prevLen = out.length;
    out = collapseNearDupRowsOnce(out);
  }
  return out;
}

/** Append page rows into accumulator; skip exact keys; collapse near-dups with preference. */
export function mergePageRows(acc: RawRow[], page: RawRow[]): RawRow[] {
  const seen = new Set(acc.map(rowDedupeKey).filter(Boolean));
  const out = [...acc];
  for (const row of page) {
    const key = rowDedupeKey(row);
    if (!key || seen.has(key)) continue;

    let nearIdx = -1;
    for (let i = 0; i < out.length; i++) {
      if (rowsAreNearDup(out[i]!, row)) {
        nearIdx = i;
        break;
      }
    }
    if (nearIdx >= 0) {
      const prev = out[nearIdx]!;
      const winner = preferNearDupRow(prev, row);
      if (winner !== prev) {
        const prevKey = rowDedupeKey(prev);
        if (prevKey) seen.delete(prevKey);
        out[nearIdx] = winner;
        seen.add(rowDedupeKey(winner));
      }
      continue;
    }

    seen.add(key);
    out.push(row);
  }
  return out;
}

/** Total pages from WeUI pager numerals; 1 when absent. */
export function totalPagesFromPagerText(texts: string[]): number {
  let max = 1;
  for (const raw of texts) {
    const n = parseInt(raw.trim(), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max;
}

/**
 * Next list URL via begin/count (appmsgpublish full-reload pagination).
 * Pure: pass pager numeral texts from the DOM separately.
 */
export function computeNextListPageUrl(
  href: string,
  pagerNumTexts: string[],
): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.hostname !== "mp.weixin.qq.com") return null;

  const begin = parseInt(url.searchParams.get("begin") || "0", 10);
  const count = parseInt(url.searchParams.get("count") || "10", 10) || 10;
  const totalPages = totalPagesFromPagerText(pagerNumTexts);
  const currentPage = Math.floor(begin / Math.max(count, 1)) + 1;
  if (currentPage >= totalPages) return null;

  const nextBegin = begin + count;
  url.searchParams.set("begin", String(nextBegin));
  if (!url.searchParams.get("count")) url.searchParams.set("count", String(count));
  return url.toString();
}

/** Sync page-meta reply shape used by EXTRACT_LIST_PAGE_META. */
export function buildPageMetaOk(
  href: string,
  articles: RawRow[],
  pagerNumTexts: string[],
  pageNow: number,
): PageMetaOk {
  const nextUrl = computeNextListPageUrl(href, pagerNumTexts);
  const totalPages = Math.max(pageNow, totalPagesFromPagerText(pagerNumTexts));
  return { ok: true, articles, nextUrl, pageNow, totalPages };
}

/** Popup opt-in → single extract vs background URL walk. */
export type PopupExportKind = "single" | "background-multi";

export function popupExportKind(multipageChecked: boolean): PopupExportKind {
  return multipageChecked ? "background-multi" : "single";
}

/** Pure gate for overlapping BG_START_MULTI (testable without chrome). */
export type MultiStartAccept = { ok: true } | { ok: false; error: "busy" };

export function createMultiStartGate(): {
  inFlight: () => boolean;
  accept: () => MultiStartAccept;
  release: () => void;
} {
  let inFlight = false;
  return {
    inFlight: () => inFlight,
    accept: () => {
      if (inFlight) return { ok: false, error: "busy" };
      inFlight = true;
      return { ok: true };
    },
    release: () => {
      inFlight = false;
    },
  };
}

/** True when a tab wait should resolve (event or already-complete snapshot). */
export function tabWaitShouldFinish(
  eventStatus: string | undefined,
  currentStatus: string | undefined,
): boolean {
  return eventStatus === "complete" || currentStatus === "complete";
}

/** Injectable SW multi-page loop (URL navigate + per-page meta). */
export type UrlMultiExportDeps = {
  fetchMeta: () => Promise<PageMetaReply>;
  navigate: (nextUrl: string) => Promise<void>;
  waitAfterNavigate: () => Promise<void>;
  shouldAbort: () => boolean;
  maxPages?: number;
};

export async function runUrlMultiExportLoop(deps: UrlMultiExportDeps): Promise<RawRow[]> {
  let articles: RawRow[] = [];
  const maxPages = deps.maxPages ?? MULTI_PAGE_CAP;

  for (let i = 0; i < maxPages; i++) {
    if (deps.shouldAbort()) break;

    let meta: PageMetaReply;
    try {
      meta = await deps.fetchMeta();
    } catch {
      break;
    }
    if (!meta || meta.ok === false) break;

    const page = Array.isArray(meta.articles) ? meta.articles : [];
    articles = mergePageRows(articles, page);

    if (!meta.nextUrl) break;
    if (deps.shouldAbort()) break;

    try {
      await deps.navigate(meta.nextUrl);
      await deps.waitAfterNavigate();
    } catch {
      break;
    }
  }

  return articles;
}

export type NormalizedArticle = {
  title?: string;
  publish_time?: string;
  read_count?: number;
  like_count?: number;
  share_count?: number;
  wow_count?: number;
  url?: string;
  _missing: string[];
};

function isCountKey(key: GoldKey): key is CountKey {
  return (COUNT_KEYS as readonly string[]).includes(key);
}

function parseCount(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const n = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : undefined;
}

function hasPresentValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

/** Omit absent gold keys; always omit body and list it in `_missing`. */
export function normalizeArticle(raw: RawRow): NormalizedArticle {
  const out: NormalizedArticle = { _missing: [] };

  for (const key of GOLD_KEYS) {
    if (key === "body") {
      out._missing.push("body");
      continue;
    }

    const value = raw[key];
    if (!hasPresentValue(value)) {
      out._missing.push(key);
      continue;
    }

    if (isCountKey(key)) {
      const n = parseCount(value);
      if (n === undefined) {
        out._missing.push(key);
      } else {
        out[key] = n;
      }
      continue;
    }

    if (key === "title") {
      const cleaned = sanitizeExportTitle(String(value));
      if (!cleaned) {
        out._missing.push(key);
      } else {
        out.title = cleaned;
      }
      continue;
    }

    out[key] = String(value);
  }

  return out;
}

export function normalizeArticles(rawRows: RawRow[]): { articles: NormalizedArticle[] } {
  return { articles: collapseNearDupRows(rawRows.map(normalizeArticle)) };
}

/** Align with manifest content_scripts: `/cgi-bin/appmsg*` and `/cgi-bin/appmsgpublish*`. */
export function isMpListUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "mp.weixin.qq.com") return false;
    const path = parsed.pathname;
    return path.startsWith("/cgi-bin/appmsg") || path.startsWith("/cgi-bin/appmsgpublish");
  } catch {
    return false;
  }
}

export function exportIsOffList(url: string | undefined): boolean {
  return !isMpListUrl(url);
}

/** Pre-export tab context: list-ready vs off-list vs mp non-list (login/home equivalent). */
export type TabExportContextKind = "ready" | "not-list" | "not-ready";

export type TabExportContext = {
  kind: TabExportContextKind;
  statusKind: "ok" | "danger" | "note";
  message: string;
};

/** Pure URL → status labels; no extract. Infers list/login from paths export already trusts. */
export function tabExportContext(url: string | undefined): TabExportContext {
  if (isMpListUrl(url)) {
    return {
      kind: "ready",
      statusKind: "ok",
      message: "本号已发表列表，可导出。",
    };
  }
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "mp.weixin.qq.com") {
        return {
          kind: "not-ready",
          statusKind: "danger",
          message: "请先登录本号列表。",
        };
      }
    } catch {
      // invalid URL → not-list
    }
  }
  return {
    kind: "not-list",
    statusKind: "danger",
    message: "当前不是已发表列表页。",
  };
}

export function assertGoldPayload(data: unknown): void {
  if (!data || typeof data !== "object" || !("articles" in data)) {
    throw new Error("missing articles");
  }
  const articles = (data as { articles: unknown }).articles;
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error("empty articles");
  }
  const first = articles[0];
  if (!first || typeof first !== "object") {
    throw new Error("bad article");
  }
  const row = first as Record<string, unknown>;
  for (const key of GOLD_KEYS) {
    if (!(key in row)) throw new Error(`missing ${key}`);
  }
  for (const key of COUNT_KEYS) {
    if (typeof row[key] !== "number") throw new Error(`${key} not number`);
  }
}

export function fixtureDownloadPlan(payload: unknown): { filename: string; json: string } {
  assertGoldPayload(payload);
  return { filename: FIXTURE_FILENAME, json: JSON.stringify(payload) };
}
