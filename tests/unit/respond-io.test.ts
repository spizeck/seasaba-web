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

// Homepage hero suppression (issue #123): while the hero is in view the
// closed launcher hides via a document-level attribute. The contract below
// pins the narrow scoping that keeps this safe — the widget's own `state`
// attribute limits hiding to the closed launcher (which also carries the
// greeting popup), so an open conversation is never forcibly hidden, and
// `visibility` leaves the vendor's inline positioning untouched.
const globalsCss = readFileSync("app/globals.css", "utf8");

it("hides only the closed widget launcher while the homepage hero is in view", () => {
  const rule = globalsCss.match(
    /html\[data-hero-in-view\]\s*iframe\[title="Webchat Widget"\]\[state="widgetClose"\]\s*{([^}]+)}/
  );
  expect(rule).not.toBeNull();
  expect(rule![1]).toContain("visibility: hidden");
  // No transform lift or !important overrides fighting the vendor styles.
  expect(rule![1]).not.toContain("transform");
  expect(rule![1]).not.toContain("!important");
  // The old small-screen -60px launcher lift is gone entirely.
  expect(globalsCss).not.toContain("translateY(calc(-60px");
});

// Launcher resting-position calibration (issue #125): production
// measurement showed the visible bubble sits ~4-5px inside the 90x90
// iframe's corner, so vendor right/bottom:49px yields ~53-54px of
// visible clearance. A fixed 36px translate on the closed launcher lands
// the bubble ~17-18px from the viewport edges. The vendor does not set
// transform, so a plain rule is sufficient.
it("shifts only the closed launcher to its calibrated resting position", () => {
  const bodies = [...globalsCss.matchAll(
    /iframe\[title="Webchat Widget"\]\[state="widgetClose"\]\s*{([^}]+)}/g
  )].map((m) => m[1]);
  const combined = bodies.join("\n");
  expect(combined).toContain("transform: translate(36px, 36px)");
  expect(combined).not.toContain("!important");
  // The open conversation panel is never repositioned.
  expect(globalsCss).not.toMatch(/state="widgetOpen"\]\s*{[^}]*transform/);
});
