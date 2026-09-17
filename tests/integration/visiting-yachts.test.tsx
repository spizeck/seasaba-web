import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VisitingYachtsPage from "@/app/(content)/visiting-yachts/page";
import { visitingYachtsAnchors } from "@/lib/anchors";
import { DIVE_PRODUCTS, bookingHref } from "@/data/operations";

// Asserts the yacht guide is wired to canonical data and authoritative
// external sources — not that whole paragraphs read a particular way.

describe("visiting yachts page", () => {
  it("renders the guide with every section anchor the nav uses", () => {
    const { container } = render(<VisitingYachtsPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /visiting saba by yacht/i })
    ).toBeTruthy();
    for (const id of Object.values(visitingYachtsAnchors)) {
      expect(container.querySelector(`#${id}`), `missing #${id}`).not.toBeNull();
    }
  });

  it("links each scheduled trip through the canonical booking helper", () => {
    render(<VisitingYachtsPage />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const slug of ["classic", "advanced", "afternoon", "snorkel"] as const) {
      expect(hrefs, `missing booking link for ${slug}`).toContain(bookingHref(slug));
    }
    expect(hrefs).toContain(bookingHref(DIVE_PRODUCTS.private.slug));
  });

  it("points regulatory questions at the authorities, not Sea Saba", () => {
    render(<VisitingYachtsPage />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
    expect(hrefs.some((h) => h.startsWith("https://www.sabagov.nl/"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("https://sabapark.org/"))).toBe(true);
    // Every external link must be https (the e2e suite separately rejects
    // http:// anywhere it appears).
    for (const h of hrefs.filter((h) => h.startsWith("http"))) {
      expect(h.startsWith("https://")).toBe(true);
    }
  });

  it("routes yacht inquiries through the canonical contact model", () => {
    render(<VisitingYachtsPage />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/contact?interest=visiting-yacht");
    expect(hrefs).toContain("/diving");
  });

  it("makes Sea Saba's boundaries honest: guided diving, no promised fills or moorings", () => {
    render(<VisitingYachtsPage />);
    expect(
      screen.getAllByText((_, el) => /guided, from our boats|guided boats/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) => /first-come, first-served/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) => /ask before you arrive/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    // No invented public fill pricing anywhere on the page.
    const { container } = render(<VisitingYachtsPage />);
    expect(container.textContent).not.toMatch(/fill[^\n]{0,40}\$\d/i);
  });
});
