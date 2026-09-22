import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VisitingYachtsPage from "@/app/(en)/(content)/visiting-yachts/page";
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
    expect(text).toMatch(/store it between dive days/i);
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
    expect(text).toMatch(/line item on your Sea Saba invoice/i);
    expect(text).toMatch(/harbor fees[^.]*separat/i);
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

  it("keeps the rendered customer-facing prose free of em dashes", () => {
    // Scoped to this guide on purpose — not a site-wide typography rule.
    const { container } = render(<VisitingYachtsPage />);
    expect(container.textContent).not.toContain("\u2014");
  });

  it("uses the Ladder Bay yachts photograph as the hero", () => {
    const { container } = render(<VisitingYachtsPage />);
    const heroSrcs = Array.from(container.querySelectorAll("img")).map(
      (img) => img.getAttribute("src") ?? ""
    );
    expect(heroSrcs.some((s) => s.includes("ladder-bay-yachts-saba"))).toBe(true);
  });

  it("distinguishes public, private, and dive-site moorings", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // Public yacht moorings: single pickup line, floats on the pickup.
    expect(text).toMatch(/single pickup line/i);
    // Private local moorings exist in front of Fort Bay and are not for visitors.
    expect(text).toMatch(/private local moorings/i);
    expect(text).toMatch(/not for visitors/i);
    // White + blue stripe marks dive-site moorings, not yacht moorings.
    expect(text).toMatch(/blue stripe/i);
    expect(text).toMatch(/not yacht moorings/i);
    // The engineering distinction is explicit: reef-pinned, no shock
    // absorption, never for leaving a boat unattended.
    expect(text).toMatch(/pinned directly to the reef/i);
    expect(text).toMatch(/shock absorption/i);
    expect(text).toMatch(/unattended/i);
  });

  it("states correct Harbor Office hours and the scheduled-vs-charter fee distinction", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/7:30 AM to 6:00 PM/i);
    expect(text).not.toMatch(/6 AM to 6 PM/);
    // Scheduled diving: the contribution is itemized on the Sea Saba invoice.
    expect(text).toMatch(/own line item on your Sea Saba invoice/i);
    // Charter: diving-related costs are included, vessel fees stay separate.
    expect(text).toMatch(/Charter pricing is inclusive/i);
    expect(text).toMatch(/per-diver charge on top of the charter price/i);
    expect(text).toMatch(/Vessel-related fees/i);
  });

  it("separates scheduled diving, private charter, and tender diving clearly", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/Private Charters & Yacht Tender Diving/i);
    expect(text).toMatch(/Private Charter on a Sea Saba Boat/i);
    expect(text).toMatch(/A Sea Saba Guide Aboard Your Tender/i);
    expect(text).toMatch(/Want the boat to yourselves/i);
    // No undefined technical-diving capability is implied.
    expect(text).not.toMatch(/technical divers|technical diving|custom program/i);
  });

  it("warns dinghies to pass dive vessels on the seaward side", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // The 150-meter seaward passing rule and the reasoning behind it.
    expect(text).toMatch(/150 meters/i);
    expect(text).toMatch(/seaward side/i);
    expect(text).toMatch(/safety stops in shallow water/i);
    // It is published as a Marine Park safety regulation, linked to the SCF
    // yachting brochure — not presented as Sea Saba's own preference.
    expect(text).toMatch(/safety regulation/i);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
    expect(hrefs).toContain("https://sabapark.org/downloads/SCF%20Yacht%20Brochure.pdf");
  });

  it("states no fixed mooring stay limit and defers duration to immigration status", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // The owner-confirmed correction: no 7-day (or any fixed) mooring maximum.
    expect(text).not.toMatch(/(seven|7)\s*-?\s*days?/i);
    expect(text).not.toMatch(/maximum stay of/i);
    expect(text).toMatch(/no fixed maximum stay/i);
    expect(text).toMatch(/immigration status/i);
  });

  it("explains red dive buoys: overnight use allowed, dive boats keep priority", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/red (dive )?buoys?/i);
    expect(text).toMatch(/overnight/i);
    expect(text).toMatch(/dive boat needs the buoy/i);
    expect(text).toMatch(/no priority over dive operations/i);
  });

  it("warns against immobilizing a dinghy at Fort Bay, with the swell rationale", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/lock or chain/i);
    expect(text).toMatch(/prevents it from being moved/i);
    // Why it matters: swell enters the harbor, dinghies must be movable fast,
    // and locked dinghies have sunk when nobody could move them or find the owner.
    expect(text).toMatch(/swell/i);
    expect(text).toMatch(/sink/i);
    expect(text).toMatch(/locate/i);
    // The note is about the dinghy's mobility, not leaving property unsecured.
    expect(text).toMatch(/not your belongings|securing the outboard/i);
  });

  it("requires Sea Saba tanks for any diving from a Sea Saba boat", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // The customer-facing rule: diving from a Sea Saba boat uses our tanks.
    expect(text).toMatch(/Sea Saba Tanks on Our Boats/i);
    expect(text).toMatch(/diving from a Sea Saba boat[^.]*provide the tanks/i);
    // It applies to private charters the same as scheduled trips.
    expect(text).toMatch(/charter guests dive with Sea Saba cylinders/i);
    expect(text).toMatch(/same as on our scheduled trips/i);
    // Guests do not bring the yacht's tanks onto our boat for the dive.
    expect(text).toMatch(/leave your yacht.s tanks aboard/i);
    expect(text).toMatch(/can.t be used for dives from our boats/i);
    // Customer-owned cylinders aboard the yacht itself are unaffected.
    expect(text).toMatch(/aboard your own yacht/i);
    expect(text).toMatch(/unaffected/i);
    // The practical reason stays in the equipment section.
    expect(text).toMatch(/tank racks/i);
    expect(text).toMatch(/configured specifically for our own cylinders/i);
    // Tanks are part of what's included in the diving.
    expect(text).toMatch(/Tanks, Nitrox and weights are included/i);
    // The no-customer-cylinder-fills boundary remains stated.
    expect(text).toMatch(/don.t fill customer-owned cylinders/i);
    // Owner direction: the fit argument is practical, not a safety claim.
    expect(text).not.toMatch(/smoother and safer/i);
  });

  it("keeps private charter inclusions consistent with the cylinder rule", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // Cylinders remain part of the inclusive charter package.
    expect(text).toMatch(/Charter pricing is inclusive/i);
    expect(text).toMatch(/Sea Saba cylinders, weights/i);
    // Charter guests cannot substitute customer-owned cylinders either.
    expect(text).toMatch(/charter guests dive with Sea Saba cylinders/i);
    expect(text).toMatch(/not with tanks brought/i);
  });

  it("warns that dinghy-dock stern-anchor clips are private, with alternatives", () => {
    const { container } = render(<VisitingYachtsPage />);
    const text = container.textContent ?? "";
    // Dock guidance is grouped under one compact card, not stacked warnings.
    expect(text).toMatch(/At the Dinghy Dock/i);
    // The clips/lines are private equipment, not public mooring points.
    expect(text).toMatch(/stern-anchor (clips?|lines?)/i);
    expect(text).toMatch(/privately owned|private (equipment|line)/i);
    expect(text).toMatch(/not communal/i);
    // An unused-looking clip is still not for visiting dinghies.
    expect(text).toMatch(/unused-looking/i);
    expect(text).toMatch(/isn.t for visiting dinghies|not for visitors/i);
    // What happens if a private line is used anyway.
    expect(text).toMatch(/may be untied/i);
    // The practical alternatives: your own stern anchor or the plastic jetty.
    expect(text).toMatch(/your own stern anchor/i);
    expect(text).toMatch(/plastic jetty/i);
    // The movability guidance still stands in the same card.
    expect(text).toMatch(/lock or chain/i);
    expect(text).toMatch(/prevents it from being moved/i);
  });

  it("keeps routine dock guidance quieter than the dive-boat safety warning", () => {
    const { container } = render(<VisitingYachtsPage />);
    // Only one amber warning panel remains on the page: the dive-boat safety
    // notice. Dock etiquette sits in a neutral card.
    const amberPanels = container.querySelectorAll('[class*="bg-amber"]');
    expect(amberPanels.length).toBe(1);
    expect(amberPanels[0].textContent).toMatch(/Give Dive Boats Plenty of Room/i);
  });
});
