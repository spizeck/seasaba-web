import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import PlanYourTripPage from "@/app/(content)/plan-your-trip/page";
import { planYourTripAnchors } from "@/lib/anchors";

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
