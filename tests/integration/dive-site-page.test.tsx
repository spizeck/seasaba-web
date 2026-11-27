import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DiveSitePage from "@/app/(en)/(content)/dive-sites/[slug]/page";
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
    expect(iframe?.getAttribute("src")).toContain(
      "https://www.youtube-nocookie.com/embed/-OBgucAKms0"
    );
  });
});
