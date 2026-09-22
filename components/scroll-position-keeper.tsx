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
 * When a layout-width change starts a resize burst, both samples are
 * frozen — scroll events fired *during* reflow (browsers emit them as the
 * scroll offset is clamped or anchor-adjusted step by step) must not
 * overwrite them, since they already describe the broken post-reflow
 * position.
 *
 * While the burst is active a rAF loop corrects the residual drift every
 * frame, so the displacement caused by the reflow is never painted — the
 * pinned content simply stays put instead of visibly moving away and
 * snapping back after a settle delay (the failure mode of a
 * settle-then-correct design, measured at ~180ms of >1400px displacement).
 * A final correction runs once the document has been stable for one settle
 * window, then the loop stops.
 *
 * Which correction runs:
 * - Footer region (frozen distance within one footer-height of the end,
 *   measured *before* the reflow since the footer itself changes height):
 *   keep the same distance from the bottom.
 * - Anywhere else: keep the landmark element at its recorded gap below the
 *   sticky chrome — so a pill nav wrapping to a second row can't cover or
 *   displace the topmost readable line, and mid-paragraph position is
 *   preserved rather than snapping to a section top. If the landmark is
 *   hidden or removed by the new breakpoint, no correction runs.
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
 * - The correction loop runs only during a burst — one
 *   `getBoundingClientRect` plus a small chrome scan per frame — and stops
 *   150ms after the last document-size change. A ResizeObserver can extend
 *   a burst but never open one, so content growth (navigation, lazy
 *   media, fonts) can't start corrections.
 * - A deliberate scroll jump during a burst (>300px / half a viewport —
 *   anchor nav, scrollbar drag, programmatic scroll; reflow noise is
 *   ~6px/event) re-anchors the frozen target to the visitor's new
 *   position instead of dragging them back to the stale one.
 * - Landmarks are existing semantic elements discovered geometrically; no
 *   markup changes, no hardcoded heights or breakpoints, no URL/hash
 *   mutation.
 * - Instant `scrollTo` — never animated.
 * - Explicit scroll input (wheel, touch, scroll keys, pointer) during the
 *   burst cancels corrections, so it never fights the visitor.
 * - Fragment navigation, back/forward restoration, and initial load are
 *   untouched: without a resize event nothing happens at all.
 */

// Long enough to span the incremental reflow steps that follow a breakpoint
// jump; the correction loop stops once the document has been quiet this long.
const RESIZE_SETTLE_MS = 150;

// How far below the viewport top to look for the first usable content
// element when a landmark must be (re)selected.
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

// Bottom edge of the top-pinned chrome (sticky site header, sticky section
// pill nav, ...). Measured from the few sticky/fixed candidates rather than
// hit-testing every 4px — cheap enough to run per frame during a burst,
// and exact when the pill nav wraps to a second row on narrow viewports.
function topChromeBottom() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let bottom = 0;
  for (const el of document.querySelectorAll(CHROME_SELECTOR)) {
    const r = el.getBoundingClientRect();
    // A full-width bar pinned in the top region. Excludes corner launchers
    // (not wide) and full-screen overlays (taller than the region).
    if (r.width >= vw * 0.8 && r.top <= vh * 0.25 && r.bottom <= vh * 0.75) {
      bottom = Math.max(bottom, r.bottom);
    }
  }
  return bottom;
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

// A scroll delta beyond this during an active burst is a deliberate move —
// anchor navigation, a scrollbar drag, or a programmatic scroll — not
// reflow noise (measured ~6px per event). The frozen target is re-anchored
// to the visitor's new position so the correction preserves where they are
// *now*, not where they were when the resize began.
function deliberateScrollThreshold() {
  return Math.max(300, window.innerHeight / 2);
}

export function ScrollPositionKeeper() {
  useEffect(() => {
    if (!("ResizeObserver" in window)) return;

    let recorded = distanceFromBottom();
    // Footer height must come from the pre-reflow sample: by the time a
    // resize event fires the layout has often already reflowed, so a live
    // read would classify a visitor just *above* a footer that grew as
    // being *inside* it and pin them to the bottom.
    let recordedThreshold = nearBottomThreshold();
    let chromeBottom = topChromeBottom();
    let landmark: Landmark | null = pickLandmark(chromeBottom);
    // Chrome height changes only on reflow; the width-guard sets this so the
    // next sample rescans instead of reusing a stale edge.
    let chromeDirty = false;
    let lastY = window.scrollY;
    let burstActive = false;
    let escaped = false;
    let frozenDistance = 0;
    let frozenThreshold = 0;
    let frozenLandmark: Landmark | null = null;
    let sampleFrame = 0;
    let tickFrame = 0;
    let reanchorPending = false;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    // Cheap path per scroll frame: while the landmark still sits inside the
    // scan window, only its gap needs updating — no hit-test scan. The full
    // scan runs when the element leaves the window or chrome may have moved.
    const sample = () => {
      recorded = distanceFromBottom();
      recordedThreshold = nearBottomThreshold();
      if (!chromeDirty && landmark && landmark.el.isConnected) {
        const r = landmark.el.getBoundingClientRect();
        if (
          r.height > 0 &&
          r.bottom > chromeBottom &&
          r.top <= chromeBottom + LANDMARK_SCAN_LIMIT
        ) {
          landmark.gap = r.top - chromeBottom;
          return;
        }
      }
      chromeBottom = topChromeBottom();
      landmark = pickLandmark(chromeBottom);
      chromeDirty = false;
    };

    const onScroll = () => {
      // A deliberate jump is detected synchronously in the event: a queued
      // correction tick could otherwise run first and drag the visitor back
      // to the stale target for a frame. Reflow noise (~6px/event) stays
      // below the threshold and is ignored.
      if (
        burstActive &&
        Math.abs(window.scrollY - lastY) > deliberateScrollThreshold()
      ) {
        frozenDistance = distanceFromBottom();
        frozenThreshold = recordedThreshold;
        frozenLandmark = null; // resampled for the new position below
        reanchorPending = true;
        lastY = window.scrollY;
      }
      cancelAnimationFrame(sampleFrame);
      sampleFrame = requestAnimationFrame(() => {
        sampleFrame = 0;
        sample();
        lastY = window.scrollY;
        if (reanchorPending) {
          reanchorPending = false;
          frozenLandmark = landmark;
        }
      });
    };

    // Pin the frozen target every frame while the burst runs: reflow
    // displacement is corrected before it is painted, so the visitor sees
    // stable content instead of a move-then-snap.
    const correct = () => {
      const y = window.scrollY;
      if (frozenDistance <= frozenThreshold) {
        const target = Math.max(
          0,
          documentHeight() - window.innerHeight - frozenDistance
        );
        if (Math.abs(y - target) > 1) {
          window.scrollTo(0, target);
          lastY = target;
        }
        return;
      }
      const lm = frozenLandmark;
      if (!lm || !lm.el.isConnected) return;
      const rect = lm.el.getBoundingClientRect();
      if (rect.height === 0) return; // display:none at the new breakpoint
      const desiredTop = topChromeBottom() + lm.gap;
      const delta = rect.top - desiredTop;
      if (Math.abs(delta) > 1) {
        window.scrollTo(0, y + delta);
        lastY = y + delta;
      }
    };

    const tick = () => {
      tickFrame = 0;
      // Escaped means the visitor took over scrolling — stop pinning for
      // the rest of this burst.
      if (!burstActive || escaped) return;
      correct();
      tickFrame = requestAnimationFrame(tick);
    };

    const endBurst = () => {
      burstActive = false;
      if (!escaped) correct();
    };

    // A layout-width change freezes the pre-reflow position and opens the
    // correction window. Height-only resizes return early: with the width
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
        frozenThreshold = recordedThreshold;
        frozenLandmark = landmark;
        if (!tickFrame) tickFrame = requestAnimationFrame(tick);
      }
      // Post-resize layout is already readable at event time — correcting
      // here keeps even the first reflowed frame from painting displaced.
      if (!escaped) correct();
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
      cancelAnimationFrame(sampleFrame);
      cancelAnimationFrame(tickFrame);
      clearTimeout(settleTimer);
    };
  }, []);

  return null;
}
