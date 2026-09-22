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

// A content paragraph that the keeper can pick as its landmark. `chrome`
// (optional) is a sticky/fixed element occupying y < chromeBottom, like the
// site header or wrapped pill nav. Returns handles so tests can simulate the
// element drifting (or being hidden) when the layout reflows.
function useLandmark(top: number, chrome?: { el: Element; bottom: () => number }) {
  const el = document.createElement("p");
  const box = { top, height: 24 };
  el.getBoundingClientRect = () => rect(box.top, box.height);
  document.body.appendChild(el);
  elementsFromPointSpy.mockImplementation((_x: number, y: number) => {
    if (chrome && y < chrome.bottom()) return [chrome.el];
    return [el];
  });
  return {
    el,
    moveTo: (newTop: number) => {
      box.top = newTop;
    },
    hide: () => {
      box.height = 0;
    },
    remove: () => el.remove(),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
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
  elementsFromPointSpy = vi.fn(() => [] as Element[]);
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
  document.body.querySelectorAll("p").forEach((p) => p.remove());
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
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT); // was at the bottom when resize began

  // The visitor (or an in-page navigation) jumps far up the document while
  // the burst is still settling — the stale bottom target must not yank
  // them back down; their new spot is preserved instead.
  geometry.docH = 16000;
  resize();
  setScrollY(3000);
  lm.moveTo(1400); // reflow keeps pushing their new content down
  docStillChanging();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 3000 + (1400 - 200));
});

it("waits out the reflow tail before correcting", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  geometry.docH = 13000;
  resize();
  act(() => vi.advanceTimersByTime(SETTLE_MS - 30));
  docStillChanging(); // layout still growing — settle window restarts
  geometry.docH = 16000;
  act(() => vi.advanceTimersByTime(SETTLE_MS - 30));
  expect(scrollToSpy).not.toHaveBeenCalled();

  settle();
  // Correction lands against the final document height, not a mid-reflow one.
  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT);
});

it("does nothing on mount and without a resize", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);
  docStillChanging(); // content growth alone never opens a burst
  act(() => vi.advanceTimersByTime(1000));
  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("debounces a drag into a single correction per settle", () => {
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // Continuous drag: resize events keep arriving inside the settle window.
  for (let i = 0; i < 5; i++) {
    geometry.docH += 1000;
    resize(WIDTH - 200 - i * 40); // each drag step narrows further
    act(() => vi.advanceTimersByTime(SETTLE_MS - 20));
  }
  expect(scrollToSpy).not.toHaveBeenCalled();
  settle();
  expect(scrollToSpy).toHaveBeenCalledTimes(1);
  expect(scrollToSpy).toHaveBeenCalledWith(0, 15000 - VIEWPORT);
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
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
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
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);
  setScrollY(4000);

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
  const lm = useLandmark(200); // paragraph 200px below the viewport top
  render(<ScrollPositionKeeper />);
  setScrollY(4000); // 5200px above bottom — outside the footer region

  geometry.docH = 16000;
  lm.moveTo(1400); // reflow pushed the element 1200px down the document
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 4000 + 1200);
});

it("freezes the pre-reflow landmark even when reflow fires scroll events", () => {
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);
  setScrollY(4000);

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
  const nav = document.createElement("nav");
  nav.className = "sticky top-16";
  document.body.appendChild(nav);
  let chromeBottom = 130; // header + one row of pills
  const lm = useLandmark(200, { el: nav, bottom: () => chromeBottom });

  render(<ScrollPositionKeeper />);
  setScrollY(4000);

  // The pill nav wraps to a second row: chrome grows by 40px and content
  // above the landmark also reflows.
  chromeBottom = 170;
  geometry.docH = 16000;
  lm.moveTo(1400);
  resize();
  settle();

  // gap was 200 - 130 = 70; the element must sit at 170 + 70 = 240.
  expect(scrollToSpy).toHaveBeenCalledWith(0, 4000 + (1400 - 240));
  nav.remove();
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
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);
  setScrollY(4000);

  geometry.docH = 16000;
  lm.hide(); // responsive markup hid this element (display:none)
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("does not correct when the landmark was removed from the document", () => {
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);
  setScrollY(4000);

  geometry.docH = 16000;
  lm.remove();
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("keeps the bottom region on bottom-distance even with a landmark", () => {
  const lm = useLandmark(200);
  render(<ScrollPositionKeeper />);
  setScrollY(geometry.docH - VIEWPORT - 300); // inside the footer region

  geometry.docH = 16000;
  lm.moveTo(1400);
  resize();
  settle();

  // Footer preservation wins; the landmark path must not also fire.
  expect(scrollToSpy).toHaveBeenCalledTimes(1);
  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT - 300);
});
