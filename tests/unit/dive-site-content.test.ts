import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DIVE_SITE_MAP } from "@/data/dive-site-videos";
import {
  applyPublishedContent,
  getDiveSitePageContent,
  isDiveSiteApiContentEnabled,
  youtubeVideoId,
} from "@/lib/public-diving/dive-site-content";
import { apiSite, jsonResponse, sitesResponse } from "../fixtures/public-diving-api";

const fetchMock = vi.fn<typeof fetch>();
const twilight = DIVE_SITE_MAP["Twilight Zone"];

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function commission() {
  vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", "https://seasaba.app");
  vi.stubEnv("DIVE_SITE_CONTENT_SOURCE", "api");
}

describe("commissioning", () => {
  it("is off by default and needs both variables", () => {
    expect(isDiveSiteApiContentEnabled()).toBe(false);
    vi.stubEnv("DIVE_SITE_CONTENT_SOURCE", "api");
    expect(isDiveSiteApiContentEnabled()).toBe(false);
    vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", "https://seasaba.app");
    expect(isDiveSiteApiContentEnabled()).toBe(true);
  });

  it("serves static content without any network call when not commissioned", async () => {
    vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", "https://seasaba.app");
    await expect(getDiveSitePageContent("twilight-zone")).resolves.toEqual({
      ...twilight,
      contentSource: "static",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null for slugs outside the static catalogue", async () => {
    commission();
    await expect(getDiveSitePageContent("not-a-site")).resolves.toBeNull();
  });
});

describe("youtubeVideoId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=GcIUiaNwoCE", "GcIUiaNwoCE"],
    ["https://youtu.be/GcIUiaNwoCE", "GcIUiaNwoCE"],
    ["https://www.youtube-nocookie.com/embed/GcIUiaNwoCE", "GcIUiaNwoCE"],
    ["https://youtube.com/shorts/GcIUiaNwoCE", "GcIUiaNwoCE"],
    ["http://www.youtube.com/watch?v=GcIUiaNwoCE", undefined],
    ["https://evil.example/watch?v=GcIUiaNwoCE", undefined],
    ["https://www.youtube.com/watch?v=bad\"id", undefined],
    [undefined, undefined],
  ])("%s -> %s", (url, expected) => {
    expect(youtubeVideoId(url)).toBe(expected);
  });
});

describe("applyPublishedContent", () => {
  it("keeps every static field the published snapshot does not provide", () => {
    expect(applyPublishedContent(twilight, { siteId: "x", name: "Twilight Zone" })).toEqual({
      ...twilight,
      seoTitle: undefined,
      seoDescription: undefined,
      contentSource: "published",
    });
  });

  it("overrides description, video and SEO fields that are provided", () => {
    const content = applyPublishedContent(twilight, {
      siteId: "x",
      name: "Twilight Zone",
      shortDescription: "Short reviewed copy.",
      fullDescription: "Full reviewed copy.",
      youtubeVideoUrl: "https://youtu.be/AAAAAAAAAAA",
      seoTitle: "Twilight Zone, Saba",
    });
    expect(content).toMatchObject({
      name: twilight.name,
      area: twilight.area,
      description: "Full reviewed copy.",
      videoId: "AAAAAAAAAAA",
      seoTitle: "Twilight Zone, Saba",
      seoDescription: "Short reviewed copy.",
    });
  });
});

describe("getDiveSitePageContent when commissioned", () => {
  it("uses the published snapshot matched by slug", async () => {
    commission();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        sitesResponse([
          apiSite({
            websitePublished: true,
            websiteContent: { slug: "twilight-zone", fullDescription: "Reviewed." },
          }),
        ])
      )
    );
    await expect(getDiveSitePageContent("twilight-zone")).resolves.toMatchObject({
      description: "Reviewed.",
      contentSource: "published",
    });
  });

  it("falls back to static content when the site has no published snapshot", async () => {
    commission();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(sitesResponse([apiSite({ active: true, websitePublished: false })]))
    );
    await expect(getDiveSitePageContent("twilight-zone")).resolves.toEqual({
      ...twilight,
      contentSource: "static",
    });
  });

  it("falls back to static content on API failure at build time", async () => {
    commission();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { code: "backend_unavailable" } }, 503));
    await expect(getDiveSitePageContent("twilight-zone")).resolves.toMatchObject({
      contentSource: "static",
    });
  });

  it("throws on API failure at production runtime so ISR keeps the last good page", async () => {
    commission();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { code: "backend_unavailable" } }, 503));
    await expect(getDiveSitePageContent("twilight-zone")).rejects.toThrow("503");
  });
});
