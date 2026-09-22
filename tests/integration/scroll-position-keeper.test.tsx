import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { ScrollPositionKeeper } from "@/components/scroll-position-keeper";

// jsdom has no layout engine, so geometry is faked through property
// definitions: documentElement.scrollHeight is the document height,
// window.innerHeight the viewport, window.scrollY the scroll offset, and a
// real <footer>'s offsetHeight sets the near-bottom threshold.
// document.elementsFromPoint is stubbed to control landmark discovery, and
// ResizeObserver is stubbed so tests can simulate the document still
// reflowing. The component under test is real — only browser geometry is
// replaced.

const VIEWPORT = 800;
const WIDTH = 1280;
const FOOTER_H = 500;
const SETTLE_MS = 150;

let scrollToSpy: ReturnType<typeof vi.spyOn>;
let elementsFromPointSpy: ReturnType<typeof vi.fn>;
let footer: HTMLElement;
let roCallback: ResizeObserverCallback;
let visualViewport: EventTarget;
let geometry = { docH: 10000, y: 0, w: WIDTH };

class ResizeObserverStub {
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
    roCallback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);

function applyGeometry() {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    get: () => geometry.docH,
  });
  Object.defineProperty(document.body, "scrollHeight", {
    configurable: true,
    get: () => Math.min(geometry.docH, 9000),
  });
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    get: () => geometry.y,
  });
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    get: () => geometry.w,
  });
}

function setScrollY(y: number) {
  geometry.y = y;
  fireEvent.scroll(window);
  // The keeper samples on rAF — flush it like a real frame.
  act(() => vi.advanceTimersByTime(20));
}

// A real responsive resize: the layout width changes.
function resize(newWidth = WIDTH - 200) {
  geometry.w = newWidth;
  fireEvent(window, new Event("resize"));
}

// A resize event where only the viewport height changed — e.g. a desktop
// height drag, collapsing mobile browser chrome, or a software keyboard.
function heightResize(newHeight: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: newHeight,
  });
  fireEvent(window, new Event("resize"));
}

// The document is still reflowing — extends the burst's settle window.
function docStillChanging() {
  act(() => roCallback([] as ResizeObserverEntry[], {} as ResizeObserver));
}

function settle() {
  act(() => vi.advanceTimersByTime(SETTLE_MS + 20));
}

function rect(top: number, height: number): DOMRect {
  return {
    top,
    height,
    bottom: top + height,
    left: 0,
    right: geometry.w,
    width: geometry.w,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

// Live landmark elements. Their viewport position follows scrollY like a
// real element (docTop stays fixed; rect.top = docTop - scrollY), and the
// hit-test only reports an element where the scan point is inside it.
const landmarkBoxes: { el: HTMLElement; docTop: number; height: number }[] = [];

// A content paragraph that the keeper can pick as its landmark. Returns
// handles so tests can simulate the element drifting (or being hidden) when
// the layout reflows.
function useLandmark(top: number) {
  const el = document.createElement("p");
  const box = { el, docTop: top + geometry.y, height: 24 };
  landmarkBoxes.push(box);
  el.getBoundingClientRect = () =>
    rect(box.docTop - geometry.y, box.height);
  document.body.appendChild(el);
  return {
    el,
    // Reflow moved the element to this viewport top at the current scrollY.
    moveTo: (newTop: number) => {
      box.docTop = newTop + geometry.y;
    },
    hide: () => {
      box.height = 0;
    },
    remove: () => {
      el.remove();
      landmarkBoxes.splice(landmarkBoxes.indexOf(box), 1);
    },
  };
}

// A sticky top chrome bar (e.g. the site header or pill nav) whose height
// can change across the simulated breakpoint.
function useChrome(bottomRef: { current: number }) {
  const nav = document.createElement("nav");
  nav.className = "sticky top-16";
  nav.getBoundingClientRect = () => rect(64, bottomRef.current - 64);
  document.body.appendChild(nav);
  return nav;
}

beforeEach(() => {
  vi.useFakeTimers();
  // Simulate the browser actually scrolling (with clamping at the document
  // edges) so per-frame corrections converge instead of repeating.
  scrollToSpy = vi
    .spyOn(window, "scrollTo")
    .mockImplementation((...args: unknown[]) => {
      const y = typeof args[1] === "number" ? args[1] : 0;
      geometry.y = Math.max(0, Math.min(y, geometry.docH - VIEWPORT));
    });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: VIEWPORT,
  });
  geometry = { docH: 10000, y: 0, w: WIDTH };
  applyGeometry();
  visualViewport = new EventTarget();
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: visualViewport,
  });
  landmarkBoxes.length = 0;
  elementsFromPointSpy = vi.fn((_x: number, y: number) => {
    for (const box of landmarkBoxes) {
      const top = box.docTop - geometry.y;
      if (y >= top && y < top + box.height) return [box.el];
    }
    // A real hit-test always returns something (at least html/body) — gaps
    // and padding just aren't content elements, so the scan continues.
    return [document.documentElement];
  });
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: elementsFromPointSpy,
  });
  footer = document.createElement("footer");
  Object.defineProperty(footer, "offsetHeight", {
    configurable: true,
    value: FOOTER_H,
  });
  document.body.appendChild(footer);
});

afterEach(() => {
  footer.remove();
  landmarkBoxes.length = 0;
  document.body.querySelectorAll("p,nav").forEach((el) => el.remove());
});

it("restores distance-from-bottom after the document grows on resize", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT); // exact bottom

  geometry.docH = 16000; // narrower breakpoint reflow makes the page taller
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT);
});

it("restores a partial footer-region offset rather than snapping to the end", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT - 300); // 300px above bottom, inside footer

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT - 300);
});

it("freezes the pre-reflow distance even when reflow fires scroll events", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // Real engines fire scroll events while reflow clamps/anchor-adjusts the
  // offset in small steps — the sampled distance must not overwrite the
  // frozen one.
  geometry.docH = 16000;
  resize();
  geometry.y += 40; // reflow adjustment, reported via a scroll event
  fireEvent.scroll(window);
  act(() => vi.advanceTimersByTime(20));
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT);
});

it("re-anchors to a deliberate scroll jump made mid-reflow", () => {
  useLandmark(200);
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT); // was at the bottom when resize began

  // The visitor (or an in-page navigation) jumps far up the document while
  // the burst is still settling — the stale bottom target must not yank
  // them back down; their new spot is preserved instead.
  geometry.docH = 16000;
  resize();
  // The visitor lands at 3000 where different content now sits at the
  // reading line; the scroll event re-anchors the frozen target there.
  geometry.y = 3000;
  const lm2 = useLandmark(200);
  fireEvent.scroll(window);
  act(() => vi.advanceTimersByTime(20));
  lm2.moveTo(1400); // reflow keeps pushing their new content down
  docStillChanging();
  settle();

  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 3000 + (1400 - 200));
});

it("keeps tracking the bottom while the document is still reflowing", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // Width changed; the document reflows in steps while the burst is open.
  // Each growth step is corrected on the next frame — the visitor stays at
  // the bottom throughout instead of watching the footer drift away.
  geometry.docH = 13000;
  resize();
  act(() => vi.advanceTimersByTime(20));
  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 13000 - VIEWPORT);

  docStillChanging(); // layout still growing — settle window restarts
  geometry.docH = 16000;
  act(() => vi.advanceTimersByTime(20));
  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 16000 - VIEWPORT);

  settle();
  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 16000 - VIEWPORT);
});

it("does nothing on mount and without a resize", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);
  docStillChanging(); // content growth alone never opens a burst
  act(() => vi.advanceTimersByTime(1000));
  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("pins the bottom through a stepped drag instead of one late snap", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // Continuous drag: resize events keep arriving inside the settle window
  // while each narrower breakpoint grows the document further. After every
  // step the correction has already landed — no 150ms of displacement.
  for (let i = 0; i < 5; i++) {
    geometry.docH += 1000;
    resize(WIDTH - 200 - i * 40); // each drag step narrows further
    act(() => vi.advanceTimersByTime(20));
    expect(scrollToSpy).toHaveBeenLastCalledWith(0, geometry.docH - VIEWPORT);
  }
  settle();
  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 15000 - VIEWPORT);
});

it.each([
  ["wheel", () => fireEvent.wheel(window)],
  ["touchmove", () => fireEvent.touchMove(window)],
  ["a scroll key", () => fireEvent.keyDown(window, { key: "ArrowDown" })],
  ["pointerdown", () => fireEvent.pointerDown(window)],
])("yields when the visitor scrolls mid-resize via %s", (_label, escape) => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  geometry.docH = 16000;
  resize();
  escape();
  // The synchronous correction at the resize event may already have landed;
  // nothing may fire after the visitor takes over.
  const callsAtEscape = scrollToSpy.mock.calls.length;
  geometry.docH = 18000; // reflow continues — must not pull them further
  docStillChanging();
  settle();

  expect(scrollToSpy).toHaveBeenCalledTimes(callsAtEscape);
});

it("falls back to a viewport-height threshold when no footer exists", () => {
  footer.remove();
  render(<ScrollPositionKeeper />);
  // 600px above bottom: beyond a footer's reach but inside one 800px viewport.
  setScrollY(geometry.docH - VIEWPORT - 600);

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT - 600);
});

it("ignores keys that do not scroll", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  geometry.docH = 16000;
  resize();
  fireEvent.keyDown(window, { key: "a" });
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT);
});

it("keeps correcting to the bottom on subsequent resize bursts", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  geometry.docH = 16000;
  resize();
  settle();
  setScrollY(16000 - VIEWPORT); // the correction lands (real scroll follows)

  geometry.docH = 22000;
  resize(WIDTH - 400); // a second burst needs a further width change
  settle();

  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 22000 - VIEWPORT);
  expect(scrollToSpy).toHaveBeenCalledTimes(2);
});

// --- Issue #140 revision: only layout-width changes may open a burst ---

it("ignores height-only resizes for a footer visitor", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // The visible area shrank (e.g. software keyboard, collapsing browser
  // chrome) but the layout width — and thus the document — is unchanged.
  heightResize(500);
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("ignores height-only resizes for a mid-page visitor", () => {
  geometry.y = 4000;
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);

  heightResize(1200);
  lm.moveTo(1200); // would drift, but no width change means no correction
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("ignores visualViewport-only events (keyboard/pinch-zoom surface)", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // Mobile keyboards and pinch-zoom surface on visualViewport without a
  // layout-width change; the keeper does not listen there at all.
  act(() => visualViewport.dispatchEvent(new Event("resize")));
  heightResize(500);
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("still corrects after a height-only resize once the width changes", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  heightResize(500);
  settle();
  expect(scrollToSpy).not.toHaveBeenCalled();

  // A genuine responsive reflow later still preserves the bottom position.
  geometry.docH = 16000;
  resize();
  settle();
  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - 500);
});

it("clamps the target at the document top after a large shrink", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT - 200);

  // Shrink far enough that preserving 200px would pass the top.
  geometry.docH = VIEWPORT + 100;
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
});

it("stops listening after unmount", () => {
  const view = render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);
  view.unmount();

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

// --- Landmark-relative preservation for ordinary page content ---

it("restores a mid-page landmark's viewport position after reflow", () => {
  geometry.y = 4000; // 5200px above bottom — outside the footer region
  const lm = useLandmark(200); // paragraph 200px below the viewport top
  render(<ScrollPositionKeeper />);

  geometry.docH = 16000;
  lm.moveTo(1400); // reflow pushed the element 1200px down the document
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 4000 + 1200);
});

it("freezes the pre-reflow landmark even when reflow fires scroll events", () => {
  geometry.y = 4000;
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);

  geometry.docH = 16000;
  lm.moveTo(1400);
  resize();
  // Reflow scroll events resample the landmark at its drifted position;
  // the frozen sample must still be used for the correction.
  fireEvent.scroll(window);
  act(() => vi.advanceTimersByTime(20));
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 5200);
});

it("keeps the landmark the same distance below sticky chrome that grew", () => {
  const chrome = { current: 130 }; // header + one row of pills
  const nav = useChrome(chrome);
  geometry.y = 4000;
  const lm = useLandmark(200);

  render(<ScrollPositionKeeper />);

  // The pill nav wraps to a second row: chrome grows by 40px and content
  // above the landmark also reflows.
  chrome.current = 170;
  geometry.docH = 16000;
  lm.moveTo(1400);
  resize();
  settle();

  // gap was 200 - 130 = 70; the element must sit at 170 + 70 = 240.
  expect(scrollToSpy).toHaveBeenCalledWith(0, 4000 + (1400 - 240));
  nav.remove();
});

it("corrects incrementally during the burst, not only at settle", () => {
  geometry.y = 4000;
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);

  // Reflow pushes the landmark 1200px down.
  geometry.docH = 16000;
  lm.moveTo(1400);
  resize();

  // One frame into the burst — well before the settle window — the drift is
  // already corrected, so the displacement is never painted.
  act(() => vi.advanceTimersByTime(20));
  expect(scrollToSpy).toHaveBeenCalledWith(0, 4000 + (1400 - 200));
});

it("leaves mid-page position alone when no landmark resolves", () => {
  render(<ScrollPositionKeeper />); // elementsFromPoint returns [] — no anchor
  setScrollY(4000);

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("does not correct when the landmark is hidden at the new breakpoint", () => {
  geometry.y = 4000;
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);

  geometry.docH = 16000;
  lm.hide(); // responsive markup hid this element (display:none)
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("does not correct when the landmark was removed from the document", () => {
  geometry.y = 4000;
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);

  geometry.docH = 16000;
  lm.remove();
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("keeps the bottom region on bottom-distance even with a landmark", () => {
  geometry.y = geometry.docH - VIEWPORT - 300; // inside the footer region
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);

  geometry.docH = 16000;
  lm.moveTo(1400);
  resize();
  settle();

  // Footer preservation wins; the landmark path must not also fire.
  expect(scrollToSpy).toHaveBeenCalledTimes(1);
  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT - 300);
});
