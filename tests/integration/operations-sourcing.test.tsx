import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DivingPage from "@/app/(content)/diving/page";
import { divingAnchors } from "@/lib/anchors";
import { DIVE_PRODUCTS, OPERATIONS, bookingHref, type BookableProduct } from "@/data/operations";

// Asserts the diving page is wired to the canonical registry — the values
// themselves are not duplicated here, so this cannot become a second
// source of truth.

describe("diving page canonical sourcing", () => {
  it("renders each scheduled product's name and departure from the registry", () => {
    render(<DivingPage />);
    for (const p of Object.values(DIVE_PRODUCTS) as BookableProduct[]) {
      expect(screen.getAllByText(p.name).length).toBeGreaterThan(0);
      if (p.schedule) {
        const departure = p.schedule.departure;
        expect(
          screen.getAllByText((_, el) => el?.textContent?.includes(departure) ?? false).length
        ).toBeGreaterThan(0);
      }
    }
  });

  it("renders the shared guide-ratio and nitrox facts", () => {
    render(<DivingPage />);
    expect(
      screen.getAllByText((_, el) => el?.textContent?.includes(`${OPERATIONS.maxRecreationalDiversPerGuide} divers per guide`) ?? false).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) => el?.textContent?.includes(`${OPERATIONS.nitroxBlend} Nitrox`) ?? false).length
    ).toBeGreaterThan(0);
  });

  it("renders the canonical Advanced eligibility rule verbatim", () => {
    render(<DivingPage />);
    expect(
      screen.getAllByText((_, el) => el?.textContent?.includes(DIVE_PRODUCTS.advanced.requirement!) ?? false).length
    ).toBeGreaterThan(0);
  });

  it("keeps the Scuba Diver private-guide rule and dive-computer requirement on the page", () => {
    render(<DivingPage />);
    expect(
      screen.getAllByText((_, el) => /private guide/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) => /dive computer is required|dive computer — required/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
  });

  it("describes the shared dive-day slots and same-day afternoon add-on honestly", () => {
    render(<DivingPage />);
    expect(
      screen.getAllByText((_, el) => /Dives 2 and 3 shared/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) => /space permitting/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
  });

  it("presents refresher guidance as recommendation, then requirement at Sea Saba's discretion", () => {
    render(<DivingPage />);
    expect(
      screen.getAllByText((_, el) =>
        el?.textContent?.includes(`more than ${OPERATIONS.refresher.recommendedAfterYears} year`) ?? false
      ).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) => /recommend a refresher/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) =>
        el?.textContent?.includes(`${OPERATIONS.refresher.generallyRequiredAfterYears} years`) ?? false
      ).length
    ).toBeGreaterThan(0);
    // Discretion, not an immutable rule.
    expect(
      screen.getAllByText((_, el) => /not a hard line|discretion|our call/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
  });

  it("breaks the combined dive fee into park and chamber components", () => {
    render(<DivingPage />);
    const { marineParkPerDiveUsd, chamberContributionPerDiveUsd, snorkelParkPerPersonUsd } =
      OPERATIONS.conservationFees;
    const combined = marineParkPerDiveUsd + chamberContributionPerDiveUsd;
    expect(
      screen.getAllByText((_, el) =>
        el?.textContent?.includes(`$${combined} per diver, per dive`) ?? false
      ).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) =>
        el?.textContent?.includes(`$${marineParkPerDiveUsd} goes to the`) ?? false
      ).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) =>
        el?.textContent?.includes(`$${snorkelParkPerPersonUsd} per person`) ?? false
      ).length
    ).toBeGreaterThan(0);
  });

  it("welcomes junior divers without inventing a universal minimum age", () => {
    render(<DivingPage />);
    expect(
      screen.getAllByText((_, el) => /limits of their certification/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) =>
        el?.textContent?.includes(`under ${OPERATIONS.juniorPrivateGuideRecommendedUnderAge}`) ?? false
      ).length
    ).toBeGreaterThan(0);
    // Recommendation language, not a mandate for every junior diver.
    expect(
      screen.getAllByText((_, el) => /recommend considering a private guide/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
  });

  it("states the guided/no-solo and no-decompression rules", () => {
    render(<DivingPage />);
    expect(
      screen.getAllByText((_, el) => /no solo diving/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, el) => /no-decompression/i.test(el?.textContent ?? "")).length
    ).toBeGreaterThan(0);
  });

  it("links each scheduled dive product to its booking href", () => {
    render(<DivingPage />);
    for (const slug of ["classic", "advanced", "afternoon", "snorkel"] as const) {
      expect(
        screen.getAllByRole("link").filter((a) => a.getAttribute("href") === bookingHref(slug)).length
      ).toBeGreaterThan(0);
    }
  });

  it("exposes every section anchor used by the page nav and keeps redirect anchors", () => {
    const { container } = render(<DivingPage />);
    for (const id of Object.values(divingAnchors)) {
      expect(container.querySelector(`#${id}`), `missing #${id}`).not.toBeNull();
    }
  });

  it("keeps high-value internal links intact", () => {
    render(<DivingPage />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const href of ["/courses", "/dive-sites", "/contact?interest=book-diving"]) {
      expect(hrefs, `missing link to ${href}`).toContain(href);
    }
    expect(hrefs.some((h) => h?.startsWith("/plan-your-trip#"))).toBe(true);
  });
});
