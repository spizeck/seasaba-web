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
