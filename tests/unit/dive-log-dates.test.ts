import { describe, expect, it } from "vitest";
import { diveLogRangeStartDate } from "@/lib/dive-log-dates";

function daysInclusive(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
}

describe("diveLogRangeStartDate", () => {
  const cases: [string, number, string][] = [
    ["2026-11-27T20:00:00Z", 14, "2026-11-14"],
    ["2026-11-27T20:00:00Z", 30, "2026-10-29"],
    ["2026-11-27T20:00:00Z", 90, "2026-08-30"],
    ["2026-11-27T20:00:00Z", 1, "2026-11-27"],
    ["2026-03-01T12:00:00Z", 14, "2026-02-16"], // month boundary, non-leap
    ["2024-03-01T12:00:00Z", 14, "2024-02-17"], // leap year
    ["2026-01-10T12:00:00Z", 14, "2025-12-28"], // year boundary
    ["2026-01-01T00:00:00Z", 1, "2026-01-01"],
  ];
  it.each(cases)("%s minus %i days starts %s", (now, days, expected) => {
    expect(diveLogRangeStartDate(days, Date.parse(now))).toBe(expected);
  });

  it("spans exactly the requested number of calendar days including today", () => {
    for (const days of [1, 7, 14, 30, 90]) {
      const end = "2026-11-27";
      const start = diveLogRangeStartDate(days, Date.parse(`${end}T23:59:59Z`));
      expect(daysInclusive(start, end)).toBe(days);
    }
  });

  it("is time-of-day independent within the same UTC day", () => {
    const a = diveLogRangeStartDate(14, Date.parse("2026-11-27T00:00:00Z"));
    const b = diveLogRangeStartDate(14, Date.parse("2026-11-27T23:59:59Z"));
    expect(a).toBe(b);
  });
});
