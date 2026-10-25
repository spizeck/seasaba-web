import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { TeamCarousel } from "@/components/about-page-client";

// jsdom lacks matchMedia; the carousel checks prefers-reduced-motion on
// mount. Reporting "reduce" also keeps autoplay timers out of the test.
vi.stubGlobal(
  "matchMedia",
  (query: string) => ({
    matches: true,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })
);

// Guards the odd-roster regression: when the member count leaves a carousel
// page partially filled (9 members -> 5 tablet pages of 2, last holding 1
// card), that page must size its cards like a full page and center them
// instead of leaving a blank column.
describe("team carousel partial pages", () => {
  function groupsOf(container: HTMLElement): HTMLElement[] {
    const region = container.querySelector(
      '[aria-label="Team members carousel"]'
    );
    return Array.from(region!.querySelector(".flex")!.children) as HTMLElement[];
  }

  it("centers the lone card on the final tablet page", () => {
    window.innerWidth = 800;
    const { container } = render(<TeamCarousel />);
    const groups = groupsOf(container);

    expect(groups).toHaveLength(5);
    const last = groups[groups.length - 1];
    expect(last.children).toHaveLength(1);
    expect(last.style.gridTemplateColumns).toContain("calc");
    expect(last.className).toContain("justify-center");
  });

  it("keeps the fluid minmax layout on fully populated pages", () => {
    window.innerWidth = 800;
    const { container } = render(<TeamCarousel />);
    const groups = groupsOf(container);

    for (const group of groups.slice(0, -1)) {
      expect(group.style.gridTemplateColumns).toBe(
        "repeat(2, minmax(0, 1fr))"
      );
    }
  });
});
