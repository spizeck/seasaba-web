import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import {
  RESPOND_IO_CDN,
  RESPOND_IO_SCRIPT_ID,
  respondIoWidgetSrc,
  wireRespondAnalytics,
} from "@/lib/respond-io";

it("builds the canonical widget script URL from the public cId", () => {
  expect(RESPOND_IO_SCRIPT_ID).toBe("respondio__widget");
  expect(respondIoWidgetSrc("abc123")).toBe(
    `${RESPOND_IO_CDN}/webchat/widget/widget.js?cId=abc123`
  );
  expect(respondIoWidgetSrc("abc123")).toBe(
    "https://cdn.respond.io/webchat/widget/widget.js?cId=abc123"
  );
});

it("URI-encodes the cId so a malformed value cannot break the URL", () => {
  const src = respondIoWidgetSrc('x"><script>');
  expect(src).toContain("cId=x%22%3E%3Cscript%3E");
  expect(src).not.toContain('"');
});

it("fires chat_open once per chat:opened event and no other data", () => {
  const listeners = new Map<string, () => void>();
  const respond = { on: (e: string, cb: () => void) => listeners.set(e, cb) };
  const onChatOpen = vi.fn();
  const onConversationStart = vi.fn();
  wireRespondAnalytics(respond, { onChatOpen, onConversationStart });

  listeners.get("chat:opened")!();
  listeners.get("chat:opened")!();
  expect(onChatOpen).toHaveBeenCalledTimes(2);
});

it("counts only the first chat:sent as a conversation start per session", () => {
  const listeners = new Map<string, () => void>();
  const respond = { on: (e: string, cb: () => void) => listeners.set(e, cb) };
  const onChatOpen = vi.fn();
  const onConversationStart = vi.fn();
  wireRespondAnalytics(respond, { onChatOpen, onConversationStart });

  const sent = listeners.get("chat:sent")!;
  sent();
  sent();
  sent();
  expect(onConversationStart).toHaveBeenCalledTimes(1);
});

it("subscribes to both widget events through the documented $respond.on API", () => {
  const events: string[] = [];
  const respond = { on: (e: string) => events.push(e) };
  wireRespondAnalytics(respond, { onChatOpen: vi.fn(), onConversationStart: vi.fn() });
  expect(events).toEqual(["chat:opened", "chat:sent"]);
});

// The launcher clearance rule in globals.css is the only website-controlled
// positioning lever that works: Respond.io positions the widget iframe with
// inline !important styles, so stylesheet bottom/top rules cannot override
// it — but `transform` is never set by the vendor. The contract below pins
// the narrow scoping that keeps this safe: the widget's own `state`
// attribute limits the lift to the closed launcher, never the open panel.
const globalsCss = readFileSync("app/globals.css", "utf8");

it("lifts only the closed widget launcher, on small screens, via transform", () => {
  const rule = globalsCss.match(
    /@media \(max-width: (\d+)px\)\s*{\s*([^}]+)}\s*}/
  );
  expect(rule).not.toBeNull();
  const [, maxWidth, body] = rule!;
  expect(Number(maxWidth)).toBeLessThan(1024);
  expect(body).toContain('iframe[title="Webchat Widget"][state="widgetClose"]');
  expect(body).toContain("transform: translateY(");
  expect(body).toContain("env(safe-area-inset-bottom");
  expect(body).not.toContain("!important");
});
