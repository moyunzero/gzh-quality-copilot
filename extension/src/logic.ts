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

export type RawRow = Record<string, unknown>;

export type ExtractOk = { ok: true; articles: RawRow[] };
export type ExtractErr = { ok: false; error: string };
export type ExtractReply = ExtractOk | ExtractErr;

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
