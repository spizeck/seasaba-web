// Respond.io Website Chat widget — loader contract.
//
// The widget is the vendor's native launcher + iframe UI (no custom chat
// interface). Verified against the shipped widget.js (see issue #109):
// the top-frame script exposes `window.$respond` with
// `do("chat:open" | "chat:close" | "chat:reinitialize")`,
// `on("chat:opened" | "chat:closed" | "chat:sent", cb)` and
// `is("chat:open" | "chat:closed")`, fetches its remote config from
// `https://service.respond.io/webchat/connect?cId=...`, and mounts an
// iframe to `https://cdn.respond.io/webchat/widget/chat.html`. It sets no
// cookies and no local/session storage on the embedding origin — all widget
// state lives inside the cdn.respond.io iframe.
//
// `chat:sent` fires on every visitor message. It exists in the shipped
// widget API but is not listed in the public help docs, so the analytics
// consumer dedupes it to the first send per page session and treats it as
// "conversation started" — never as a per-message signal.

export const RESPOND_IO_SCRIPT_ID = "respondio__widget";
export const RESPOND_IO_CDN = "https://cdn.respond.io";

/** The widget's public API surface, as shipped in widget.js. */
export interface RespondApi {
  state: Record<string, unknown>;
  do(action: "chat:open" | "chat:close" | "chat:reinitialize" | string): void;
  on(event: "chat:opened" | "chat:closed" | "chat:sent" | string, callback: () => void): void;
  is(key: string): boolean;
}

export function respondIoWidgetSrc(cId: string): string {
  return `${RESPOND_IO_CDN}/webchat/widget/widget.js?cId=${encodeURIComponent(cId)}`;
}

/**
 * Subscribe the widget's documented events to the given handlers.
 * `onConversationStart` fires once per page session — the first
 * `chat:sent` — so repeat messages never inflate the metric.
 */
export function wireRespondAnalytics(
  respond: Pick<RespondApi, "on">,
  handlers: { onChatOpen: () => void; onConversationStart: () => void }
): void {
  let conversationStarted = false;
  respond.on("chat:opened", handlers.onChatOpen);
  respond.on("chat:sent", () => {
    if (conversationStarted) return;
    conversationStarted = true;
    handlers.onConversationStart();
  });
}

// Closed-state geometry contract (issue #184). The vendor reuses ONE
// iframe for the closed launcher and the promotional prompt card:
// measured on production, launcher-only is 90x90, while the prompt grows
// the same `state="widgetClose"` iframe to ~179px tall and up to ~330px
// wide. CSS cannot read element geometry, so the loader marks the iframe
// `data-launcher-only` only while it measures launcher-sized; globals.css
// scopes the hit-region clip to that marker. Anything larger — prompt or
// open panel — is never clipped so no content is ever cut off.
export const RESPOND_IO_LAUNCHER_EDGE_PX = 120;

export function isLauncherOnlyGeometry(
  state: string | null,
  width: number,
  height: number
): boolean {
  return (
    state === "widgetClose" &&
    width > 0 &&
    width <= RESPOND_IO_LAUNCHER_EDGE_PX &&
    height <= RESPOND_IO_LAUNCHER_EDGE_PX
  );
}

export function syncLauncherOnlyAttribute(iframe: HTMLIFrameElement): void {
  const { width, height } = iframe.getBoundingClientRect();
  iframe.toggleAttribute(
    "data-launcher-only",
    isLauncherOnlyGeometry(iframe.getAttribute("state"), width, height)
  );
}

// Launcher anchor target. Production measurements (verified against the
// live widget): the vendor anchors the same iframe at right/bottom:43px in
// every steady state — launcher-only, prompt card, and the desktop open
// panel — with a brief 25px transient before remote config lands, and a
// full-bleed right/bottom:0 open panel on small viewports. The ~58px
// circle sits ~4px inside the iframe's bottom-right corner in every state.
//
// The launcher must hold one fixed anchor across closed → teaser → open →
// closing, so the watcher translates the iframe until its edges rest at
// the constants below — circle ≈ edge + 4px. The deltas are computed
// from the measured vendor inset on every sync rather than hardcoded per
// state, so the transient 25px mount, later dashboard spacing changes,
// and any future vendor inset all land on the same anchor. A full-bleed
// mobile open panel (vendor gap ~0) is left at vendor geometry.
//
// The axes target different clearances: 18px on the right puts the
// visible circle ~22px in, matching the comfortable teaser-era inset;
// 6px on the bottom lands the circle ~10px up — visually matching the
// rolled-back production resting point (the old 36px translate on a 43px
// vendor inset put the edge at ~7px) instead of floating higher.
export const RESPOND_IO_ANCHOR_RIGHT_PX = 18;
export const RESPOND_IO_ANCHOR_BOTTOM_PX = 6;

/**
 * Translate delta that moves an iframe edge sitting `vendorInsetPx` from
 * the viewport edge onto the `anchorPx` anchor. Insets of ~1px or less
 * mean a full-bleed state (e.g. the mobile open panel) — leave those
 * alone.
 */
export function launcherAnchorDelta(
  vendorInsetPx: number,
  anchorPx: number
): number {
  return vendorInsetPx > 1 ? vendorInsetPx - anchorPx : 0;
}

/**
 * Keep `data-launcher-only` and the anchor transform in sync with the
 * live widget iframe. The iframe is injected asynchronously after
 * widget.js runs, the vendor flips its `state` attribute and rewrites
 * inline `right`/`bottom`, and the prompt resizes the same element — so
 * we observe DOM insertion, resizes, and `state`/`style` changes.
 * Returns a cleanup that disconnects every observer and clears the
 * marker + transform — the vendor iframe can outlive the component, and
 * stale overrides must never survive the watcher that maintains them.
 */
export function watchRespondIoIframe(): () => void {
  let iframe: HTMLIFrameElement | null = null;
  let appliedDx = 0;
  let appliedDy = 0;
  let lastTransform = "";
  let sizeObserver: ResizeObserver | null = null;
  let stateObserver: MutationObserver | null = null;

  const sync = (el: HTMLIFrameElement) => {
    // Stale callbacks from a replaced iframe must not touch shared state.
    if (el !== iframe) return;
    syncLauncherOnlyAttribute(el);
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    // The rect already includes our transform — recover the vendor's own
    // inset (translate(+d) shrinks the measured gap by d) before
    // recomputing the delta, so re-syncing after a style mutation is
    // idempotent rather than accumulating. If the transform was wiped
    // externally (e.g. the vendor rewrote style.cssText), the rect is
    // already untransformed — don't add the cached deltas back, and
    // rewrite the transform below.
    const transformIntact = el.style.transform === lastTransform;
    const effDx = transformIntact ? appliedDx : 0;
    const effDy = transformIntact ? appliedDy : 0;
    const vendorRight = Math.round(window.innerWidth - rect.right + effDx);
    const vendorBottom = Math.round(window.innerHeight - rect.bottom + effDy);
    const dx = launcherAnchorDelta(vendorRight, RESPOND_IO_ANCHOR_RIGHT_PX);
    const dy = launcherAnchorDelta(vendorBottom, RESPOND_IO_ANCHOR_BOTTOM_PX);
    if (transformIntact && dx === appliedDx && dy === appliedDy) return;
    appliedDx = dx;
    appliedDy = dy;
    lastTransform = dx || dy ? `translate(${dx}px, ${dy}px)` : "";
    el.style.transform = lastTransform;
  };

  const attach = (el: HTMLIFrameElement) => {
    // The vendor can insert a replacement iframe before removing the old
    // one — retire the previous observers so their callbacks can't run
    // against the outgoing element, and strip its overrides so a detached
    // iframe never keeps our marker or translate.
    sizeObserver?.disconnect();
    stateObserver?.disconnect();
    if (iframe && iframe !== el) {
      iframe.removeAttribute("data-launcher-only");
      iframe.style.transform = "";
    }
    iframe = el;
    appliedDx = 0;
    appliedDy = 0;
    lastTransform = "";
    sync(el);
    sizeObserver = new ResizeObserver(() => sync(el));
    sizeObserver.observe(el);
    stateObserver = new MutationObserver(() => sync(el));
    stateObserver.observe(el, {
      attributes: true,
      attributeFilter: ["state", "style"],
    });
  };

  const scan = () => {
    // If the vendor ever inserts a replacement before removing the old
    // iframe, prefer the newest (last in DOM order).
    const all = document.querySelectorAll('iframe[title="Webchat Widget"]');
    const found = all[all.length - 1];
    if (found instanceof HTMLIFrameElement && found !== iframe) attach(found);
  };

  scan();
  const bodyObserver = new MutationObserver(scan);
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    bodyObserver.disconnect();
    sizeObserver?.disconnect();
    stateObserver?.disconnect();
    if (iframe) {
      iframe.removeAttribute("data-launcher-only");
      iframe.style.transform = "";
    }
  };
}
