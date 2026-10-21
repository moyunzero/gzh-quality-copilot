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

    out[key] = String(value);
  }

  return out;
}

export function normalizeArticles(rawRows: RawRow[]): { articles: NormalizedArticle[] } {
  return { articles: rawRows.map(normalizeArticle) };
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
