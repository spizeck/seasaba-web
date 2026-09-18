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
