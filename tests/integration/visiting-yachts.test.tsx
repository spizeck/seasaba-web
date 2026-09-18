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
    // The stale mailto framing must not reappear — the form sends server-side.
    const { container } = render(<VisitingYachtsPage />);
    expect(container.textContent).not.toMatch(/email app|doesn.t send anything/i);
  });

  it("describes the standard dinghy-to-Fort-Bay flow and shuttle support", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // Dinghy in, gear to the shop (storable between days), ~30 min before departure.
    expect(text).toMatch(/dinghy into Fort Bay/i);
    expect(text).toMatch(/store it for you between dive days/i);
    expect(text).toMatch(/30 minutes before/i);
    // Yacht guests still get the included shuttle into town + taxi coordination.
    expect(text).toMatch(/scheduled shuttle into town/i);
    expect(text).toMatch(/coordinate taxis/i);
    // Vessel pickup exists only for later dives and is never promised.
    expect(text).toMatch(/not practical for the first dive/i);
  });

  it("keeps booking, fee, and independent-diving boundaries accurate", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // Checkfront booking notes capture the vessel name — no invented field.
    expect(text).toMatch(/vessel.{0,20}name in the booking notes/i);
    // Marine Park/chamber fees on the Sea Saba invoice; harbor/mooring separate.
    expect(text).toMatch(/diving invoice/i);
    expect(text).toMatch(/harbor fees are a separate/i);
    // Independent diving is prohibited, not merely "check the rules".
    expect(text).toMatch(/independent diving isn.t permitted/i);
    expect(text).toMatch(/licensed dive operator/i);
    // No customer-cylinder fills, no unguided tank supply.
    expect(text).toMatch(/don.t fill customer-owned cylinders/i);
    expect(text).toMatch(/tanks for independent diving/i);
  });

  it("describes tender-based private diving with its safety requirements", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/guide aboard your tender/i);
    expect(text).toMatch(/runs from the tender rather than the yacht/i);
    // Required safety equipment is confirmed before the plan is finalized.
    expect(text).toMatch(/before the diving plan is finalized/i);
    expect(text).toMatch(/dive flag/i);
    expect(text).toMatch(/ship-to-shore radio/i);
    expect(text).toMatch(/oxygen/i);
  });

  it("shows the canonical Advanced departure and links authoritative sources", () => {
    const { container } = render(<VisitingYachtsPage />);
    expect(container.textContent).toContain(DIVE_PRODUCTS.advanced.schedule.departure);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
    // Marine Park's licensed-operator rule and the harbor expansion project.
    expect(hrefs.some((h) => h.includes("SCF_Yacht_Registration_Form"))).toBe(true);
    expect(hrefs.some((h) => h.includes("black-rocks-harbor"))).toBe(true);
    // Saba C-Transport referral for vessel-agency needs.
    expect(hrefs).toContain("https://www.sabaferry.com/");
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
