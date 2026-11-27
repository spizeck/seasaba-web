import { beforeEach, expect, it, vi } from "vitest";
import { loadDiveLogHistory } from "@/app/(en)/(content)/dive-log/actions";
import { isPublicDivingApiEnabled, loadPublicDivesFromApi } from "@/lib/public-diving/client";

vi.mock("@/lib/public-diving/client", () => ({
  isPublicDivingApiEnabled: vi.fn(() => true),
  loadPublicDivesFromApi: vi.fn().mockResolvedValue({ dives: [], generatedAt: 1 }),
  diveLogStartDate: (days: number) => `start-${days}`,
}));

beforeEach(() => {
  vi.mocked(isPublicDivingApiEnabled).mockReturnValue(true);
  vi.mocked(loadPublicDivesFromApi).mockClear();
});

it("bounds 30/90-day ranges and requests all history only for all-time", async () => {
  await loadDiveLogHistory("30");
  await loadDiveLogHistory("90");
  await loadDiveLogHistory("all");
  expect(vi.mocked(loadPublicDivesFromApi).mock.calls).toEqual([
    [{ startDate: "start-30", fresh: true }],
    [{ startDate: "start-90", fresh: true }],
    [{ startDate: undefined, fresh: true }],
  ]);
});

it("rejects unknown ranges and refuses to run when API mode is off", async () => {
  await expect(loadDiveLogHistory("constructor")).rejects.toThrow("unavailable");
  await expect(loadDiveLogHistory("7")).rejects.toThrow("unavailable");
  vi.mocked(isPublicDivingApiEnabled).mockReturnValue(false);
  await expect(loadDiveLogHistory("all")).rejects.toThrow("unavailable");
  expect(loadPublicDivesFromApi).not.toHaveBeenCalled();
});
