import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import HomePage from "@/app/(en)/page";
import { loadWeeklyDiveStats, type WeeklyDiveStats } from "@/lib/dive-stats";

vi.mock("@/lib/dive-stats", () => ({
  loadWeeklyDiveStats: vi.fn(),
  celsiusToFahrenheit: (c: number) => c * 1.8 + 32,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.stubGlobal(
  "matchMedia",
  (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })
);

function statsFixture(overrides: Partial<WeeklyDiveStats> = {}): WeeklyDiveStats {
  return {
    avgTempCelsius: 29.2,
    tempReadingCount: 14,
    diveSitesVisited: 11,
    turtleSightings: 17,
    sharkSightings: 8,
    diveCount: 18,
    windowStart: "2026-11-20",
    windowEnd: "2026-11-26",
    generatedAt: 0,
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(loadWeeklyDiveStats).mockReset();
});

afterEach(() => vi.unstubAllEnvs());

describe("homepage dive-team statistics", () => {
  it("renders the stats section server-side when data is available", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.mocked(loadWeeklyDiveStats).mockResolvedValue(statsFixture());
    const { container } = render(await HomePage());
    const section = container.querySelector('[aria-labelledby="dive-stats-heading"]');
    expect(section).toBeTruthy();
    expect(section!.textContent).toContain("This Week Beneath the Surface");
    expect(section!.textContent).toContain("85°F");
    expect(section!.textContent).toContain("/ 29°C");
    expect(section!.textContent).toContain("11");
    expect(section!.textContent).toContain("17");
    expect(section!.textContent).toContain("8");
    expect(section!.textContent).toContain("Nov 20 – Nov 26, 2026");
    // Links onward to the dive log.
    const link = section!.querySelector('a[href="/dive-log"]');
    expect(link).toBeTruthy();
  });

  it("renders a genuine zero sightings count when dives happened but nothing was seen", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.mocked(loadWeeklyDiveStats).mockResolvedValue(statsFixture({ turtleSightings: 0 }));
    const { container } = render(await HomePage());
    const section = container.querySelector('[aria-labelledby="dive-stats-heading"]');
    expect(section).toBeTruthy();
    expect(section!.textContent).toContain("Turtle sightings");
  });

  it("hides only the temperature metric when no valid readings exist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.mocked(loadWeeklyDiveStats).mockResolvedValue(statsFixture({ avgTempCelsius: null, tempReadingCount: 0 }));
    const { container } = render(await HomePage());
    const section = container.querySelector('[aria-labelledby="dive-stats-heading"]');
    expect(section).toBeTruthy();
    expect(section!.textContent).not.toContain("water temperature");
    expect(section!.textContent).toContain("Dive sites visited");
  });

  it("hides the whole section when no dives were recorded — never misleading zeros", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.mocked(loadWeeklyDiveStats).mockResolvedValue(statsFixture({ diveCount: 0 }));
    const { container } = render(await HomePage());
    expect(container.querySelector('[aria-labelledby="dive-stats-heading"]')).toBeNull();
    // The rest of the homepage is unaffected.
    expect(container.textContent).toContain("Questions guests ask");
  });

  it("rethrows on fetch failure in production serving so ISR keeps the last-good page", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.mocked(loadWeeklyDiveStats).mockRejectedValue(new Error("firestore down"));
    await expect(HomePage()).rejects.toThrow("firestore down");
  });

  it("renders the homepage without stats on fetch failure at build time", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.mocked(loadWeeklyDiveStats).mockRejectedValue(new Error("firestore down"));
    const { container } = render(await HomePage());
    expect(container.querySelector('[aria-labelledby="dive-stats-heading"]')).toBeNull();
    expect(container.textContent).toContain("Questions guests ask");
  });

  it("renders the homepage without stats on fetch failure in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PHASE", "");
    vi.mocked(loadWeeklyDiveStats).mockRejectedValue(new Error("firestore down"));
    const { container } = render(await HomePage());
    expect(container.querySelector('[aria-labelledby="dive-stats-heading"]')).toBeNull();
    expect(container.textContent).toContain("Questions guests ask");
  });
});
