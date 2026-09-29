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
// scopes the resting-position translate and hit-region clip to that
// marker. Anything larger — prompt or open panel — keeps the vendor's own
// positioning so no content is ever clipped.
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

/**
 * Keep `data-launcher-only` in sync with the live widget iframe. The
 * iframe is injected asynchronously after widget.js runs, the vendor flips
 * its `state` attribute, and the prompt resizes the same element — so we
 * observe both DOM insertion and per-iframe size/attribute changes.
 * Returns a cleanup that disconnects every observer.
 */
export function watchRespondIoIframe(): () => void {
  let iframe: HTMLIFrameElement | null = null;
  let sizeObserver: ResizeObserver | null = null;
  let stateObserver: MutationObserver | null = null;

  const attach = (el: HTMLIFrameElement) => {
    iframe = el;
    syncLauncherOnlyAttribute(el);
    sizeObserver = new ResizeObserver(() => syncLauncherOnlyAttribute(el));
    sizeObserver.observe(el);
    stateObserver = new MutationObserver(() => syncLauncherOnlyAttribute(el));
    stateObserver.observe(el, { attributes: true, attributeFilter: ["state"] });
  };

  const scan = () => {
    const found = document.querySelector('iframe[title="Webchat Widget"]');
    if (found instanceof HTMLIFrameElement && found !== iframe) attach(found);
  };

  scan();
  const bodyObserver = new MutationObserver(scan);
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    bodyObserver.disconnect();
    sizeObserver?.disconnect();
    stateObserver?.disconnect();
  };
}
