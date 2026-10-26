import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TeamCarousel } from "@/components/about-page-client";

// Regression coverage for the Meet the Team infinite carousel: the last page
// used to render one card in an otherwise empty three-column grid, and the
// loop relied on a modulo index jump with no cloned boundary slides.

// jsdom lacks matchMedia; the carousel checks prefers-reduced-motion on mount.
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  onchange: null,
  dispatchEvent: () => false,
}));

// jsdom lacks requestAnimationFrame (pretendToBeVisual is off); the carousel
// uses two frames to re-enable the slide transition after a wrap snap.
vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
  setTimeout(() => cb(performance.now()), 0)
);
vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));

const member = (name: string) => ({
  name,
  title: "Dive Instructor",
  bio: `${name} keeps the boats running.`,
});

const region = () =>
  screen.getByRole("region", { name: "Team members carousel" });
const track = () => region().firstElementChild as HTMLElement;
const transform = () => track().style.transform;
const slideNames = (slideIdx: number) =>
  [...track().children[slideIdx].querySelectorAll("h3")].map(
    (h) => h.textContent
  );

async function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    writable: true,
    configurable: true,
  });
  fireEvent(window, new Event("resize"));
  await waitFor(() => expect(track()).toBeTruthy());
}

describe("TeamCarousel", () => {
  it("wrap-fills the final page so no grid cells are left empty", () => {
    render(<TeamCarousel />);
    // 10 members at 3-per-view → 4 pages plus 2 cloned boundary slides.
    expect(track().children).toHaveLength(6);
    // The old slice() produced [Gunner] alone; the page must be full.
    expect(slideNames(4)).toEqual(["Gunner", "Mel", "Jeanine & Marc"]);
    // Boundary clones mirror the real last/first pages for a seamless wrap.
    expect(slideNames(0)).toEqual(slideNames(4));
    expect(slideNames(5)).toEqual(slideNames(1));
  });

  it("wraps forward onto the first-page clone then snaps to the real page", async () => {
    render(<TeamCarousel />);
    const next = screen.getByRole("button", { name: "Next team members" });
    const dot4 = screen.getByRole("tab", { name: "Go to page 4 of 4" });
    fireEvent.click(dot4);
    expect(transform()).toBe("translateX(-400%)");

    fireEvent.click(next);
    expect(transform()).toBe("translateX(-500%)"); // clone of page 0
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe("translateX(-100%)"));
  });

  it("wraps backward onto the last-page clone then snaps to the real page", async () => {
    render(<TeamCarousel />);
    const prev = screen.getByRole("button", { name: "Previous team members" });
    fireEvent.click(prev);
    expect(transform()).toBe("translateX(0%)"); // clone of last page
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe("translateX(-400%)"));
  });

  it("renders a centered static row with no controls for small datasets", async () => {
    render(<TeamCarousel members={[member("A"), member("B")]} />);
    // Default jsdom width (1024) shows 3 per view > 2 members → no carousel.
    expect(
      screen.queryByRole("button", { name: "Next team members" })
    ).toBeNull();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "B" })).toBeInTheDocument();
  });

  it("still carousels a small dataset when it exceeds the mobile view", async () => {
    render(<TeamCarousel members={[member("A"), member("B")]} />);
    await setViewportWidth(500); // 1 card per view → 2 pages + clones
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Next team members" }))
        .toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: "Next team members" }));
    expect(transform()).toBe("translateX(-200%)");
    // Forward wrap from the last page lands on the clone, then normalizes.
    fireEvent.click(screen.getByRole("button", { name: "Next team members" }));
    expect(transform()).toBe("translateX(-300%)");
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe("translateX(-100%)"));
  });

  it("renders a single member without carousel controls", () => {
    render(<TeamCarousel members={[member("Solo")]} />);
    expect(
      screen.queryByRole("button", { name: "Previous team members" })
    ).toBeNull();
    expect(screen.getByRole("heading", { name: "Solo" })).toBeInTheDocument();
  });
});
