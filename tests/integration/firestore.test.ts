import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDocs } from "firebase/firestore";
import { fetchDiveLogData, normalizeDive } from "@/lib/firestore/dive-log";
import { rawDive } from "../fixtures/dives";

vi.mock("firebase/firestore", async (importOriginal) => ({
  ...await importOriginal<typeof import("firebase/firestore")>(),
  collection: (_db: unknown, name: string) => name,
  getDocs: vi.fn(),
}));
const snapshot = (records: Record<string, unknown>) => ({ docs: Object.entries(records).map(([id, data]) => ({ id, data: () => data })) });
beforeEach(() => { vi.mocked(getDocs).mockReset(); });
describe("anonymous Firestore read boundary", () => {
  it("joins the four public collections into usable dive data", async () => {
    vi.mocked(getDocs).mockImplementation(async (ref) => {
      const rows = { dives: snapshot({ d1: { ...rawDive(), id: "d1" } }), sites: snapshot({ "site-1": { name: "Tent Reef" } }), species: snapshot({ turtle: { name: "Green Turtle" } }), boats: snapshot({ "boat-1": { name: "Test Boat" } }) };
      return rows[ref as unknown as keyof typeof rows] as never;
    });
    const { dives, sites, species, boats } = await fetchDiveLogData();
    expect(getDocs).toHaveBeenCalledTimes(4);
    expect(normalizeDive(dives[0], sites, species, boats)).toMatchObject({ diveSite: "Tent Reef", boat: "Test Boat", sightings: [{ speciesName: "Green Turtle" }] });
  });
  it("returns empty collections without inventing dives", async () => {
    vi.mocked(getDocs).mockResolvedValue(snapshot({}) as never);
    const result = await fetchDiveLogData();
    expect(result.dives).toEqual([]);
    expect(result.sites.size).toBe(0);
  });
  it("fails closed on permission denial rather than displaying partial data", async () => {
    vi.mocked(getDocs).mockImplementation(async (ref) => {
      if (String(ref) === "dives") throw { code: "permission-denied" };
      return snapshot({}) as never;
    });
    await expect(fetchDiveLogData()).rejects.toThrow("Missing or insufficient permissions for collection: dives");
  });
  it("reports all failed collections for service and network failures", async () => {
    vi.mocked(getDocs).mockRejectedValue(new Error("offline"));
    const error = await fetchDiveLogData().then(() => null, (reason: Error) => reason);
    expect(error?.message).toBe('Failed to load collection "dives": offline; Failed to load collection "sites": offline; Failed to load collection "species": offline; Failed to load collection "boats": offline');
  });
});
