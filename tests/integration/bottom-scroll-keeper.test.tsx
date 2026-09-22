import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { BottomScrollKeeper } from "@/components/bottom-scroll-keeper";

// jsdom has no layout engine, so geometry is faked through property
// definitions: documentElement.scrollHeight is the document height,
// window.innerHeight the viewport, window.scrollY the scroll offset, and a
// real <footer>'s offsetHeight sets the near-bottom threshold. ResizeObserver
// is stubbed so tests can simulate the document still reflowing. The
// component under test is real — only browser geometry is replaced.

const VIEWPORT = 800;
const FOOTER_H = 500;
const SETTLE_MS = 150;

let scrollToSpy: ReturnType<typeof vi.spyOn>;
let footer: HTMLElement;
let roCallback: ResizeObserverCallback;
let geometry = { docH: 10000, y: 0 };

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
}

function setScrollY(y: number) {
  geometry.y = y;
  fireEvent.scroll(window);
  // The keeper samples on rAF — flush it like a real frame.
  act(() => vi.advanceTimersByTime(20));
}

function resize() {
  fireEvent(window, new Event("resize"));
}

// The document is still reflowing — extends the burst's settle window.
function docStillChanging() {
  act(() => roCallback([] as ResizeObserverEntry[], {} as ResizeObserver));
}

function settle() {
  act(() => vi.advanceTimersByTime(SETTLE_MS + 20));
}

beforeEach(() => {
  vi.useFakeTimers();
  scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: VIEWPORT,
  });
  geometry = { docH: 10000, y: 0 };
  applyGeometry();
  footer = document.createElement("footer");
  Object.defineProperty(footer, "offsetHeight", {
    configurable: true,
    value: FOOTER_H,
  });
  document.body.appendChild(footer);
});

afterEach(() => {
  footer.remove();
});

it("restores distance-from-bottom after the document grows on resize", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT); // exact bottom

  geometry.docH = 16000; // narrower breakpoint reflow makes the page taller
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT);
});

it("restores a partial footer-region offset rather than snapping to the end", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT - 300); // 300px above bottom, inside footer

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT - 300);
});

it("freezes the pre-reflow distance even when reflow fires scroll events", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // Real engines fire scroll events while reflow clamps/anchor-adjusts the
  // offset — the sampled distance must not overwrite the frozen one.
  geometry.docH = 16000;
  resize();
  geometry.y = 13000; // reflow adjustment, reported via a scroll event
  fireEvent.scroll(window);
  act(() => vi.advanceTimersByTime(20));
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT);
});

it("waits out the reflow tail before correcting", () => {
  render(<BottomScrollKeeper />);
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

it("does not correct visitors reading above the footer region", () => {
  render(<BottomScrollKeeper />);
  setScrollY(4000); // 5200px above bottom — far beyond the 500px footer

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("does nothing on mount and without a resize", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT);
  docStillChanging(); // content growth alone never opens a burst
  act(() => vi.advanceTimersByTime(1000));
  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("debounces a drag into a single correction per settle", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  // Continuous drag: resize events keep arriving inside the settle window.
  for (let i = 0; i < 5; i++) {
    geometry.docH += 1000;
    resize();
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
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  geometry.docH = 16000;
  resize();
  escape();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});

it("falls back to a viewport-height threshold when no footer exists", () => {
  footer.remove();
  render(<BottomScrollKeeper />);
  // 600px above bottom: beyond a footer's reach but inside one 800px viewport.
  setScrollY(geometry.docH - VIEWPORT - 600);

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT - 600);
});

it("ignores keys that do not scroll", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  geometry.docH = 16000;
  resize();
  fireEvent.keyDown(window, { key: "a" });
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 16000 - VIEWPORT);
});

it("keeps correcting to the bottom on subsequent resize bursts", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT);

  geometry.docH = 16000;
  resize();
  settle();
  setScrollY(16000 - VIEWPORT); // the correction lands (real scroll follows)

  geometry.docH = 22000;
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 22000 - VIEWPORT);
  expect(scrollToSpy).toHaveBeenCalledTimes(2);
});

it("clamps the target at the document top after a large shrink", () => {
  render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT - 200);

  // Shrink far enough that preserving 200px would pass the top.
  geometry.docH = VIEWPORT + 100;
  resize();
  settle();

  expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
});

it("stops listening after unmount", () => {
  const view = render(<BottomScrollKeeper />);
  setScrollY(geometry.docH - VIEWPORT);
  view.unmount();

  geometry.docH = 16000;
  resize();
  settle();

  expect(scrollToSpy).not.toHaveBeenCalled();
});
