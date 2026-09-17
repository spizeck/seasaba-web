import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DivingPage from "@/app/(content)/diving/page";
import { DIVE_PRODUCTS, OPERATIONS, type BookableProduct } from "@/data/operations";

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
});
