import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TeamCarousel } from "@/components/about-page-client";

// Regression coverage for the Meet the Crew infinite carousel. Navigation is
// per-card now: every Next/Previous press moves exactly one card. The member
// list renders three times on the track and the middle copy is the real
// strip — a wrap transition lands on a cloned position that is pixel-identical
// to the real one memberCount slides away, then snaps home invisibly.

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

const MEMBER_COUNT = 10;
const CPV = 3; // default jsdom width (1024) renders 3 cards per view
const offset = (index: number, count = MEMBER_COUNT, cpv = CPV) =>
  `translateX(${-((index + count) * (100 / cpv))}%)`;

const region = () =>
  screen.getByRole("region", { name: "Team members carousel" });
const track = () => region().firstElementChild as HTMLElement;
const transform = () => track().style.transform;
const slideName = (slideIdx: number) =>
  track().children[slideIdx].querySelector("h3")?.textContent;
const nextButton = () =>
  screen.getByRole("button", { name: "Next team members" });
const prevButton = () =>
  screen.getByRole("button", { name: "Previous team members" });

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
  it("renders three copies of the member list with the real strip in the middle", () => {
    render(<TeamCarousel />);
    expect(track().children).toHaveLength(MEMBER_COUNT * 3);
    // All three copies present the members in source order.
    expect(slideName(0)).toBe("Mel");
    expect(slideName(MEMBER_COUNT)).toBe("Mel");
    expect(slideName(MEMBER_COUNT * 2)).toBe("Mel");
    expect(slideName(MEMBER_COUNT * 3 - 1)).toBe("Gunner");
    // The resting position shows the first real slides, not the lead clones.
    expect(transform()).toBe(offset(0));
  });

  it("advances exactly one card per Next click and one per Previous click", () => {
    render(<TeamCarousel />);
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(1));
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(2));
    fireEvent.click(prevButton());
    expect(transform()).toBe(offset(1));
  });

  it("wraps forward onto identical cloned slides then snaps to the real strip", async () => {
    render(<TeamCarousel />);
    fireEvent.click(screen.getByRole("button", { name: "Go to Gunner" }));
    expect(transform()).toBe(offset(9));

    // One more card forward wraps to member 0, displayed via the cloned copy.
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(10));
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe(offset(0)));
  });

  it("wraps backward onto identical cloned slides then snaps to the real strip", async () => {
    render(<TeamCarousel />);
    fireEvent.click(prevButton());
    expect(transform()).toBe(offset(-1)); // clone of the last position
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe(offset(9)));
  });

  it("absorbs rapid consecutive clicks through the wrap without dead ends", async () => {
    render(<TeamCarousel />);
    fireEvent.click(screen.getByRole("button", { name: "Go to Gunner" }));
    // Four presses fire while the first wrap transition is still in flight;
    // the cloned runway keeps every intermediate position on real slides.
    for (let i = 0; i < 4; i++) fireEvent.click(nextButton());
    expect(transform()).toBe(offset(13)); // logical position 3
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe(offset(3)));
  });

  it("reverses direction cleanly at the boundaries", async () => {
    render(<TeamCarousel />);
    // Forward over the boundary, then back before the transition settles.
    fireEvent.click(screen.getByRole("button", { name: "Go to Gunner" }));
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(10));
    fireEvent.click(prevButton());
    expect(transform()).toBe(offset(9)); // retargets mid-flight, no snap needed
    // Backward over the boundary, then forward again.
    fireEvent.click(screen.getByRole("button", { name: "Go to Mel" }));
    fireEvent.click(prevButton());
    expect(transform()).toBe(offset(-1));
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(0));
  });

  it("keeps wrap targets when the viewport resizes mid-transition", async () => {
    render(<TeamCarousel />);
    await setViewportWidth(1440); // 3 per view
    // Sit on the trailing clones (index = memberCount), then shrink to 2 per
    // view: the position must map to index 0, not collide with a real slide.
    fireEvent.click(screen.getByRole("button", { name: "Go to Gunner" }));
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(10));
    await setViewportWidth(700);
    await waitFor(() =>
      expect(transform()).toBe(offset(0, MEMBER_COUNT, 2))
    );

    // Symmetric case: leading clones (index < 0) → last position.
    await setViewportWidth(1440);
    fireEvent.click(prevButton());
    expect(transform()).toBe(offset(-1));
    await setViewportWidth(1024);
    await waitFor(() => expect(transform()).toBe(offset(9)));
  });

  it("renders a centered static row with no controls for small datasets", () => {
    render(<TeamCarousel members={[member("A"), member("B")]} />);
    // Default jsdom width (1024) shows 3 per view > 2 members → no carousel.
    expect(
      screen.queryByRole("button", { name: "Next team members" })
    ).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^Go to / })).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "B" })).toBeInTheDocument();
  });

  it("renders a single member without carousel controls", () => {
    render(<TeamCarousel members={[member("Solo")]} />);
    expect(
      screen.queryByRole("button", { name: "Previous team members" })
    ).toBeNull();
    expect(screen.getByRole("heading", { name: "Solo" })).toBeInTheDocument();
  });

  it("renders three members as a static row at desktop widths", () => {
    render(
      <TeamCarousel members={[member("A"), member("B"), member("C")]} />
    );
    // 3 members == 3 visible slots → no carousel chrome, no duplicates.
    expect(
      screen.queryByRole("button", { name: "Next team members" })
    ).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^Go to / })).toHaveLength(0);
    expect(screen.getAllByRole("heading")).toHaveLength(3);
  });

  it("carousels a seven-member dataset one card at a time with wrapping", async () => {
    render(
      <TeamCarousel
        members={["A", "B", "C", "D", "E", "F", "G"].map(member)}
      />
    );
    expect(track().children).toHaveLength(21);
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(1, 7));
    // Forward wrap: index 7 shows clones identical to index 0.
    for (let i = 0; i < 6; i++) fireEvent.click(nextButton());
    expect(transform()).toBe(offset(7, 7));
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe(offset(0, 7)));
  });

  it("carousels a four-member dataset one card at a time with wrapping", async () => {
    render(
      <TeamCarousel
        members={[member("A"), member("B"), member("C"), member("D")]}
      />
    );
    expect(track().children).toHaveLength(12);
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(1, 4));
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(2, 4));
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(3, 4)); // window [D, A, B]
    // Forward wrap: index 4 shows clones identical to index 0.
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(4, 4));
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe(offset(0, 4)));
  });

  it("still carousels a small dataset when it exceeds the mobile view", async () => {
    render(<TeamCarousel members={[member("A"), member("B")]} />);
    await setViewportWidth(500); // 1 card per view → carousel
    await waitFor(() => expect(nextButton()).toBeInTheDocument());
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(1, 2, 1));
    // Forward wrap lands on the clone, then normalizes to the real strip.
    fireEvent.click(nextButton());
    expect(transform()).toBe(offset(2, 2, 1));
    fireEvent.transitionEnd(track(), { propertyName: "transform" });
    await waitFor(() => expect(transform()).toBe(offset(0, 2, 1)));
  });
});
