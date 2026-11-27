import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isPublicDivingApiEnabled,
  loadPublicDivesFromApi,
  diveLogStartDate,
  loadPublishedDiveSitesFromApi,
  loadWeeklyDiveStatsFromApi,
  publicDivingApiBaseUrl,
  toPublicDive,
} from "@/lib/public-diving/client";
import { loadWeeklyDiveStats } from "@/lib/dive-stats";
import { fetchDiveLogData } from "@/lib/firestore/dive-log";
import {
  META,
  STATS_RESPONSE,
  apiDive,
  apiSite,
  divesPage,
  jsonResponse,
  sitesResponse,
} from "../fixtures/public-diving-api";

vi.mock("@/lib/firestore/dive-log", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/firestore/dive-log")>();
  return { ...original, fetchDiveLogData: vi.fn() };
});

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", "https://seasaba.app");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function requestedUrl(call = 0): URL {
  return new URL(String(fetchMock.mock.calls[call][0]));
}

describe("public diving API configuration", () => {
  it.each([
    ["", null],
    ["   ", null],
    ["not a url", null],
    ["http://seasaba.app", null],
    ["ftp://seasaba.app", null],
    ["https://seasaba.app/", "https://seasaba.app"],
    ["https://seasaba.app/api/public/v1", "https://seasaba.app"],
    ["http://localhost:3000", "http://localhost:3000"],
    ["http://127.0.0.1:3000", "http://127.0.0.1:3000"],
  ])("PUBLIC_DIVING_API_BASE_URL=%j resolves to %j", (raw, expected) => {
    vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", raw);
    expect(publicDivingApiBaseUrl()).toBe(expected);
    expect(isPublicDivingApiEnabled()).toBe(expected !== null);
  });

  it("refuses to fetch when not configured", async () => {
    vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", "");
    await expect(loadWeeklyDiveStatsFromApi()).rejects.toThrow("not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("dive mapping", () => {
  it("maps a v1 dive item onto the existing PublicDive view model", () => {
    expect(toPublicDive(apiDive())).toEqual({
      id: "dive-1",
      date: "2026-09-07",
      diveSlot: "10:30 am",
      boat: "Test Boat",
      diveGuide: "Alex, Sam",
      diveGuides: ["Alex", "Sam"],
      diveSite: "Tent Reef",
      diveSiteId: "site-1",
      maxDepth: 21,
      waterTemperature: 28,
      driftDive: false,
      sightings: [{ speciesId: "turtle", speciesName: "Green Turtle", count: 2 }],
    });
  });

  it("keeps omitted measurements omitted rather than inventing values", () => {
    const dive = toPublicDive(
      apiDive({
        maxDepthMeters: undefined,
        waterTemperatureCelsius: undefined,
        guideNames: [],
        isDrift: true,
        sightings: [{ speciesId: "ray", speciesName: "Eagle Ray" }],
      })
    );
    expect(dive).not.toHaveProperty("maxDepth");
    expect(dive).not.toHaveProperty("waterTemperature");
    expect(dive.diveGuide).toBe("Unknown");
    expect(dive.driftDive).toBe(true);
    expect(dive.sightings).toEqual([{ speciesId: "ray", speciesName: "Eagle Ray" }]);
  });

  it.each([
    ["missing siteName", { siteName: undefined }],
    ["non-numeric depth", { maxDepthMeters: "21" }],
    ["sightings not an array", { sightings: null }],
  ])("rejects a malformed item (%s)", (_label, overrides) => {
    expect(() => toPublicDive(apiDive(overrides))).toThrow("malformed");
  });
});

describe("loadPublicDivesFromApi", () => {
  it("bounds the request with startDate when given, and requests all history otherwise", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(divesPage([apiDive({ id: "a" })], { hasMore: true, nextCursor: "c1" })))
      .mockResolvedValueOnce(jsonResponse(divesPage([])));
    await loadPublicDivesFromApi({
      startDate: diveLogStartDate(14, Date.parse("2026-09-15T12:00:00Z")),
      fresh: true,
    });
    expect(requestedUrl(0).searchParams.get("startDate")).toBe("2026-09-01");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("next");
    expect(requestedUrl(1).searchParams.get("startDate")).toBe("2026-09-01");
    expect(requestedUrl(1).searchParams.get("cursor")).toBe("c1");
  });

  it("follows cursors until hasMore is false and preserves API order", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(divesPage([apiDive({ id: "a" })], { hasMore: true, nextCursor: "c1" }))
      )
      .mockResolvedValueOnce(jsonResponse(divesPage([apiDive({ id: "b" })])));

    const { dives } = await loadPublicDivesFromApi();

    expect(dives.map((d) => d.id)).toEqual(["a", "b"]);
    expect(requestedUrl(0).pathname).toBe("/api/public/v1/dives");
    expect(requestedUrl(0).searchParams.get("limit")).toBe("100");
    expect(requestedUrl(0).searchParams.has("cursor")).toBe(false);
    expect(requestedUrl(1).searchParams.get("cursor")).toBe("c1");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ next: { revalidate: 3600 } });
  });

  it("returns a genuine empty result for an empty 200", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(divesPage([])));
    await expect(loadPublicDivesFromApi()).resolves.toMatchObject({ dives: [] });
  });

  it("rejects a repeated cursor instead of looping", async () => {
    const page = divesPage([apiDive()], { hasMore: true, nextCursor: "same" });
    fetchMock.mockImplementation(async () => jsonResponse(page));
    await expect(loadPublicDivesFromApi()).rejects.toThrow("pagination cursor");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    [503, { error: { code: "backend_unavailable", message: "x" } }, "503 (backend_unavailable)"],
    [400, { error: { code: "invalid_query", message: "x" } }, "400 (invalid_query)"],
  ])("surfaces HTTP %i as a failure", async (status, body, message) => {
    fetchMock.mockResolvedValueOnce(jsonResponse(body, status));
    await expect(loadPublicDivesFromApi()).rejects.toThrow(message);
  });

  it("rejects a response declaring different units", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...divesPage([apiDive()]), meta: { ...META, units: { depth: "feet", temperature: "celsius" } } })
    );
    await expect(loadPublicDivesFromApi()).rejects.toThrow("units");
  });

  it("times out even when fetch ignores the abort signal (Next stale refetch)", async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    await expect(loadWeeklyDiveStatsFromApi(10)).rejects.toThrow("timed out");
  });

  it("times out a hung request", async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        })
    );
    await expect(loadPublicDivesFromApi({ timeoutMs: 10 })).rejects.toThrow("timed out");
  });
});

describe("dive-stats", () => {
  it("maps the v1 stats payload onto WeeklyDiveStats without recomputing", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(STATS_RESPONSE));
    await expect(loadWeeklyDiveStatsFromApi()).resolves.toEqual({
      avgTempCelsius: 27.4,
      tempReadingCount: 12,
      diveSitesVisited: 9,
      turtleSightings: 14,
      sharkSightings: 3,
      diveCount: 18,
      windowStart: "2026-09-01",
      windowEnd: "2026-09-07",
      generatedAt: Date.parse("2026-09-08T12:00:00.000Z"),
    });
    expect(requestedUrl().pathname).toBe("/api/public/v1/dive-stats");
  });

  it("keeps a null average and a zero-dive week as genuine values", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ...STATS_RESPONSE,
        data: { ...STATS_RESPONSE.data, averageWaterTemperatureCelsius: null, temperatureReadingCount: 0, diveCount: 0 },
      })
    );
    await expect(loadWeeklyDiveStatsFromApi()).resolves.toMatchObject({ avgTempCelsius: null, diveCount: 0 });
  });

  it("loadWeeklyDiveStats uses the API when commissioned and skips Firestore", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(STATS_RESPONSE));
    await expect(loadWeeklyDiveStats()).resolves.toMatchObject({ diveCount: 18 });
    expect(fetchDiveLogData).not.toHaveBeenCalled();
  });

  it("loadWeeklyDiveStats propagates API failure (homepage keeps last good page)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { code: "backend_unavailable" } }, 503));
    await expect(loadWeeklyDiveStats()).rejects.toThrow("503");
  });

  it("loadWeeklyDiveStats keeps the Firestore path when not commissioned", async () => {
    vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", "");
    vi.mocked(fetchDiveLogData).mockResolvedValue({ dives: [], sites: new Map(), species: new Map(), boats: new Map() });
    await expect(loadWeeklyDiveStats()).rejects.toThrow("empty dives collection");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("loadPublishedDiveSitesFromApi", () => {
  it("requests only published snapshots and ignores operational active status", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        sitesResponse([
          apiSite({ siteId: "active-draft", active: true, websitePublished: false }),
          apiSite({
            siteId: "inactive-published",
            name: "Diamond Rock",
            active: false,
            websitePublished: true,
            websiteContent: { slug: "diamond-rock", shortDescription: "Short.", reviewerName: "Reviewer" },
          }),
          apiSite({ siteId: "flag-without-content", websitePublished: true }),
        ])
      )
    );

    const sites = await loadPublishedDiveSitesFromApi();

    expect(requestedUrl().pathname).toBe("/api/public/v1/dive-sites");
    expect(requestedUrl().searchParams.get("published")).toBe("true");
    expect(requestedUrl().searchParams.has("active")).toBe(false);
    // reviewerName is internal provenance and is not carried to the page.
    expect(sites).toEqual([
      { siteId: "inactive-published", name: "Diamond Rock", slug: "diamond-rock", shortDescription: "Short." },
    ]);
  });
});
