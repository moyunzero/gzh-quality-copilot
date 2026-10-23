# Walkthrough · Export title cleanup

Target: commit `bdb9bca` · Plan: [plan-export-title-cleanup-and-mid-high-dogfood.md](../plan-export-title-cleanup-and-mid-high-dogfood.md)

Review status: **complete** · closed 2026-10-23

## Blocks

- [x] **1. Intent** — done
- [x] **2. Broad strokes** — done
- [x] **3. Slice · Sanitize + preference** — done
- [x] **4. Slice · Collapse wiring** — done
- [x] **5. Periphery** — done

## 1. Intent

Source: frozen Intent from the plan (verbatim).

**Problem:** Multi-page export still ships near-duplicate rows (truncated title + tempkey URL vs full `/s/` URL) and dirty「已修改…」title suffixes, so authors get noisy interchange JSON.

**Approach:** Sanitize titles and collapse near-duplicates in the export normalize/merge path so single-page and multi-page downloads both stay clean.

## 2. Broad strokes

What changed generally: export JSON now strips「已修改」suffixes and collapses near-duplicate rows (truncated+tempkey vs fuller+/s/) before download.

Entry points (open in order):
- [logic.ts · sanitizeExportTitle](../../../extension/src/logic.ts) — strip dirty title suffix
- [logic.ts · preferNearDupRow / collapseNearDupRows](../../../extension/src/logic.ts) — /s/ wins, loop until stable
- [logic.ts · normalizeArticles](../../../extension/src/logic.ts) — single-page + post-merge cleanup path
- [pagination.test.mjs · export title sanitize](../../../extension/test/pagination.test.mjs) — matrix covering strip, preference, three-row collapse

## 3. Slice · Sanitize + preference

Source: [logic.ts](../../../extension/src/logic.ts) (`sanitizeExportTitle` … `preferNearDupRow`).

### `sanitizeExportTitle`
- Trim → collapse whitespace → strip trailing `原创` → strip trailing `已修改` / `已修改…` / `已修改...` → trim again.
- Used for export titles **and** for every near-dup comparison, so「标题已修改」与「标题」能对上。

### Near-dup identity
- `titlesAreNearDup`: 清洗后相等，或较短者长度 ≥ 6 且为较长者的前缀。
- `rowsAreNearDup`: 标题近重复，且 URL 信号匹配——两边都是 `/s/` 或都不是时需 URL 相同；一边 `/s/`、一边 tempkey/list 则视为同一篇；缺 URL 时仅标题全等才算。

### `preferNearDupRow`（谁留下）
1. 带 `mp.weixin.qq.com` 的 `/s` 或 `/s/…` 优先  
2. 否则清洗后标题更长的优先  
3. 否则保留先出现的（参数 `a`）

## 4. Slice · Collapse wiring

Source: [logic.ts](../../../extension/src/logic.ts) (`collapseNearDupRowsOnce` … `mergePageRows` / `normalizeArticles`).

### One pass (`collapseNearDupRowsOnce`)
- Left-to-right: for each row, find first already-kept near-dup; if none → push; if found → replace that slot with `preferNearDupRow` winner (index stays first-seen).

### Until stable (`collapseNearDupRows`)
- Repeat one-pass while `length` changes.
- Needed because one pass can leave residual: e.g. `[temp1, temp2, /s/]` — first pass may only merge pairwise; later `/s/` must absorb both prefixes → `[/s/]`.

### Wire-in
- `normalizeArticles`: `rawRows.map(normalizeArticle)` then `collapseNearDupRows` — single-page (and any normalize path) gets clean titles + collapsed rows.
- `mergePageRows`: exact `rowDedupeKey` skip first; else near-dup replace-in-place with same preference (updates `seen` keys when winner changes) — multi-page accumulator stays clean without a full re-collapse of the whole list each time.

### Tests
- [pagination.test.mjs](../../../extension/test/pagination.test.mjs): truncated+tempkey vs fuller+/s/; two tempkey prefixes + later `/s/`; `mergePageRows` preference; `normalizeArticles` end-to-end strip+collapse.

## 5. Periphery

### Boundaries (intentional)
- Prefix near-dup requires shorter sanitized title **≥ 6** chars — short stems won’t falsely merge.
- Two different `/s/` URLs with unrelated titles stay separate (tested).
- `isShareArticleUrl` only `mp.weixin.qq.com` `/s` or `/s/…`; list/tempkey never counts as share.
- Unit path does **not** need live WeChat.

### Out of scope (this commit / plan Never)
- New hosts; scraping other accounts.
- Skill / contracts / eval fixtures / gold schema / privacy freeze.
- **Mid/high dated dogfood** — still deferred (see deferred-work); queued after this walkthrough.

### After walkthrough
- Accept Periphery → close narrative → start mid/high dogfood HITL (or push `bdb9bca` if desired).
