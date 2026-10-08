import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { RespondIoWidget } from "@/components/respond-io-widget";
import { RESPOND_IO_SCRIPT_ID } from "@/lib/respond-io";

// jsdom has no router context and no IntersectionObserver — the hoisted
// pathname mock controls the route per test, and the IO stub captures
// observed elements so tests can drive visibility manually.
const mocks = vi.hoisted(() => ({ pathname: { current: "/" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname.current,
}));

type IOCallback = (entries: { isIntersecting: boolean }[]) => void;
const ioInstances: { cb: IOCallback; observed: Element[]; disconnected: boolean }[] = [];
class IntersectionObserverStub {
  cb: IOCallback;
  observed: Element[] = [];
  disconnected = false;
  constructor(cb: IOCallback) {
    this.cb = cb;
    ioInstances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

// jsdom has no ResizeObserver — the iframe-geometry watcher (issue #184)
// uses it to re-mark the launcher when the vendor resizes the element.
// The stub captures each callback so tests can drive resizes manually.
const roCallbacks: (() => void)[] = [];
class ResizeObserverStub {
  cb: () => void;
  disconnected = false;
  constructor(cb: () => void) {
    this.cb = cb;
    roCallbacks.push(cb);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);

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
  mocks.pathname.current = "/";
  ioInstances.length = 0;
  roCallbacks.length = 0;
  document.documentElement.removeAttribute("data-hero-in-view");
});

afterEach(() => {
  document.getElementById(RESPOND_IO_SCRIPT_ID)?.remove();
  document
    .querySelectorAll('iframe[title="Webchat Widget"]')
    .forEach((el) => el.remove());
  delete (window as unknown as { $respond?: RespondStub }).$respond;
  document.documentElement.removeAttribute("data-hero-in-view");
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

// --- Homepage hero launcher suppression (issue #123) ---

const heroAttr = () => document.documentElement.hasAttribute("data-hero-in-view");

it("sets data-hero-in-view only while the hero intersects the viewport", () => {
  mocks.pathname.current = "/";
  render(
    <>
      <div data-hero />
      <RespondIoWidget />
    </>
  );
  expect(ioInstances).toHaveLength(1);
  expect(ioInstances[0].observed).toHaveLength(1);
  expect(ioInstances[0].observed[0]).toHaveAttribute("data-hero");
  expect(heroAttr()).toBe(false);

  ioInstances[0].cb([{ isIntersecting: true }]);
  expect(heroAttr()).toBe(true);
  ioInstances[0].cb([{ isIntersecting: false }]);
  expect(heroAttr()).toBe(false);
});

it("does not observe or suppress on interior routes", () => {
  mocks.pathname.current = "/diving";
  render(<RespondIoWidget />);
  expect(ioInstances).toHaveLength(0);
  expect(heroAttr()).toBe(false);
});

it("clears the attribute when navigating away and re-applies on return", () => {
  mocks.pathname.current = "/";
  const view = render(
    <>
      <div data-hero />
      <RespondIoWidget />
    </>
  );
  ioInstances[0].cb([{ isIntersecting: true }]);
  expect(heroAttr()).toBe(true);

  // App Router keeps the layout mounted — only the pathname changes.
  mocks.pathname.current = "/diving";
  view.rerender(<RespondIoWidget />);
  expect(heroAttr()).toBe(false);
  expect(ioInstances[0].disconnected).toBe(true);

  mocks.pathname.current = "/";
  view.rerender(
    <>
      <div data-hero />
      <RespondIoWidget />
    </>
  );
  expect(ioInstances).toHaveLength(2);
  ioInstances[1].cb([{ isIntersecting: true }]);
  expect(heroAttr()).toBe(true);
});

it("removes the attribute on unmount", () => {
  mocks.pathname.current = "/";
  const view = render(
    <>
      <div data-hero />
      <RespondIoWidget />
    </>
  );
  ioInstances[0].cb([{ isIntersecting: true }]);
  view.unmount();
  expect(heroAttr()).toBe(false);
});

// --- Launcher-vs-prompt geometry marker (issue #184) ---
// The vendor reuses the closed-state iframe for the prompt card, so the
// component watches the iframe and marks it `data-launcher-only` only
// while it measures launcher-sized. globals.css scopes the hit-region
// clip to that marker, and the watcher translates the iframe onto the
// shared bottom-right anchor.

// Mutable geometry behind each fake so tests can drive vendor resizes.
const iframeGeometry = new WeakMap<
  Element,
  { width: number; height: number; insetRight: number; insetBottom: number }
>();

function fakeIframe(
  size: { width: number; height: number },
  state = "widgetClose",
  vendorInset?: { right: number; bottom: number }
) {
  const f = document.createElement("iframe");
  f.title = "Webchat Widget";
  f.setAttribute("state", state);
  const geom = {
    ...size,
    insetRight: vendorInset?.right ?? window.innerWidth - size.width,
    insetBottom: vendorInset?.bottom ?? window.innerHeight - size.height,
  };
  iframeGeometry.set(f, geom);
  vi.spyOn(f, "getBoundingClientRect").mockImplementation(() => {
    // Mirror a real browser: the reported rect already includes whatever
    // translate the watcher applied, so re-syncs stay idempotent instead
    // of accumulating.
    const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(
      f.style.transform
    );
    const dx = m ? Number(m[1]) : 0;
    const dy = m ? Number(m[2]) : 0;
    const right = window.innerWidth - geom.insetRight + dx;
    const bottom = window.innerHeight - geom.insetBottom + dy;
    return {
      width: geom.width,
      height: geom.height,
      x: right - geom.width,
      y: bottom - geom.height,
      top: bottom - geom.height,
      left: right - geom.width,
      right,
      bottom,
      toJSON: () => ({}),
    } as DOMRect;
  });
  document.body.appendChild(f);
  return f;
}

function resizeFakeIframe(f: Element, size: { width: number; height: number }) {
  const geom = iframeGeometry.get(f)!;
  geom.width = size.width;
  geom.height = size.height;
}

function setFakeIframeVendorInset(
  f: Element,
  inset: { right: number; bottom: number }
) {
  const geom = iframeGeometry.get(f)!;
  geom.insetRight = inset.right;
  geom.insetBottom = inset.bottom;
}

it("marks a launcher-sized closed iframe as data-launcher-only", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  const f = fakeIframe({ width: 90, height: 90 });
  await waitFor(() => expect(f).toHaveAttribute("data-launcher-only"));
});

it("does not mark a prompt-sized closed iframe — the prompt must never be clipped", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  const f = fakeIframe({ width: 330, height: 179 });
  const rectSpy = f.getBoundingClientRect as ReturnType<typeof vi.spyOn>;
  // The watcher attaches via MutationObserver and measures the iframe on
  // attach — wait until it has actually seen this element.
  await waitFor(() => expect(rectSpy).toHaveBeenCalled());
  expect(f).not.toHaveAttribute("data-launcher-only");
});

it("drops the marker when the iframe grows for the prompt or opens", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  const f = fakeIframe({ width: 90, height: 90 });
  await waitFor(() => expect(f).toHaveAttribute("data-launcher-only"));

  // Vendor grows the same widgetClose iframe to host the prompt.
  resizeFakeIframe(f, { width: 330, height: 179 });
  roCallbacks.forEach((cb) => cb());
  expect(f).not.toHaveAttribute("data-launcher-only");

  // Vendor reopens the launcher: shrink back and close state again.
  resizeFakeIframe(f, { width: 90, height: 90 });
  roCallbacks.forEach((cb) => cb());
  expect(f).toHaveAttribute("data-launcher-only");

  // state=widgetOpen is never the launcher, even at a small size.
  f.setAttribute("state", "widgetOpen");
  await waitFor(() => expect(f).not.toHaveAttribute("data-launcher-only"));
});

it("still maintains the geometry marker when the cId env var is unset", async () => {
  // The watcher is unconditional — it governs any "Webchat Widget"
  // iframe in the DOM (the test build injects stand-ins with no cId);
  // only vendor-script injection is gated on the env var.
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "");
  render(<RespondIoWidget />);
  const f = fakeIframe({ width: 90, height: 90 });
  await waitFor(() => expect(f).toHaveAttribute("data-launcher-only"));
  expect(script()).toBeNull();
});

// Cleanup regression (PR #185 review): the vendor iframe outlives the
// component, so unmount must strip `data-launcher-only` — otherwise a
// prompt shown before remount would inherit the launcher clip.
it("strips data-launcher-only from the surviving iframe on unmount", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  const view = render(<RespondIoWidget />);
  const f = fakeIframe({ width: 90, height: 90 });
  await waitFor(() => expect(f).toHaveAttribute("data-launcher-only"));

  view.unmount();
  // The iframe stays in the DOM (the vendor owns it), but the marker is
  // gone — it must never persist past the watcher that maintains it.
  expect(document.body.contains(f)).toBe(true);
  expect(f).not.toHaveAttribute("data-launcher-only");
});

// --- Shared launcher anchor (corrective rework after #235) ---
// The watcher translates the iframe so its edges rest at
// RESPOND_IO_ANCHOR_RIGHT_PX / RESPOND_IO_ANCHOR_BOTTOM_PX, adapting the
// delta to whatever inset the vendor reports (steady 43px, the 25px
// mount transient, or a full-bleed ~0px mobile open panel). jsdom window
// size is 1024x768.

it("anchors a closed launcher at the shared edge inset", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  // Vendor steady-state inset measured on production: right/bottom 43px.
  const f = fakeIframe(
    { width: 90, height: 90 },
    "widgetClose",
    { right: 43, bottom: 43 }
  );
  await waitFor(() =>
    expect(f.style.transform).toBe("translate(25px, 37px)")
  );
});

it("re-anchors when the vendor rewrites its inline inset mid-session", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  // Vendor mounts at a transient 25px inset before remote config lands.
  const f = fakeIframe(
    { width: 90, height: 90 },
    "widgetClose",
    { right: 25, bottom: 25 }
  );
  await waitFor(() => expect(f.style.transform).toBe("translate(7px, 19px)"));

  // Config lands: vendor rewrites right/bottom to the steady 43px. The
  // style mutation re-syncs the watcher onto the same anchor edges.
  setFakeIframeVendorInset(f, { right: 43, bottom: 43 });
  f.style.setProperty("z-index", "9999");
  await waitFor(() => expect(f.style.transform).toBe("translate(25px, 37px)"));
});

it("keeps the anchor translate on prompt-sized geometry — the launcher never moves", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  // The prompt card (330x178) and the desktop open panel (400x600) sit at
  // the same 43px vendor inset — all anchored states share the edge.
  const f = fakeIframe(
    { width: 330, height: 178 },
    "widgetClose",
    { right: 43, bottom: 43 }
  );
  await waitFor(() => expect(f.style.transform).toBe("translate(25px, 37px)"));
  expect(f).not.toHaveAttribute("data-launcher-only");
});

it("re-applies the anchor if the vendor wipes the transform via cssText", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  const f = fakeIframe(
    { width: 90, height: 90 },
    "widgetClose",
    { right: 43, bottom: 43 }
  );
  await waitFor(() => expect(f.style.transform).toBe("translate(25px, 37px)"));

  // Vendor rewrites the whole inline style (e.g. config refresh): our
  // translate is wiped while the inset drops to the transient 25px. The
  // next sync must measure from the untransformed rect — not add the
  // stale delta on top — and land the edge on the same anchor.
  setFakeIframeVendorInset(f, { right: 25, bottom: 25 });
  f.style.cssText = "position:fixed";
  await waitFor(() => expect(f.style.transform).toBe("translate(7px, 19px)"));
});

it("leaves a full-bleed mobile open panel at vendor geometry", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  // Production: the small-viewport open panel is viewport-sized at
  // right/bottom:0 — anchoring it would push it offscreen, so the watcher
  // leaves it alone.
  const f = fakeIframe(
    { width: window.innerWidth, height: window.innerHeight },
    "widgetOpen",
    { right: 0, bottom: 0 }
  );
  const rectSpy = f.getBoundingClientRect as ReturnType<typeof vi.spyOn>;
  await waitFor(() => expect(rectSpy).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 0));
  expect(f.style.transform).toBe("");
});

it("strips marker and transform from an iframe the vendor replaces", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  render(<RespondIoWidget />);
  const old = fakeIframe(
    { width: 90, height: 90 },
    "widgetClose",
    { right: 43, bottom: 43 }
  );
  await waitFor(() =>
    expect(old.style.transform).toBe("translate(25px, 37px)")
  );
  expect(old).toHaveAttribute("data-launcher-only");

  // Vendor injects a fresh iframe before removing the old one — the
  // outgoing element must lose our overrides at handoff.
  fakeIframe({ width: 90, height: 90 }, "widgetClose", { right: 43, bottom: 43 });
  await waitFor(() => {
    expect(old).not.toHaveAttribute("data-launcher-only");
    expect(old.style.transform).toBe("");
  });
});

it("clears the anchor transform from the surviving iframe on unmount", async () => {
  vi.stubEnv("NEXT_PUBLIC_RESPOND_IO_CID", "test-cid-123");
  const view = render(<RespondIoWidget />);
  const f = fakeIframe(
    { width: 90, height: 90 },
    "widgetClose",
    { right: 43, bottom: 43 }
  );
  await waitFor(() => expect(f.style.transform).toBe("translate(25px, 37px)"));

  view.unmount();
  expect(f.style.transform).toBe("");
});
