"use client";

import { useEffect } from "react";

/**
 * Logical scroll-position preservation across responsive reflows
 * (issue #140).
 *
 * Browsers preserve the absolute `scrollY` pixel offset when layout reflows
 * on a viewport resize. When the document gets taller — e.g. narrowing a
 * desktop window across a Tailwind breakpoint, split-screen, or tablet
 * rotation — content above the viewport pushes everything down while the
 * offset stays put, so a visitor reading one section can end up looking at
 * a completely different one (measured: /diving's "Mixed Groups" heading
 * moved ~1400px past the viewport on a 1280→768 resize).
 *
 * This helper continuously samples two things on each scroll frame:
 * - the distance from the document bottom (for the footer region), and
 * - a *content landmark*: the semantic element (heading, paragraph, list
 *   item, media) at the top of the visible reading area, plus its offset
 *   below the sticky chrome (site header, section pill nav).
 *
 * When a viewport resize starts, both samples are frozen — scroll events
 * fired *during* reflow (browsers emit them as the scroll offset is clamped
 * or anchor-adjusted step by step) must not overwrite them, since they
 * already describe the broken post-reflow position. Once the document has
 * been stable for one settle window, exactly one instant correction runs:
 *
 * - Footer region (frozen distance within one footer-height of the end, a
 *   self-calibrating ~460px desktop / ~1.3kpx mobile threshold): restore
 *   the same distance from the bottom.
 * - Anywhere else: scroll so the landmark element sits the same distance
 *   below the (possibly resized) sticky chrome as before. Preserving the
 *   gap below the chrome — rather than the raw viewport coordinate —
 *   keeps the topmost readable line visible even when the section pills
 *   wrap and the sticky nav grows a row. The element's top is preserved,
 *   not snapped: a visitor halfway through a paragraph stays halfway
 *   through it. If the landmark was hidden by the new breakpoint
 *   (display:none) or removed, no correction runs.
 *
 * Deliberate constraints:
 * - Bursts start only on a layout-width change. Height-only viewport
 *   changes (mobile browser chrome collapsing, software keyboards, window
 *   height drags) never reflow the document's width-dependent layout, so
 *   correcting there would fight the browser — e.g. yanking a footer
 *   visitor downward when the keyboard shrinks the visible area.
 *   `visualViewport.resize` is deliberately unused: it fires for
 *   pinch-zoom and chrome/keyboard changes that are not responsive
 *   reflows, and `window.resize` already covers every width transition
 *   (verified in Chromium and WebKit).
 * - Debounced to one correction per settle so dragging a window edge
 *   never produces repeated snapping. A ResizeObserver restarts the
 *   settle window while the document keeps resizing, so the correction
 *   waits out the whole reflow tail — and bursts only ever start from a
 *   real viewport resize, never from content growth (navigation, lazy
 *   media, fonts).
 * - Landmarks are existing semantic elements discovered geometrically via
 *   `elementsFromPoint`; no markup changes, no hardcoded heights or
 *   breakpoints, and the URL/hash is never touched.
 * - Instant `scrollTo` — never animated.
 * - Explicit scroll input (wheel, touch, scroll keys, pointer) during the
 *   burst cancels the pending correction, so it never fights the visitor.
 * - Fragment navigation, back/forward restoration, and initial load are
 *   untouched: without a resize event nothing happens at all.
 */

// Long enough to span the incremental reflow steps that follow a breakpoint
// jump; short enough that the correction still reads as part of the resize.
const RESIZE_SETTLE_MS = 150;

// A scroll delta beyond this during an active burst is a deliberate move —
// anchor navigation, a scrollbar drag, or a programmatic scroll — not
// reflow noise (measured ~6px per event). The frozen target is re-anchored
// to the visitor's new position so the correction preserves where they are
// *now*, not where they were when the resize began.
function deliberateScrollThreshold() {
  return Math.max(300, window.innerHeight / 2);
}

// How far below the viewport top to look for sticky chrome and for the
// first usable content element.
const CHROME_SCAN_LIMIT = 480;
const LANDMARK_SCAN_LIMIT = 480;
const SCAN_STEP = 4;

// Elements that represent actual page content — stable anchors that exist
// in the DOM regardless of breakpoint. Generic containers are excluded:
// pinning a whole <section> top would snap the visitor to the section start
// instead of their reading position.
const CONTENT_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,li,figure,img,blockquote,td,th";

// Top-pinned UI that overlaps page content. Class-name discovery keeps this
// honest as the header/section-nav markup evolves — no duplicated heights.
const CHROME_SELECTOR = '[class*="sticky"], [class*="fixed"]';

const SCROLL_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

type Landmark = {
  el: Element;
  /** Element's viewport-top offset below the sticky chrome, in px. */
  gap: number;
};

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
  return footer && footer.offsetHeight > 0
    ? footer.offsetHeight
    : window.innerHeight;
}

// First viewport y not covered by top-pinned chrome (sticky site header,
// sticky section pill nav, ...). Discovered geometrically: the pill nav
// wraps to a second row on narrow viewports, so no height is hardcoded.
function topChromeBottom(x: number) {
  const limit = Math.min(window.innerHeight, CHROME_SCAN_LIMIT);
  for (let y = 0; y < limit; y += SCAN_STEP) {
    const el = document.elementsFromPoint(x, y)[0];
    if (!el || !el.closest(CHROME_SELECTOR)) return y;
  }
  return limit;
}

// The semantic content element at the top of the visible reading area.
// Returns the element and its offset below the chrome so the same gap can
// be restored after reflow.
function pickLandmark(chromeBottom: number): Landmark | null {
  const x = window.innerWidth / 2;
  const limit = Math.min(
    window.innerHeight * 0.75,
    chromeBottom + LANDMARK_SCAN_LIMIT
  );
  for (let y = chromeBottom + SCAN_STEP; y < limit; y += SCAN_STEP) {
    const stack = document.elementsFromPoint(x, y);
    const top = stack[0];
    if (!top) return null;
    if (top.closest(CHROME_SELECTOR)) continue; // chrome overlapping content
    const hit =
      stack.find((el) => el.matches(CONTENT_SELECTOR)) ??
      top.closest(CONTENT_SELECTOR);
    if (!(hit instanceof HTMLElement)) continue; // gap or padding — look lower
    const rect = hit.getBoundingClientRect();
    if (rect.height === 0) continue; // hidden at this breakpoint
    // A huge match means we hit a media block or an unusual wrapper; media
    // still works as an anchor, wrappers don't — keep looking for text.
    if (rect.height > window.innerHeight * 2 && !hit.matches("img,figure")) {
      continue;
    }
    return { el: hit, gap: rect.top - chromeBottom };
  }
  return null;
}

export function ScrollPositionKeeper() {
  useEffect(() => {
    if (!("ResizeObserver" in window)) return;

    let recorded = distanceFromBottom();
    let chromeBottom = topChromeBottom(window.innerWidth / 2);
    let landmark: Landmark | null = pickLandmark(chromeBottom);
    // Chrome height changes only on reflow; the width-guard sets this so the
    // next sample rescans instead of reusing a stale edge.
    let chromeDirty = false;
    let lastY = window.scrollY;
    let burstActive = false;
    let escaped = false;
    let frozenDistance = 0;
    let frozenLandmark: Landmark | null = null;
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    // Cheap path per scroll frame: while the landmark still overlaps the
    // reading line, only its gap needs updating — no hit-test scan. The full
    // scan runs when the element leaves the line or chrome may have moved.
    const sample = () => {
      recorded = distanceFromBottom();
      if (!chromeDirty && landmark && landmark.el.isConnected) {
        const r = landmark.el.getBoundingClientRect();
        // Still inside the landmark scan window (at or near the top of the
        // reading area)? If it drifted off, rescan for the new topmost one.
        if (
          r.height > 0 &&
          r.bottom > chromeBottom &&
          r.top <= chromeBottom + LANDMARK_SCAN_LIMIT
        ) {
          landmark.gap = r.top - chromeBottom;
          return;
        }
      }
      chromeBottom = topChromeBottom(window.innerWidth / 2);
      landmark = pickLandmark(chromeBottom);
      chromeDirty = false;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const delta = Math.abs(window.scrollY - lastY);
        sample();
        lastY = window.scrollY;
        if (burstActive && delta > deliberateScrollThreshold()) {
          frozenDistance = recorded;
          frozenLandmark = landmark;
        }
      });
    };

    const endBurst = () => {
      burstActive = false;
      if (escaped) return;
      if (frozenDistance <= nearBottomThreshold()) {
        const target = Math.max(
          0,
          documentHeight() - window.innerHeight - frozenDistance
        );
        if (Math.abs(target - window.scrollY) > 1) window.scrollTo(0, target);
        return;
      }
      const lm = frozenLandmark;
      if (!lm || !lm.el.isConnected) return;
      const rect = lm.el.getBoundingClientRect();
      if (rect.height === 0) return; // display:none at the new breakpoint
      const desiredTop = topChromeBottom(window.innerWidth / 2) + lm.gap;
      const delta = rect.top - desiredTop;
      if (Math.abs(delta) > 1) window.scrollTo(0, window.scrollY + delta);
    };

    // A layout-width change freezes the pre-reflow position and opens the
    // settle window. Height-only resizes return early: with the width
    // unchanged, the document cannot reflow responsively, so any correction
    // would only fight unrelated viewport changes. ResizeObserver
    // notifications only extend that window while the document is still
    // changing size — they never open one themselves, so ordinary content
    // growth can't trigger a correction. While idle, RO notifications
    // refresh the samples so late-loading media doesn't leave them stale.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      chromeDirty = true;
      beginBurst();
    };
    const beginBurst = () => {
      if (!burstActive) {
        burstActive = true;
        escaped = false;
        frozenDistance = recorded;
        frozenLandmark = landmark;
      }
      clearTimeout(settleTimer);
      settleTimer = setTimeout(endBurst, RESIZE_SETTLE_MS);
    };
    const observer = new ResizeObserver(() => {
      if (burstActive) {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(endBurst, RESIZE_SETTLE_MS);
      } else {
        sample();
      }
    });

    const onEscape = () => {
      if (burstActive) escaped = true;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) onEscape();
    };

    // RO fires an initial notification on observe() before any real change —
    // harmless: with no burst active it just resamples.
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
