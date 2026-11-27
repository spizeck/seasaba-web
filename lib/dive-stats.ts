import { fetchDiveLogData, buildPublicDives, type PublicDive, type FirestoreSpecies } from "@/lib/firestore/dive-log";
import { isPublicDivingApiEnabled, loadWeeklyDiveStatsFromApi } from "@/lib/public-diving/client";

/**
 * Rolling seven-day diving statistics for the homepage, computed from the
 * same Firestore dive-log data the public dive log renders (issue #311).
 *
 * Data conventions (verified against production, Nov 2026):
 * - Dive dates are YYYY-MM-DD strings or Firestore Timestamps; the existing
 *   dive log normalizes both to UTC date strings, and these statistics use
 *   the same domain so the numbers always agree with what the dive log
 *   shows. Saba is UTC-4, so window boundaries can differ from local
 *   midnight by a few hours — accepted for consistency.
 * - Multiple dive records can describe one physical dive (same date, slot,
 *   boat, site) — e.g. one record per guide. `buildPublicDives` already
 *   deduplicates these into display groups, merging per-species sighting
 *   counts by maximum. All aggregation here operates on those groups so no
 *   dive is weighted twice.
 * - `waterTemperature` is stored Celsius-scaled. Production data contains
 *   clear entry errors (-19°C, 0°C); valid readings sit in a narrow tropical
 *   band (recent actuals: 28.9-30°C). Values outside VALID_TEMP_CELSIUS are
 *   excluded rather than averaged in.
 * - Sighting `count` is the number of animals recorded on that dive — not
 *   unique individuals across the week. The same turtle seen on three dives
 *   is three sightings, which is why everything is labeled "sightings".
 */

export const STATS_WINDOW_DAYS = 7;

// Physically plausible seawater bounds for Saba (tropical Caribbean; actual
// recorded range is roughly 25-30°C). Anything outside is a data-entry error.
const VALID_TEMP_CELSIUS = { min: 20, max: 33 } as const;

const TURTLE_CATEGORY = "turtles";
const SHARK_CATEGORY = "sharks";

export interface WeeklyDiveStats {
  /** Mean of valid per-dive temperatures in the window, Celsius. Null when no valid readings exist. */
  avgTempCelsius: number | null;
  /** Number of dives in the window that contributed a valid temperature. */
  tempReadingCount: number;
  /** Distinct canonical diveSiteIds across in-window dives. */
  diveSitesVisited: number;
  /** Summed turtle sighting counts across in-window dives (per-dive dedup by max). */
  turtleSightings: number;
  /** Summed shark sighting counts across in-window dives. */
  sharkSightings: number;
  /** Physical dives (deduplicated) recorded in the window. */
  diveCount: number;
  /** Inclusive window, YYYY-MM-DD UTC. */
  windowStart: string;
  windowEnd: string;
  /** When the underlying data was fetched/computed, ms epoch. */
  generatedAt: number;
}

function utcDateString(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

function isValidTemp(celsius: number): boolean {
  return (
    Number.isFinite(celsius) &&
    celsius >= VALID_TEMP_CELSIUS.min &&
    celsius <= VALID_TEMP_CELSIUS.max
  );
}

/**
 * Pure aggregation over grouped dives + the species map. `nowMs` is injected
 * so window boundaries are deterministic under test.
 */
export function computeWeeklyDiveStats(
  groupedDives: PublicDive[],
  species: Map<string, FirestoreSpecies>,
  nowMs: number
): WeeklyDiveStats {
  const windowEnd = utcDateString(nowMs);
  const windowStart = utcDateString(nowMs - (STATS_WINDOW_DAYS - 1) * 86_400_000);

  const inWindow = groupedDives.filter((d) => d.date >= windowStart && d.date <= windowEnd);

  // Temperature: average each physical dive's valid source readings first
  // (duplicate records of the same dive must not double-weight it), then
  // average across dives. Grouped dives carry `sourceTemperatures`; a lone
  // normalized dive falls back to its own reading so the function is correct
  // for both inputs.
  const perDiveMeans: number[] = [];
  for (const dive of inWindow) {
    const readings =
      dive.sourceTemperatures ??
      (dive.waterTemperature !== undefined ? [dive.waterTemperature] : []);
    const valid = readings.filter(isValidTemp);
    if (valid.length > 0) {
      perDiveMeans.push(valid.reduce((a, b) => a + b, 0) / valid.length);
    }
  }
  const avgTempCelsius =
    perDiveMeans.length > 0
      ? perDiveMeans.reduce((a, b) => a + b, 0) / perDiveMeans.length
      : null;

  const diveSiteIds = new Set(
    inWindow.map((d) => d.diveSiteId).filter((id): id is string => Boolean(id))
  );

  let turtleSightings = 0;
  let sharkSightings = 0;
  for (const dive of inWindow) {
    for (const sighting of dive.sightings) {
      const category = species.get(sighting.speciesId)?.category?.toLowerCase();
      const count = sighting.count ?? 1;
      if (category === TURTLE_CATEGORY) turtleSightings += count;
      else if (category === SHARK_CATEGORY) sharkSightings += count;
    }
  }

  return {
    avgTempCelsius,
    tempReadingCount: perDiveMeans.length,
    diveSitesVisited: diveSiteIds.size,
    turtleSightings,
    sharkSightings,
    diveCount: inWindow.length,
    windowStart,
    windowEnd,
    generatedAt: nowMs,
  };
}

/**
 * Fetch the rolling statistics: from the public diving API when
 * PUBLIC_DIVING_API_BASE_URL is set, otherwise computed from Firestore
 * dive-log data. The Firestore path uses the same
 * server-only access path as the dive-log page so cache-only snapshots can
 * never produce false zeros. Throws on failure — callers decide per phase
 * (build/dev fall back gracefully; production serving rethrows so ISR keeps
 * the last-good page).
 */
export async function loadWeeklyDiveStats(timeoutMs = 15_000): Promise<WeeklyDiveStats> {
  // Commissioned source (issue #325): seasaba.app computes the same
  // methodology server-side; a 200 with zero dives is a genuine empty week.
  if (isPublicDivingApiEnabled()) return loadWeeklyDiveStatsFromApi(timeoutMs);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Dive stats fetch timed out")), timeoutMs);
  });
  try {
    const data = await Promise.race([fetchDiveLogData({ serverOnly: true }), timeout]);
    // An empty dives collection is never genuine production data (the log
    // holds years of history) — it's the same backend-anomaly signature the
    // dive-log page treats as a failure. Throwing here lets production
    // serving preserve the last-good stats-bearing page instead of caching
    // a silently degraded one. This is distinct from a non-empty collection
    // with no dives in the window, which honestly means no recent diving
    // and simply hides the section.
    if (data.dives.length === 0) {
      throw new Error("Dive stats fetch returned an empty dives collection");
    }
    const grouped = buildPublicDives(data);
    return computeWeeklyDiveStats(grouped, data.species, Date.now());
  } finally {
    clearTimeout(timer);
  }
}

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * 1.8 + 32;
}
