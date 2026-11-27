import "server-only";

import type { PublicDive } from "@/lib/firestore/dive-log";
import type { WeeklyDiveStats } from "@/lib/dive-stats";

/**
 * Server-only client for the seasaba.app public diving API (v1), issue #325.
 * The API contract and methodology live in spizeck/contract-builder
 * PUBLIC_API.md; this module only fetches, validates and maps responses into
 * the view models the website already renders. It never recomputes
 * grouping or statistics.
 *
 * Commissioning seam (docs/PUBLIC_DIVING_API.md):
 *   PUBLIC_DIVING_API_BASE_URL unset -> callers keep the direct Firestore
 *   path, exactly as before. Set (e.g. https://seasaba.app) -> the Dive Log
 *   and homepage statistics are rendered from the API.
 *
 * Every failure (network, timeout, non-2xx, malformed body) throws so the
 * calling page can keep its last-known-good ISR output. A 200 response with
 * empty data is a genuine empty result per the contract.
 */

export const PUBLIC_DIVING_API_REVALIDATE_SECONDS = 3600;
const PAGE_LIMIT = 100;
// ~20k grouped dives; far above the current ~4.4k raw records, and stops a
// misbehaving cursor chain from looping indefinitely.
const MAX_PAGES = 200;

function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".localhost");
}

/** Validated API origin, or null when the API is not commissioned. */
export function publicDivingApiBaseUrl(): string | null {
  // Literal env read so scripts/check-env-vars.mjs can see it.
  const raw = process.env.PUBLIC_DIVING_API_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return url.origin;
    if (url.protocol === "http:" && isLoopbackHostname(url.hostname)) return url.origin;
    return null;
  } catch {
    return null;
  }
}

export function isPublicDivingApiEnabled(): boolean {
  return publicDivingApiBaseUrl() !== null;
}

export class PublicDivingApiError extends Error {
  constructor(message: string, readonly status?: number, readonly code?: string) {
    super(message);
    this.name = "PublicDivingApiError";
  }
}

function requireBaseUrl(): string {
  const base = publicDivingApiBaseUrl();
  if (!base) throw new PublicDivingApiError("Public diving API is not configured");
  return base;
}

async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
  const url = `${requireBaseUrl()}/api/public/v1/${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal,
      // Matches the pages' hourly ISR and the API's own hourly snapshot.
      next: { revalidate: PUBLIC_DIVING_API_REVALIDATE_SECONDS },
    });
  } catch (err) {
    if (signal.aborted) throw new PublicDivingApiError("Public diving API request timed out");
    throw new PublicDivingApiError(
      `Public diving API request failed: ${err instanceof Error ? err.name : "unknown"}`
    );
  }
  if (!res.ok) {
    let code: string | undefined;
    try {
      const body = (await res.json()) as { error?: { code?: unknown } };
      if (typeof body?.error?.code === "string") code = body.error.code;
    } catch {
      // Non-JSON error body: status alone is enough.
    }
    throw new PublicDivingApiError(
      `Public diving API responded ${res.status}${code ? ` (${code})` : ""}`,
      res.status,
      code
    );
  }
  try {
    return await res.json();
  } catch {
    throw new PublicDivingApiError("Public diving API returned invalid JSON");
  }
}

// --- Response validation ----------------------------------------------------

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function malformed(what: string): never {
  throw new PublicDivingApiError(`Public diving API returned a malformed ${what}`);
}

function str(value: unknown, what: string): string {
  if (typeof value !== "string") malformed(what);
  return value;
}

function optNum(value: unknown, what: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) malformed(what);
  return value;
}

function num(value: unknown, what: string): number {
  const n = optNum(value, what);
  if (n === undefined) malformed(what);
  return n;
}

function optStr(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function checkMeta(body: Json): void {
  if (!isObject(body.meta) || body.meta.version !== "v1") malformed("meta envelope");
  const units = body.meta.units;
  // Units are part of the contract; a change would silently mis-scale the
  // metric/imperial display, so refuse rather than render wrong numbers.
  if (!isObject(units) || units.depth !== "meters" || units.temperature !== "celsius") {
    malformed("units declaration");
  }
}

/** Map one v1 dive item onto the existing PublicDive view model. */
export function toPublicDive(item: unknown): PublicDive {
  if (!isObject(item)) malformed("dive");
  const guideNames = Array.isArray(item.guideNames)
    ? item.guideNames.filter((g): g is string => typeof g === "string" && g.trim() !== "")
    : malformed("dive guideNames");
  if (!Array.isArray(item.sightings)) malformed("dive sightings");
  const sightings = item.sightings.map((s) => {
    if (!isObject(s)) malformed("sighting");
    const count = optNum(s.count, "sighting count");
    return {
      speciesId: str(s.speciesId, "sighting speciesId"),
      speciesName: str(s.speciesName, "sighting speciesName"),
      ...(count !== undefined ? { count } : {}),
    };
  });
  const maxDepth = optNum(item.maxDepthMeters, "dive maxDepthMeters");
  const waterTemperature = optNum(item.waterTemperatureCelsius, "dive waterTemperatureCelsius");
  return {
    id: str(item.id, "dive id"),
    date: str(item.date, "dive date"),
    diveSlot: str(item.diveSlot, "dive diveSlot"),
    boat: str(item.boatName, "dive boatName"),
    diveGuide: guideNames.join(", ") || "Unknown",
    diveGuides: guideNames,
    diveSite: str(item.siteName, "dive siteName"),
    diveSiteId: str(item.siteId, "dive siteId"),
    ...(maxDepth !== undefined ? { maxDepth } : {}),
    ...(waterTemperature !== undefined ? { waterTemperature } : {}),
    driftDive: item.isDrift === true,
    sightings,
  };
}

/** Map the v1 dive-stats `data` object onto the homepage view model. */
export function toWeeklyDiveStats(data: unknown): WeeklyDiveStats {
  if (!isObject(data) || !isObject(data.reportingPeriod)) malformed("dive-stats payload");
  const avg = data.averageWaterTemperatureCelsius;
  const generatedAt = Date.parse(str(data.generatedAt, "dive-stats generatedAt"));
  if (!Number.isFinite(generatedAt)) malformed("dive-stats generatedAt");
  return {
    avgTempCelsius: avg === null ? null : num(avg, "dive-stats average temperature"),
    tempReadingCount: num(data.temperatureReadingCount, "dive-stats temperatureReadingCount"),
    diveSitesVisited: num(data.diveSitesVisited, "dive-stats diveSitesVisited"),
    turtleSightings: num(data.turtleSightings, "dive-stats turtleSightings"),
    sharkSightings: num(data.sharkSightings, "dive-stats sharkSightings"),
    diveCount: num(data.diveCount, "dive-stats diveCount"),
    windowStart: str(data.reportingPeriod.startDate, "dive-stats reportingPeriod"),
    windowEnd: str(data.reportingPeriod.endDate, "dive-stats reportingPeriod"),
    generatedAt,
  };
}

// The deadline is enforced by racing, not only by the abort signal: Next.js
// drops `signal` when it refetches a stale cached response.
async function withTimeout<T>(timeoutMs: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new PublicDivingApiError("Public diving API request timed out"));
    }, timeoutMs);
  });
  try {
    return await Promise.race([run(controller.signal), deadline]);
  } finally {
    clearTimeout(timer);
  }
}

// --- Loaders ----------------------------------------------------------------

/**
 * Full public Dive Log from GET /dives, following cursors until exhausted.
 * The API already returns grouped physical dives, most recent first, so the
 * list is used as-is. One overall timeout bounds the whole page chain.
 */
/** The Dive Log's default range; wider ranges are loaded on demand. */
export const DIVE_LOG_DEFAULT_DAYS = 14;

/**
 * UTC `YYYY-MM-DD` for `days` before `nowMs`: the same cutoff the Dive Log
 * client filters on, so a bounded fetch always covers the visible range.
 */
export function diveLogStartDate(days: number, nowMs = Date.now()): string {
  return new Date(nowMs - days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Pass `startDate` to bound the request (the API then uses a date-range
 * query); omitting it requests all history, per the v1 contract.
 */
export async function loadPublicDivesFromApi({
  startDate,
  timeoutMs = 20_000,
}: { startDate?: string; timeoutMs?: number } = {}): Promise<{ dives: PublicDive[]; generatedAt: number }> {
  return withTimeout(timeoutMs, async (signal) => {
    const dives: PublicDive[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
      if (startDate) params.set("startDate", startDate);
      if (cursor) params.set("cursor", cursor);
      const body = await getJson(`dives?${params}`, signal);
      if (!isObject(body) || !Array.isArray(body.data) || !isObject(body.pagination)) {
        malformed("dives response");
      }
      checkMeta(body);
      for (const item of body.data) dives.push(toPublicDive(item));
      if (body.pagination.hasMore !== true) {
        return { dives, generatedAt: Date.now() };
      }
      const next = body.pagination.nextCursor;
      if (typeof next !== "string" || !next || seenCursors.has(next)) {
        malformed("dives pagination cursor");
      }
      seenCursors.add(next);
      cursor = next;
    }
    throw new PublicDivingApiError("Public diving API pagination exceeded the page limit");
  });
}

/** Rolling seven-day homepage statistics from GET /dive-stats. */
export async function loadWeeklyDiveStatsFromApi(timeoutMs = 15_000): Promise<WeeklyDiveStats> {
  return withTimeout(timeoutMs, async (signal) => {
    const body = await getJson("dive-stats", signal);
    if (!isObject(body)) malformed("dive-stats response");
    checkMeta(body);
    return toWeeklyDiveStats(body.data);
  });
}

/**
 * The published websiteContent fields the dive-site pages render today.
 * Other contract fields (experienceLevel, featuredImage*, ...) are not read
 * until the pages present them.
 */
export interface PublishedDiveSiteContent {
  siteId: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  youtubeVideoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

const WEBSITE_CONTENT_FIELDS = [
  "slug",
  "shortDescription",
  "fullDescription",
  "youtubeVideoUrl",
  "seoTitle",
  "seoDescription",
] as const;

/**
 * Published website snapshots from GET /dive-sites?published=true. Only
 * sites with `websitePublished: true` and a `websiteContent` object are
 * returned; operational `active` is deliberately ignored here because an
 * active site is not necessarily approved for the website.
 */
export async function loadPublishedDiveSitesFromApi(
  timeoutMs = 15_000
): Promise<PublishedDiveSiteContent[]> {
  return withTimeout(timeoutMs, async (signal) => {
    const body = await getJson("dive-sites?published=true", signal);
    if (!isObject(body) || !Array.isArray(body.data)) malformed("dive-sites response");
    checkMeta(body);
    return body.data.flatMap((site): PublishedDiveSiteContent[] => {
      if (!isObject(site)) malformed("dive site");
      if (site.websitePublished !== true || !isObject(site.websiteContent)) return [];
      const content = site.websiteContent;
      const out: PublishedDiveSiteContent = {
        siteId: str(site.siteId, "dive site siteId"),
        name: str(site.name, "dive site name"),
      };
      for (const field of WEBSITE_CONTENT_FIELDS) {
        const value = optStr(content[field]);
        if (value !== undefined) out[field] = value;
      }
      return [out];
    });
  });
}
