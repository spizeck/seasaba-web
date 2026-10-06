import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageSectionNav } from "@/components/navigation/PageSectionNav";

const ITEMS = Array.from({ length: 10 }, (_, i) => ({
  id: `section-${i}`,
  label: `Section ${i}`,
}));

// jsdom has no layout — scrollWidth/clientWidth are 0 and nothing actually
// clips. Mock the strip's metrics, then fire a scroll event so the
// component recomputes its edge-fade state.
function strip(): HTMLElement {
  return document.querySelector(
    'nav[aria-label="On this page"] [class*="overflow-x-auto"]'
  ) as HTMLElement;
}

function setScrollMetrics(
  el: HTMLElement,
  { scrollWidth = 800, clientWidth = 400, scrollLeft = 0 } = {}
) {
  Object.defineProperty(el, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(el, "clientWidth", { configurable: true, value: clientWidth });
  Object.defineProperty(el, "scrollLeft", {
    configurable: true,
    writable: true,
    value: scrollLeft,
  });
  fireEvent.scroll(el);
}

describe("PageSectionNav edge treatment", () => {
  it("stays a single scrollable row and keeps pills readable at rest", () => {
    render(<PageSectionNav items={ITEMS} />);
    const el = strip();
    expect(el.className).toContain("flex-nowrap");
    expect(el.className).toContain("overflow-x-auto");
    // Inset inside the clip region so pills never sit flush on the clip edge.
    expect(el.className).toContain("px-3");
    // Focus scroll-into-view lands pills at that same inset.
    expect(el.className).toContain("scroll-px-3");

    const first = screen.getByRole("button", { name: "Section 0" });
    first.focus();
    expect(first).toHaveFocus();
  });

  it("shows only a right-edge fade at the start position", () => {
    render(<PageSectionNav items={ITEMS} />);
    const el = strip();
    setScrollMetrics(el, { scrollLeft: 0 });
    // Mask present, but the gradient starts opaque — nothing fades left.
    expect(el.className).toContain("mask-image:linear-gradient(to_right,black");
    // Fixed 28px stop, not a width-proportional fade that washes out pills.
    expect(el.className).toContain("black_calc(100%_-_28px)");
  });

  it("shows both edge affordances while scrolled mid-strip", () => {
    render(<PageSectionNav items={ITEMS} />);
    const el = strip();
    setScrollMetrics(el, { scrollLeft: 150 });
    // Gradient opens transparent (left fade) and still closes transparent.
    expect(el.className).toContain("to_right,transparent,black");
    expect(el.className).toMatch(/transparent\)\]/);
    // Both fades are the fixed 28px stops.
    expect(el.className).toContain("black_28px,black_calc(100%_-_28px)");
  });

  it("drops the right fade at the end but keeps the left affordance", () => {
    render(<PageSectionNav items={ITEMS} />);
    const el = strip();
    setScrollMetrics(el, { scrollLeft: 400 });
    // Left fade only: opens transparent, closes opaque — nothing fades right.
    expect(el.className).toContain("to_right,transparent,black_28px");
    expect(el.className).not.toMatch(/transparent\)\]/);
  });

  it("paints no fades when the strip does not overflow", () => {
    render(<PageSectionNav items={ITEMS} />);
    const el = strip();
    setScrollMetrics(el, { scrollWidth: 400, clientWidth: 400 });
    expect(el.className).not.toContain("mask-image");
  });
});
