import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import {
  isLauncherOnlyGeometry,
  RESPOND_IO_CDN,
  RESPOND_IO_LAUNCHER_EDGE_PX,
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

// Positioning ownership boundary: Respond.io owns the widget iframe's
// placement (dashboard alignment/spacing), so no stylesheet rule may set
// a positioning property on it — no transform, no right/bottom/top/left,
// no position, no !important. Prompt-safety (issue #184): the vendor
// reuses one closed-state iframe for launcher, prompt, and panel — so
// the hit-region clip must key off the loader-maintained
// `data-launcher-only` geometry marker, never the bare widgetClose state.
it("never repositions the widget iframe — Respond.io owns placement", () => {
  // Every rule that targets the widget iframe, whatever the selector.
  const rules = [...globalsCss.matchAll(
    /iframe\[title="Webchat Widget"\][^{]*{([^}]+)}/g
  )];
  expect(rules.length).toBeGreaterThan(0);
  for (const m of rules) {
    // Positioning declarations start a rule body or follow a `;`.
    expect(m[1]).not.toMatch(
      /(^|;)\s*(transform|translate|top|right|bottom|left|position|inset|margin)\s*:/i
    );
    expect(m[1]).not.toContain("!important");
  }
});

it("clips only the marked launcher-only iframe's hit region", () => {
  const bodies = [...globalsCss.matchAll(
    /iframe\[title="Webchat Widget"\]\[data-launcher-only\]\s*{([^}]+)}/g
  )].map((m) => m[1]);
  const combined = bodies.join("\n");
  // clip-path shrinks the transparent hit area to the circle's quarter.
  expect(combined).toContain("clip-path: inset(25% 0 0 25%)");
  // The clip is the only thing the rule does.
  expect(combined.trim()).toBe("clip-path: inset(25% 0 0 25%);");
  // Regression for #184: no rule may clip a widgetClose iframe
  // unconditionally — the same state also hosts the prompt card.
  const closedBodies = [...globalsCss.matchAll(
    /iframe\[title="Webchat Widget"\]\[state="widgetClose"\]\s*{([^}]+)}/g
  )].map((m) => m[1]).join("\n");
  expect(closedBodies).not.toContain("clip-path");
  // The open conversation panel is never clipped.
  expect(globalsCss).not.toMatch(/state="widgetOpen"\]\s*{[^}]*clip-path/);
});

// Geometry contract the watcher enforces (issue #184): production
// measurement — launcher-only is 90x90; the prompt card inflates the same
// widgetClose iframe to ~179px tall / 234-330px wide; the open panel is
// widgetOpen at any size.
it("classifies launcher vs prompt vs open iframe geometry", () => {
  expect(isLauncherOnlyGeometry("widgetClose", 90, 90)).toBe(true);
  expect(isLauncherOnlyGeometry("widgetClose", RESPOND_IO_LAUNCHER_EDGE_PX, 90)).toBe(true);
  // Prompt-visible closed iframe — must NOT be treated as launcher.
  expect(isLauncherOnlyGeometry("widgetClose", 330, 179)).toBe(false);
  expect(isLauncherOnlyGeometry("widgetClose", 234, 179)).toBe(false);
  // Open panel, even if small, is never the launcher.
  expect(isLauncherOnlyGeometry("widgetOpen", 90, 90)).toBe(false);
  expect(isLauncherOnlyGeometry("widgetOpen", 400, 600)).toBe(false);
  // Missing/zero-size iframe (still injecting) is not the launcher.
  expect(isLauncherOnlyGeometry("widgetClose", 0, 0)).toBe(false);
  expect(isLauncherOnlyGeometry(null, 90, 90)).toBe(false);
});
