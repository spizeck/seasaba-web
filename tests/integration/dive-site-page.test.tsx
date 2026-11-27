import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DiveSitePage, { generateMetadata } from "@/app/(en)/(content)/dive-sites/[slug]/page";
import { apiSite, jsonResponse, sitesResponse } from "../fixtures/public-diving-api";
import { DIVE_SITE_MAP } from "@/data/dive-site-videos";

async function renderDiveSite(slug: string) {
  const ui = await DiveSitePage({ params: Promise.resolve({ slug }) });
  return render(ui);
}

function expectBefore(earlier: HTMLElement, later: HTMLElement) {
  expect(
    earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
}

describe("individual dive site pages", () => {
  it("places the video after the main site content and before related sites", async () => {
    await renderDiveSite("twilight-zone");

    const description = screen.getByText(DIVE_SITE_MAP["Twilight Zone"].description);
    const divingInfo = screen.getByRole("heading", { name: "Diving Twilight Zone" });
    const areaPhotography = screen.getByRole("heading", { name: "The Pinnacles Dive Area" });
    const videoButton = screen.getByRole("button", {
      name: /Watch the Twilight Zone dive site video/,
    });
    const relatedSites = screen.getByRole("link", { name: "Third Encounter" });
    const bookingCta = screen.getByRole("heading", { name: "Ready to dive Saba?" });

    expectBefore(description, divingInfo);
    expectBefore(divingInfo, areaPhotography);
    expectBefore(areaPhotography, videoButton);
    expectBefore(videoButton, relatedSites);
    expectBefore(relatedSites, bookingCta);
  });

  it("omits the video section entirely for sites without a video", async () => {
    await renderDiveSite("mt-michel");

    expect(
      screen.queryByRole("button", { name: /Watch the Mt\. Michel dive site video/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Pinnacles Dive Area" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Twilight Zone" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ready to dive Saba?" })).toBeInTheDocument();
  });

  it("keeps the privacy-conscious click-to-play YouTube facade", async () => {
    const { container } = await renderDiveSite("twilight-zone");

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open on YouTube/ })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=-OBgucAKms0"
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Watch the Twilight Zone dive site video/ })
    );

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("title", "Twilight Zone dive site");
    const embedUrl = new URL(iframe?.getAttribute("src") ?? "");
    expect(embedUrl.origin).toBe("https://www.youtube-nocookie.com");
    expect(embedUrl.pathname).toBe("/embed/-OBgucAKms0");
  });
});

describe("dive site pages with commissioned published content (issue #325)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  function commissionWith(sites: unknown[]) {
    vi.stubEnv("PUBLIC_DIVING_API_BASE_URL", "https://seasaba.app");
    vi.stubEnv("DIVE_SITE_CONTENT_SOURCE", "api");
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => jsonResponse(sitesResponse(sites)));
  }

  const published = apiSite({
    websitePublished: true,
    websiteContent: {
      slug: "twilight-zone",
      fullDescription: "Reviewed Twilight Zone copy.",
      seoTitle: "Twilight Zone Pinnacle Dive, Saba",
      seoDescription: "Reviewed SEO description.",
      youtubeVideoUrl: "https://www.youtube.com/watch?v=AAAAAAAAAAA",
    },
  });

  it("renders published copy while keeping layout, related sites and CTAs", async () => {
    commissionWith([published]);
    const { container } = await renderDiveSite("twilight-zone");

    expect(screen.getByText("Reviewed Twilight Zone copy.")).toBeInTheDocument();
    expect(screen.queryByText(DIVE_SITE_MAP["Twilight Zone"].description)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /Twilight Zone/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Third Encounter" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ready to dive Saba?" })).toBeInTheDocument();

    const jsonLd = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!
    );
    expect(jsonLd.description).toBe("Reviewed Twilight Zone copy.");

    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Watch the Twilight Zone dive site video/ }));
    expect(container.querySelector("iframe")!.getAttribute("src")).toMatch(
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/AAAAAAAAAAA\?/
    );
  });

  it("uses published SEO fields with the unchanged canonical URL", async () => {
    commissionWith([published]);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "twilight-zone" }) });
    expect(metadata.title).toBe("Twilight Zone Pinnacle Dive, Saba");
    expect(metadata.description).toBe("Reviewed SEO description.");
    expect(metadata.alternates?.canonical).toBe("https://www.seasaba.com/dive-sites/twilight-zone");
  });

  it("keeps static content for an active but unpublished site", async () => {
    commissionWith([apiSite({ active: true, websitePublished: false })]);
    await renderDiveSite("twilight-zone");
    expect(screen.getByText(DIVE_SITE_MAP["Twilight Zone"].description)).toBeInTheDocument();
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "twilight-zone" }) });
    expect(metadata.title).toBe("Twilight Zone Dive Site, Saba");
  });

  it("cannot break out of the JSON-LD script with published copy", async () => {
    const payload = '</script><script>alert(1)</script>';
    commissionWith([
      apiSite({ websitePublished: true, websiteContent: { slug: "twilight-zone", fullDescription: payload } }),
    ]);
    const { container } = await renderDiveSite("twilight-zone");
    const scripts = container.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].innerHTML).not.toContain("</script");
    expect(JSON.parse(scripts[0].textContent!).description).toBe(payload);
  });
});
