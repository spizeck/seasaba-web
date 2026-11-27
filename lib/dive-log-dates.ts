/**
 * Inclusive UTC `YYYY-MM-DD` start of a range of exactly `days` calendar
 * days ending today: 14 days ending 2026-11-27 starts 2026-11-14, not the
 * 13th, which would span 15 dates. The API filters `date >= startDate`
 * inclusively and computes its own 7-day stats window the same way. UTC
 * matches the dives' stored date strings, and subtracting whole days from
 * the epoch keeps month/year boundaries and leap years correct.
 */
export function diveLogRangeStartDate(days: number, nowMs: number): string {
  return new Date(nowMs - (days - 1) * 86_400_000).toISOString().slice(0, 10);
}
