import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { RespondIoWidget } from "@/components/respond-io-widget";
import { RESPOND_IO_SCRIPT_ID } from "@/lib/respond-io";

// The widget itself is a vendor iframe application; the loader is our
// surface. These tests exercise the real loader (script injection, env
// gating, load-event deferral, remount dedup, graceful failure) and stub
// only the vendor's $respond API object — the same boundary the booking
// tests stub for Checkfront's DROPLET global.

type RespondStub = {
  state: Record<string, unknown>;
  do: (action: string) => void;
  on: (event: string, cb: () => void) => void;
  is: (key: string) => boolean;
};

function stubRespond(): { api: RespondStub; emit: (event: string) => void } {
  const listeners = new Map<string, (() => void)[]>();
  const api: RespondStub = {
    state: {},
    do: vi.fn(),
    on: (event, cb) => {
      listeners.set(event, [...(listeners.get(event) ?? []), cb]);
    },
    is: (key) => Boolean(api.state[key]),
  };
  (window as unknown as { $respond?: RespondStub }).$respond = api;
  return { api, emit: (event) => listeners.get(event)?.forEach((cb) => cb()) };
}

const layer = () =>
  (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer;

beforeEach(() => {
  (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
});

afterEach(() => {
  document.getElementById(RESPOND_IO_SCRIPT_ID)?.remove();
  delete (window as unknown as { $respond?: RespondStub }).$respond;
  vi.unstubAllEnvs();
});

const script = () => document.getElementById(RESPOND_IO_SCRIPT_ID);

it("loads nothing when the cId env var is unset", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "");
  render(<RespondIoWidget />);
  expect(script()).toBeNull();
});

it("injects the vendor script after the window load event", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  const readyState = vi
    .spyOn(document, "readyState", "get")
    .mockReturnValue("loading");
  render(<RespondIoWidget />);
  // Still loading: deferred, nothing injected yet.
  expect(script()).toBeNull();
  readyState.mockReturnValue("complete");
  fireEvent.load(window);
  const el = script()!;
  expect(el).toBeInstanceOf(HTMLScriptElement);
  expect(el).toHaveAttribute(
    "src",
    "https://cdn.respond.io/webchat/widget/widget.js?cId=test-cid-123"
  );
  expect((el as HTMLScriptElement).async).toBe(true);
});

it("injects immediately when the page is already complete (client-side navigation)", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  render(<RespondIoWidget />);
  expect(script()).not.toBeNull();
});

it("never injects a second script across remounts", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  const first = render(<RespondIoWidget />);
  first.unmount();
  render(<RespondIoWidget />);
  expect(document.querySelectorAll(`#${RESPOND_IO_SCRIPT_ID}`)).toHaveLength(1);
});

it("wires chat analytics through the vendor API once the script loads", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  // Visitor landed on a URL carrying PII in query + fragment — chat
  // analytics must never forward it (Sourcery review on #111).
  window.history.replaceState(
    {},
    "",
    "/diving?email=alice@example.com#booking-ref"
  );
  const { emit } = stubRespond();
  render(<RespondIoWidget />);
  fireEvent.load(script()!);

  emit("chat:opened");
  expect(layer()).toHaveLength(1);
  expect(layer()[0]).toMatchObject({
    event: "chat_open",
    page_location: "http://localhost:3000/diving",
    page_path: "/diving",
  });

  emit("chat:sent");
  emit("chat:sent");
  const started = layer().filter((e) => e.event === "chat_conversation_started");
  expect(started).toHaveLength(1);
  expect(started[0].page_location).toBe("http://localhost:3000/diving");

  // Analytics payload carries page context only — no contact data fields,
  // and no URL query/fragment content from the landing URL.
  const serialized = JSON.stringify(layer());
  expect(serialized).not.toContain("alice@example.com");
  expect(serialized).not.toContain("booking-ref");
  for (const entry of layer()) {
    for (const key of Object.keys(entry)) {
      expect(key).not.toMatch(/email|name|phone|message|contact|conversation/i);
    }
  }
});

it("does not fire analytics before the visitor opens the chat", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  stubRespond();
  render(<RespondIoWidget />);
  fireEvent.load(script()!);
  // Widget loaded and wired, but no open/send events yet.
  expect(layer()).toHaveLength(0);
});

it("stays silent when the vendor API never appears (blocked script)", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  render(<RespondIoWidget />);
  // Script element exists but $respond is absent (script failed to execute).
  fireEvent.load(script()!);
  fireEvent.error(script()!);
  expect(layer()).toHaveLength(0);
  expect((window as unknown as { $respond?: unknown }).$respond).toBeUndefined();
});

it("renders no markup into the React tree", () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  const { container } = render(<RespondIoWidget />);
  expect(container).toBeEmptyDOMElement();
});
