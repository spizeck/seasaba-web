import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { convertDepth, convertTemperature, depthUnit, temperatureUnit, formatDate, normalizeDive, groupDivesForDisplay } from "@/lib/firestore/dive-log";
import { diveData, rawDive, publicDive } from "../fixtures/dives";

describe("dive measurements", () => {
  it.each([[21, "metric", 21], [21, "imperial", 69], [0, "imperial", 0], [undefined, "metric", undefined]] as const)("converts depth %s in %s", (input, unit, output) => expect(convertDepth(input, unit)).toBe(output));
  it.each([[28, "metric", 28], [28, "imperial", 82], [0, "imperial", 32], [undefined, "imperial", undefined]] as const)("converts temperature %s in %s", (input, unit, output) => expect(convertTemperature(input, unit)).toBe(output));
  it("labels units and displays the original calendar day", () => {
    expect([depthUnit("metric"), depthUnit("imperial"), temperatureUnit("metric"), temperatureUnit("imperial")]).toEqual(["m", "ft", "°C", "°F"]);
    expect(formatDate("2026-09-07")).toContain("Sep 7, 2026");
  });
});
describe("public dive normalization", () => {
  const { sites, species, boats } = diveData();
  it("resolves reference data, dates, guides and sightings without exposing creator metadata", () => {
    const normalized = normalizeDive(rawDive({ date: Timestamp.fromDate(new Date("2026-09-07T20:00:00Z")), createdBy: "private-user", diveGuides: [" Alex ", "", "Sam"] }), sites, species, boats);
    expect(normalized).toMatchObject({ date: "2026-09-07", diveSite: "Tent Reef", boat: "Test Boat", diveGuide: "Alex, Sam", sightings: [{ speciesName: "Green Turtle", count: 2 }] });
    expect(normalized).not.toHaveProperty("createdBy");
    expect(normalized).not.toHaveProperty("createdAt");
  });
  it.each([" Alex, Sam ", ["Alex", " Sam "]])("supports legacy guide representation %s", (diveGuide) => {
    expect(normalizeDive(rawDive({ diveGuides: undefined, diveGuide }), sites, species, boats).diveGuides).toEqual(["Alex", "Sam"]);
  });
  it("retains unresolved IDs and handles missing guide information", () => {
    expect(normalizeDive(rawDive({ diveGuides: undefined }), new Map(), new Map(), new Map())).toMatchObject({ diveSite: "site-1", boat: "boat-1", diveGuide: "Unknown", sightings: [{ speciesName: "turtle" }] });
  });
  it("recognizes drift slots and drift sites", () => {
    expect(normalizeDive(rawDive({ diveSlot: "Drift" }), sites, species, boats).driftDive).toBe(true);
    expect(normalizeDive(rawDive(), new Map([["site-1", { id: "site-1", name: "Drift Reef" }]]), species, boats).driftDive).toBe(true);
  });
});
describe("grouping reports of the same dive", () => {
  it("deduplicates guides/species, uses maximum counts rather than summing, and preserves sources", () => {
    const a = publicDive();
    const b = publicDive({ id: "dive-2", diveGuides: ["Alex", "Sam"], maxDepth: 24, waterTemperature: 27, sightings: [{ speciesId: "turtle", speciesName: "Green Turtle", count: 3 }, { speciesId: "ray", speciesName: "Ray" }] });
    const before = structuredClone([a, b]);
    const [group] = groupDivesForDisplay([b, a]);
    expect(group).toMatchObject({ id: "dive-1+dive-2", diveGuides: ["Alex", "Sam"], maxDepth: 24, waterTemperature: 28 });
    expect(group.sightings).toEqual([{ speciesId: "turtle", speciesName: "Green Turtle", count: 3 }, { speciesId: "ray", speciesName: "Ray" }]);
    expect(group.sourceDives).toHaveLength(2);
    expect([a, b]).toEqual(before);
  });
  it.each([{ date: "2026-09-06" }, { boat: "Other boat" }, { diveSite: "Other site" }, { diveSlot: "1 pm" }])("does not combine different dive identities %s", (change) => expect(groupDivesForDisplay([publicDive(), publicDive({ id: "other", ...change })])).toHaveLength(2));
  it("handles empty input and unknown measurements/counts", () => {
    expect(groupDivesForDisplay([])).toEqual([]);
    const [group] = groupDivesForDisplay([publicDive({ maxDepth: undefined, waterTemperature: undefined, sightings: [{ speciesId: "", speciesName: "Ray" }] }), publicDive({ id: "two", maxDepth: undefined, waterTemperature: undefined, sightings: [{ speciesId: "", speciesName: "Ray", count: 1 }] })]);
    expect(group.maxDepth).toBeUndefined();
    expect(group.waterTemperature).toBeUndefined();
    expect(group.sightings[0].count).toBe(1);
  });
});
