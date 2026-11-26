import { describe, expect, it, vi, beforeEach } from "vitest";
import { loadWeeklyDiveStats } from "@/lib/dive-stats";
import { fetchDiveLogData } from "@/lib/firestore/dive-log";
import { rawDive } from "../fixtures/dives";

vi.mock("@/lib/firestore/dive-log", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/firestore/dive-log")>();
  return { ...original, fetchDiveLogData: vi.fn() };
});

function dataWith(dives: ReturnType<typeof rawDive>[]) {
  return {
    dives,
    sites: new Map(),
    species: new Map(),
    boats: new Map(),
  };
}

beforeEach(() => {
  vi.mocked(fetchDiveLogData).mockReset();
});

describe("loadWeeklyDiveStats failure semantics", () => {
  it("throws on an empty dives collection — a backend anomaly, never genuine production data", async () => {
    vi.mocked(fetchDiveLogData).mockResolvedValue(dataWith([]));
    await expect(loadWeeklyDiveStats()).rejects.toThrow("empty dives collection");
  });

  it("returns stats when the collection has dives, even if the window is empty", async () => {
    // A non-empty collection with only old dives is honest data: no recent
    // diving. The loader succeeds; the page decides to hide the section.
    vi.mocked(fetchDiveLogData).mockResolvedValue(dataWith([rawDive({ date: "2020-01-01" })]));
    const stats = await loadWeeklyDiveStats();
    expect(stats.diveCount).toBe(0);
  });

  it("rejects when the fetch does not settle within the timeout", async () => {
    vi.mocked(fetchDiveLogData).mockReturnValue(new Promise(() => {}));
    await expect(loadWeeklyDiveStats(50)).rejects.toThrow("timed out");
  });
});
