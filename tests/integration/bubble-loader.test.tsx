import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { BubbleLoader } from "@/components/bubble-loader";

// The bubble loader is a purely decorative, CSS-only treatment: no timers,
// no JS animation, deterministic markup on every render.

describe("BubbleLoader", () => {
  it("renders a decorative, scattered bubble cluster", () => {
    const { container } = render(<BubbleLoader />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("overflow-hidden");

    const bubbles = Array.from(root.querySelectorAll("span"));
    expect(bubbles.length).toBeGreaterThanOrEqual(5);

    const sizes = new Set(bubbles.map((b) => b.style.width));
    const lefts = new Set(bubbles.map((b) => b.style.left));
    const delays = new Set(bubbles.map((b) => b.style.animationDelay));
    expect(sizes.size).toBeGreaterThan(3);
    expect(lefts.size).toBeGreaterThan(3);
    expect(delays.size).toBeGreaterThan(3);

    for (const b of bubbles) {
      expect(b.className).toContain("animate-bubble-rise");
      expect(b.className).toContain("rounded-full");
      // Reduced motion removes the continuous rise; the bubble stays
      // visible at its scattered rest position.
      expect(b.className).toContain("motion-reduce:animate-none");
    }
  });

  it("supports a compact size for tighter loading blocks", () => {
    const { container } = render(<BubbleLoader size="sm" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("h-12");
    expect(root.className).toContain("w-24");
  });
});
