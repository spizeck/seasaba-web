// Representative seasaba.app /api/public/v1 responses (contract-builder #404).
export const META = {
  generatedAt: "2026-09-08T12:00:00.000Z",
  units: { depth: "meters", temperature: "celsius" },
  version: "v1",
};

export function apiDive(overrides: Record<string, unknown> = {}) {
  return {
    id: "dive-1",
    date: "2026-09-07",
    diveSlot: "10:30 am",
    boatName: "Test Boat",
    siteId: "site-1",
    siteName: "Tent Reef",
    guideNames: ["Alex", "Sam"],
    maxDepthMeters: 21,
    waterTemperatureCelsius: 28,
    isDrift: false,
    sightings: [{ speciesId: "turtle", speciesName: "Green Turtle", count: 2 }],
    ...overrides,
  };
}

export function divesPage(
  data: unknown[],
  pagination: Record<string, unknown> = { hasMore: false }
) {
  return { data, pagination: { limit: 100, count: data.length, ...pagination }, meta: META };
}

export const STATS_RESPONSE = {
  data: {
    averageWaterTemperatureCelsius: 27.4,
    temperatureReadingCount: 12,
    diveSitesVisited: 9,
    turtleSightings: 14,
    sharkSightings: 3,
    diveCount: 18,
    reportingPeriod: { startDate: "2026-09-01", endDate: "2026-09-07", days: 7 },
    generatedAt: "2026-09-08T12:00:00.000Z",
  },
  meta: META,
};

export function apiSite(overrides: Record<string, unknown> = {}) {
  return {
    siteId: "site-tz",
    name: "Twilight Zone",
    active: true,
    habitatTypes: [],
    websitePublished: false,
    ...overrides,
  };
}

export function sitesResponse(data: unknown[]) {
  return { data, meta: META };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
