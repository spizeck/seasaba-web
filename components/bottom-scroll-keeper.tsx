"use client";

import { useEffect } from "react";

/**
 * Bottom-distance preservation across responsive reflows (issue #140).
 *
 * Browsers preserve the absolute `scrollY` pixel offset when layout reflows on
 * a viewport resize. When the document gets taller — e.g. narrowing a desktop
 * window across a Tailwind breakpoint, split-screen, or tablet rotation — a
 * visitor who was reading the footer keeps the old offset and lands ~60–80%
 * down the page instead of at the bottom.
 *
 * This helper samples the live distance-from-bottom on every scroll event.
 * When a viewport resize starts, it freezes that sample as the pre-reflow
 * distance — scroll events fired *during* reflow (browsers emit them as the
 * scroll offset is clamped or anchor-adjusted step by step) must not
 * overwrite it, since they already describe the broken post-reflow position.
 * Once the document has been stable for one settle window, the frozen
 * distance is restored in a single instant correction — but only if the
 * visitor was inside the footer region (within one footer-height of the end,
 * a self-calibrating threshold of ~460px on desktop / ~1.3kpx on mobile).
 * Visitors further up keep native scroll behavior untouched.
 *
 * Deliberate constraints:
 * - Bursts start only on a layout-width change. Height-only viewport changes
 *   (mobile browser chrome collapsing, software keyboards, window height
 *   drags) never reflow the document's width-dependent layout, so correcting
 *   there would fight the browser — e.g. yanking a footer visitor downward
 *   when the keyboard shrinks the visible area. `visualViewport.resize` is
 *   deliberately unused: it fires for pinch-zoom and chrome/keyboard changes
 *   that are not responsive reflows, and `window.resize` already covers every
 *   width transition (verified in Chromium and WebKit).
 * - Debounced to one correction per settle so dragging a window edge never
 *   produces repeated snapping. A ResizeObserver restarts the settle window
 *   while the document keeps resizing, so the correction waits out the whole
 *   reflow tail — and bursts only ever start from a real viewport resize,
 *   never from content growth (navigation, lazy media, fonts).
 * - Instant `scrollTo` — never animated.
 * - Explicit scroll input (wheel, touch, scroll keys, pointer) during the
 *   burst cancels the pending correction, so it never fights the visitor.
 * - Fragment navigation, back/forward restoration, and initial load are
 *   untouched: without a resize event nothing happens at all.
 */

// Long enough to span the incremental reflow steps that follow a breakpoint
// jump; short enough that the correction still reads as part of the resize.
const RESIZE_SETTLE_MS = 150;

const SCROLL_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

function documentHeight() {
  return Math.max(
    document.documentElement.scrollHeight,
    document.body ? document.body.scrollHeight : 0
  );
}

function distanceFromBottom() {
  return documentHeight() - window.scrollY - window.innerHeight;
}

function nearBottomThreshold() {
  const footer = document.querySelector("footer");
  return footer ? footer.offsetHeight : window.innerHeight;
}

export function BottomScrollKeeper() {
  useEffect(() => {
    let recorded = distanceFromBottom();
    let burstActive = false;
    let escaped = false;
    let frozenDistance = 0;
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        recorded = distanceFromBottom();
      });
    };

    const endBurst = () => {
      burstActive = false;
      if (escaped || frozenDistance > nearBottomThreshold()) return;
      const target = Math.max(
        0,
        documentHeight() - window.innerHeight - frozenDistance
      );
      if (Math.abs(target - window.scrollY) > 1) window.scrollTo(0, target);
    };

    // A layout-width change freezes the pre-reflow distance and opens the
    // settle window. Height-only resizes return early: with the width
    // unchanged, the document cannot reflow responsively, so any correction
    // would only fight unrelated viewport changes. ResizeObserver
    // notifications only extend that window while the document is still
    // changing size — they never open one themselves, so ordinary content
    // growth can't trigger a correction.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      beginBurst();
    };
    const beginBurst = () => {
      if (!burstActive) {
        burstActive = true;
        escaped = false;
        frozenDistance = recorded;
      }
      clearTimeout(settleTimer);
      settleTimer = setTimeout(endBurst, RESIZE_SETTLE_MS);
    };
    const extendBurst = () => {
      if (burstActive) beginBurst();
    };

    const onEscape = () => {
      if (burstActive) escaped = true;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) onEscape();
    };

    // RO fires an initial notification on observe() before any real change —
    // ignored implicitly since no burst is active yet.
    const observer = new ResizeObserver(extendBurst);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onEscape, { passive: true });
    window.addEventListener("touchmove", onEscape, { passive: true });
    window.addEventListener("pointerdown", onEscape, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onEscape);
      window.removeEventListener("touchmove", onEscape);
      window.removeEventListener("pointerdown", onEscape);
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
    };
  }, []);

  return null;
}
