import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import PlanYourTripPage from "@/app/(content)/plan-your-trip/page";
import { planYourTripAnchors, termsAnchors } from "@/lib/anchors";
import { inquiryFor } from "@/data/operations";

// Guards the Plan Your Trip → Visiting Yachts journey (issue #143): the
// dedicated guide must be discoverable from Getting to Saba without search,
// and the rest of the page must stay intact.

describe("plan your trip page", () => {
  it("renders every section anchor the on-page nav uses", () => {
    const { container } = render(<PlanYourTripPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /plan your trip to saba/i })
    ).toBeTruthy();
    for (const id of Object.values(planYourTripAnchors)) {
      expect(container.querySelector(`#${id}`), `missing #${id}`).not.toBeNull();
    }
  });

  it("offers a descriptive link to the visiting yachts guide in Getting to Saba", () => {
    const { container } = render(<PlanYourTripPage />);
    const gettingHere = container.querySelector(`#${planYourTripAnchors.gettingHere}`);
    expect(gettingHere).not.toBeNull();

    const link = within(gettingHere as HTMLElement).getByRole("link", {
      name: /yacht guide/i,
    });
    expect(link.getAttribute("href")).toBe("/visiting-yachts");
  });

  it("presents the yacht entry as a visible prompt that routes to the guide", () => {
    const { container } = render(<PlanYourTripPage />);
    const text = container.textContent ?? "";
    // A yacht visitor scanning the page should spot the prompt and understand
    // the guide covers arriving by yacht and diving with Sea Saba.
    expect(text).toMatch(/Visiting by Yacht\?/i);
    expect(text).toMatch(/dive with Sea Saba while your vessel is in Saba/i);
    // Plan Your Trip routes to the guide — it must not duplicate the detailed
    // arrival, mooring, or dinghy instructions that live on /visiting-yachts.
    expect(text).not.toMatch(/single pickup line/i);
    expect(text).not.toMatch(/check-in buoy/i);
  });

  // Issue #99: a visitor traveling with a non-diver should find an answer to
  // "will my companion have things to do?" without leaving the page, routed to
  // activities that already exist on the site.
  it("answers the non-diving companion question inside Things to Do", () => {
    const { container } = render(<PlanYourTripPage />);
    const experiences = container.querySelector(`#${planYourTripAnchors.experiences}`);
    expect(experiences).not.toBeNull();
    const scoped = within(experiences as HTMLElement);

    expect(scoped.getByText(/non-diver/i)).toBeTruthy();
    // The strongest answer is the snorkel trip sharing the afternoon dive boat;
    // link straight to the canonical snorkel anchor, plus hiking and partners.
    expect(
      scoped.getByRole("link", { name: /afternoon snorkel trip/i }).getAttribute("href")
    ).toBe(`#${planYourTripAnchors.snorkeling}`);
    expect(
      scoped.getByRole("link", { name: /trail network/i }).getAttribute("href")
    ).toBe(`#${planYourTripAnchors.hiking}`);
    expect(
      scoped.getByRole("link", { name: /recommended partners/i }).getAttribute("href")
    ).toBe("/partners");
  });

  // Issue #99: arrival disruptions happen on a small island; the guidance must
  // lead with contacting Sea Saba and route policy detail to Terms rather than
  // duplicating it.
  it("guides disrupted travelers to contact Sea Saba and the schedule-change terms", () => {
    const { container } = render(<PlanYourTripPage />);
    const gettingHere = container.querySelector(`#${planYourTripAnchors.gettingHere}`);
    expect(gettingHere).not.toBeNull();
    const scoped = within(gettingHere as HTMLElement);

    expect(scoped.getByText(/travel plans change/i)).toBeTruthy();
    const text = gettingHere?.textContent ?? "";
    expect(text).toMatch(/delayed|disrupted|later than expected/i);

    const contactLink = scoped.getByRole("link", { name: /^contact us$/i });
    const contactHref = contactLink.getAttribute("href") ?? "";
    expect(contactHref).toContain("/contact");
    // The ?interest= slug must resolve to a real inquiry type or the contact
    // form silently ignores it.
    const interest = new URLSearchParams(contactHref.split("?")[1]).get("interest");
    expect(interest).toBeTruthy();
    expect(inquiryFor(interest ?? undefined), `unknown ?interest=${interest}`).toBeTruthy();

    expect(scoped.getByRole("link", { name: /whatsapp/i }).getAttribute("href")).toContain("wa.me");
    // Policy detail lives on Terms; deep-link to the canonical section.
    expect(scoped.getByRole("link", { name: /terms page/i }).getAttribute("href")).toBe(
      `/terms#${termsAnchors.scheduleChanges}`
    );
  });

  it("keeps the existing transport options and page sections intact", () => {
    render(<PlanYourTripPage />);
    for (const name of [/Winair/i, /Makana Ferry/i, /West Indies Helicopters/i, /SXM Airways/i]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy();
    }
    for (const name of [
      /Getting to Saba/i,
      /When to Visit/i,
      /Where to Stay/i,
      /Good to Know/i,
      /What to Bring/i,
      /Restaurants/i,
      /Things to Do/i,
      /Frequently Asked Questions/i,
    ]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy();
    }
  });
});
