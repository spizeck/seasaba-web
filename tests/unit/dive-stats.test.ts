import { describe, expect, it } from "vitest";
import { computeWeeklyDiveStats, celsiusToFahrenheit, STATS_WINDOW_DAYS } from "@/lib/dive-stats";
import { groupDivesForDisplay, type FirestoreSpecies } from "@/lib/firestore/dive-log";
import { publicDive } from "../fixtures/dives";

// Fixed reference instant: window runs 2026-11-20..2026-11-26 inclusive (UTC).
const NOW = new Date("2026-11-26T15:00:00Z").getTime();

function species(entries: [string, string][]): Map<string, FirestoreSpecies> {
  return new Map(entries.map(([id, category]) => [id, { id, name: id, category }]));
}

const SPECIES = species([
  ["green-turtle", "Turtles"],
  ["hawksbill", "Turtles"],
  ["nurse-shark", "Sharks"],
  ["reef-shark", "Sharks"],
  ["stingray", "Rays"],
  ["grouper", "Grouper"],
]);

/** Group raw public dives the same way production does, then compute stats. */
function statsFor(dives: ReturnType<typeof publicDive>[], now = NOW) {
  return computeWeeklyDiveStats(groupDivesForDisplay(dives), SPECIES, now);
}

function diveInWindow(overrides: Parameters<typeof publicDive>[0] = {}) {
  return publicDive({ date: "2026-11-24", waterTemperature: 28, ...overrides });
}

describe("rolling seven-day window", () => {
  it("includes dives on both boundary days and excludes those outside", () => {
    const stats = statsFor([
      diveInWindow({ id: "start", date: "2026-11-20" }),
      diveInWindow({ id: "end", date: "2026-11-26" }),
      diveInWindow({ id: "before", date: "2026-11-19" }),
      diveInWindow({ id: "after", date: "2026-11-27" }),
    ]);
    expect(stats.windowStart).toBe("2026-11-20");
    expect(stats.windowEnd).toBe("2026-11-26");
    expect(stats.diveCount).toBe(2);
    expect(STATS_WINDOW_DAYS).toBe(7);
  });

  it("rolls with the reference time rather than calendar weeks", () => {
    const tuesday = new Date("2026-11-24T08:00:00Z").getTime();
    const stats = statsFor([diveInWindow({ id: "x", date: "2026-11-17" }), diveInWindow({ id: "y", date: "2026-11-18" })], tuesday);
    expect(stats.windowStart).toBe("2026-11-18");
    expect(stats.diveCount).toBe(1);
  });
});

describe("water temperature averaging", () => {
  it("averages valid readings across distinct dives", () => {
    const stats = statsFor([
      diveInWindow({ id: "a", waterTemperature: 28, diveSlot: "9am" }),
      diveInWindow({ id: "b", waterTemperature: 30, diveSlot: "11am" }),
    ]);
    expect(stats.avgTempCelsius).toBeCloseTo(29);
    expect(stats.tempReadingCount).toBe(2);
  });

  it("converts Celsius to Fahrenheit for display", () => {
    expect(celsiusToFahrenheit(28)).toBeCloseTo(82.4);
    expect(Math.round(celsiusToFahrenheit(28.9))).toBe(84);
  });

  it.each([-19, 0, 4.4, 19.9, 33.1, 40, NaN])("excludes clearly erroneous reading %s", (temp) => {
    const stats = statsFor([diveInWindow({ waterTemperature: temp })]);
    expect(stats.avgTempCelsius).toBeNull();
    expect(stats.tempReadingCount).toBe(0);
  });

  it.each([20, 25.5, 33])("accepts plausible reading %s", (temp) => {
    expect(statsFor([diveInWindow({ waterTemperature: temp })]).avgTempCelsius).toBeCloseTo(temp);
  });

  it("ignores missing temperatures without zeroing the average", () => {
    const stats = statsFor([
      diveInWindow({ id: "a", waterTemperature: 28, diveSlot: "9am" }),
      diveInWindow({ id: "b", waterTemperature: undefined, diveSlot: "11am" }),
    ]);
    expect(stats.avgTempCelsius).toBeCloseTo(28);
    expect(stats.tempReadingCount).toBe(1);
  });

  it("does not double-weight duplicate records of the same physical dive", () => {
    // Two records of the same dive (same date/slot/boat/site) merging into one
    // group: the dive must count once even though both carry a temperature.
    const dupes = [
      diveInWindow({ id: "rec-1", waterTemperature: 28 }),
      diveInWindow({ id: "rec-2", waterTemperature: 28 }),
      diveInWindow({ id: "other", waterTemperature: 30, diveSlot: "1pm" }),
    ];
    const stats = statsFor(dupes);
    // (28 + 30) / 2, not (28 + 28 + 30) / 3
    expect(stats.avgTempCelsius).toBeCloseTo(29);
    expect(stats.tempReadingCount).toBe(2);
    expect(stats.diveCount).toBe(2);
  });
});

describe("distinct dive-site counting", () => {
  it("counts canonical site ids, not names or records", () => {
    const stats = statsFor([
      diveInWindow({ id: "a", diveSiteId: "site-1", diveSlot: "9am" }),
      diveInWindow({ id: "b", diveSiteId: "site-1", diveSlot: "11am" }), // same site again
      diveInWindow({ id: "c", diveSiteId: "site-2", diveSlot: "1pm" }),
    ]);
    expect(stats.diveSitesVisited).toBe(2);
  });

  it("excludes records with no site id", () => {
    const stats = statsFor([diveInWindow({ id: "a", diveSiteId: "" }), diveInWindow({ id: "b", diveSiteId: undefined, diveSlot: "1pm" })]);
    expect(stats.diveSitesVisited).toBe(0);
    expect(stats.diveCount).toBe(2);
  });
});

describe("species classification and sighting quantities", () => {
  function diveWithSightings(sightings: { speciesId: string; speciesName: string; count?: number }[], id = "d1") {
    return diveInWindow({ id, sightings });
  }

  it("sums recorded counts for turtle and shark categories", () => {
    const stats = statsFor([
      diveWithSightings([
        { speciesId: "green-turtle", speciesName: "Green Turtle", count: 5 },
        { speciesId: "hawksbill", speciesName: "Hawksbill Turtle", count: 2 },
        { speciesId: "nurse-shark", speciesName: "Nurse Shark", count: 3 },
        { speciesId: "reef-shark", speciesName: "Reef Shark", count: 1 },
      ]),
    ]);
    expect(stats.turtleSightings).toBe(7);
    expect(stats.sharkSightings).toBe(4);
  });

  it("excludes rays and unrelated species from shark totals", () => {
    const stats = statsFor([
      diveWithSightings([
        { speciesId: "stingray", speciesName: "Stingray", count: 4 },
        { speciesId: "grouper", speciesName: "Grouper", count: 10 },
      ]),
    ]);
    expect(stats.turtleSightings).toBe(0);
    expect(stats.sharkSightings).toBe(0);
  });

  it("treats a missing count as one sighting", () => {
    const stats = statsFor([diveWithSightings([{ speciesId: "green-turtle", speciesName: "Green Turtle" }])]);
    expect(stats.turtleSightings).toBe(1);
  });

  it("deduplicates per-dive records by max count rather than summing duplicates", () => {
    // Same physical dive logged twice: one record says 4 turtles, the other 2.
    const stats = statsFor([
      diveWithSightings([{ speciesId: "green-turtle", speciesName: "Green Turtle", count: 4 }], "rec-1"),
      diveWithSightings([{ speciesId: "green-turtle", speciesName: "Green Turtle", count: 2 }], "rec-2"),
    ]);
    expect(stats.turtleSightings).toBe(4);
    expect(stats.diveCount).toBe(1);
  });

  it("ignores species missing from the reference map", () => {
    const stats = statsFor([diveWithSightings([{ speciesId: "unknown-sp", speciesName: "Mystery", count: 9 }])]);
    expect(stats.turtleSightings).toBe(0);
    expect(stats.sharkSightings).toBe(0);
  });
});

describe("zero versus unavailable", () => {
  it("reports genuine zeros when dives exist but nothing was sighted", () => {
    const stats = statsFor([diveInWindow({ sightings: [] })]);
    expect(stats.diveCount).toBe(1);
    expect(stats.turtleSightings).toBe(0);
    expect(stats.sharkSightings).toBe(0);
  });

  it("reports zero dives for an empty dataset and null temperature", () => {
    const stats = statsFor([]);
    expect(stats.diveCount).toBe(0);
    expect(stats.avgTempCelsius).toBeNull();
    expect(stats.diveSitesVisited).toBe(0);
    expect(stats.turtleSightings).toBe(0);
  });

  it("reports null temperature when all readings are invalid", () => {
    const stats = statsFor([diveInWindow({ waterTemperature: -5 }), diveInWindow({ id: "b", waterTemperature: 41, diveSlot: "1pm" })]);
    expect(stats.avgTempCelsius).toBeNull();
    expect(stats.diveCount).toBe(2);
  });
});
