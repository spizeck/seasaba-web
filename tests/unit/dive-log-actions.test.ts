import { beforeEach, expect, it, vi } from "vitest";
import { loadDiveLogHistory, loadDiveLogSiteHistory } from "@/app/(en)/(content)/dive-log/actions";
import { isPublicDivingApiEnabled, loadPublicDivesFromApi } from "@/lib/public-diving/client";

vi.mock("@/lib/public-diving/client", () => ({
  isPublicDivingApiEnabled: vi.fn(() => true),
  loadDiveSitesFromApi: vi.fn().mockResolvedValue([
    { siteId: "s1", name: "Tent Reef" },
    { siteId: "s2", name: "Diamond Rock" },
  ]),
  loadPublicDivesFromApi: vi.fn().mockResolvedValue({ dives: [], generatedAt: 1 }),
}));

beforeEach(() => {
  vi.mocked(isPublicDivingApiEnabled).mockReturnValue(true);
  vi.mocked(loadPublicDivesFromApi).mockClear();
});

it("bounds 30/90-day ranges and requests all history only for all-time", async () => {
  await loadDiveLogHistory("30");
  await loadDiveLogHistory("90");
  await loadDiveLogHistory("all");
  const calls = vi.mocked(loadPublicDivesFromApi).mock.calls.map(([arg]) => arg ?? {});
  expect(calls[0]?.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(calls[2]).toEqual({ startDate: undefined, fresh: true });
  expect(calls.every((c) => c?.fresh)).toBe(true);
});

it("resolves a site name to its public siteId and requests only that site", async () => {
  const result = await loadDiveLogSiteHistory("Tent Reef");
  expect(result).not.toBeNull();
  expect(vi.mocked(loadPublicDivesFromApi).mock.calls).toEqual([[{ siteId: "s1", fresh: true }]]);
  // No date bound: all history for the one site.
  expect(vi.mocked(loadPublicDivesFromApi).mock.calls[0]?.[0]?.startDate).toBeUndefined();
});

it("returns null for unknown site names instead of loading full history", async () => {
  expect(await loadDiveLogSiteHistory("Atlantis")).toBeNull();
  expect(loadPublicDivesFromApi).not.toHaveBeenCalled();
});

it("rejects unknown ranges and refuses to run when API mode is off", async () => {
  await expect(loadDiveLogHistory("constructor")).rejects.toThrow("unavailable");
  await expect(loadDiveLogHistory("7")).rejects.toThrow("unavailable");
  vi.mocked(isPublicDivingApiEnabled).mockReturnValue(false);
  await expect(loadDiveLogHistory("all")).rejects.toThrow("unavailable");
  await expect(loadDiveLogSiteHistory("Tent Reef")).rejects.toThrow("unavailable");
  expect(loadPublicDivesFromApi).not.toHaveBeenCalled();
});
