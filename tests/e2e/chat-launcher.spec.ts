import type { Page } from "@playwright/test";
import { test, expect, hydratedGoto } from "./fixtures";

// Homepage chat-launcher suppression (#123), fixed launcher anchor
// (#125 calibration, corrective rework after #235), and prompt-safety
// (#184).
//
// The real Respond.io iframe is third-party and asynchronous, so these
// tests inject deterministic stand-ins matching the vendor's contract: an
// iframe titled "Webchat Widget" carrying a `state` attribute
// ("widgetClose" / "widgetOpen") and the vendor's fixed bottom-right
// geometry. Measured on production: launcher 90x90, prompt card ~330x178,
// and the desktop open panel ~400x600 all anchor at right/bottom:43px;
// the vendor briefly mounts at 25px before remote config lands, and the
// small-viewport open panel is full-bleed at right/bottom:0.
//
// What we own is the mechanism — IntersectionObserver toggling
// `data-hero-in-view` on <html>, the CSS rule hiding
// `[state="widgetClose"]` while it is set, and the geometry watcher
// (lib/respond-io.ts) that marks launcher-sized iframes
// `data-launcher-only` (clip-path hit region) and translates every
// anchored state so the iframe edge rests at RESPOND_IO_ANCHOR_RIGHT_PX /
// RESPOND_IO_ANCHOR_BOTTOM_PX (18px / 6px). The ~58px circle sits ~4px
// inside the iframe corner, so the visible launcher keeps ~22px right /
// ~10px bottom clearance in every state — closed, teaser, open, closing —
// without moving. Stand-ins exercise the real
// watcher (it is not gated on the cId env var), so the asserted
// transforms are the ones production gets. Real-widget verification was
// done manually against production — the circle lives inside a
// cross-origin iframe, so its exact pixels are not inspectable here.

const ANCHOR_RIGHT_PX = 18;
const ANCHOR_BOTTOM_PX = 6;

async function injectLauncher(
  page: Page,
  opts: {
    state?: string;
    width?: number;
    height?: number;
    right?: number;
    bottom?: number;
  } = {}
) {
  const geo = {
    state: opts.state ?? "widgetClose",
    width: opts.width ?? 90,
    height: opts.height ?? 90,
    right: opts.right ?? 43,
    bottom: opts.bottom ?? 43,
  };
  await page.evaluate((g) => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", g.state);
    // Vendor geometry: fixed position, inline right/bottom.
    f.style.cssText =
      `position:fixed;bottom:${g.bottom}px;right:${g.right}px;` +
      `width:${g.width}px;height:${g.height}px;` +
      "border:0;z-index:2147483000;max-width:calc(100% - 86px);";
    document.body.appendChild(f);
  }, geo);
}

async function launcherState(page: Page) {
  return page.evaluate(() => {
    const f = document.querySelector<HTMLIFrameElement>('iframe[title="Webchat Widget"]');
    if (!f) return null;
    const cs = getComputedStyle(f);
    const r = f.getBoundingClientRect();
    return {
      visibility: cs.visibility,
      bottom: +(innerHeight - r.bottom).toFixed(1),
      right: +(innerWidth - r.right).toFixed(1),
      transform: cs.transform,
      clipPath: cs.clipPath,
      state: f.getAttribute("state"),
      launcherOnly: f.hasAttribute("data-launcher-only"),
    };
  });
}

test("homepage: closed launcher hides on hero, appears past it, hides again", async ({ page }) => {
  await hydratedGoto(page, "/");
  // Inject after the observer is established — covers async widget arrival.
  await injectLauncher(page);
  // Poll rather than asserting once: `visibility` is a discrete animated
  // property, so during the no-preference fade the computed value still
  // reports "visible" until the transition completes (WebKit especially).
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");

  // Scroll beyond the hero (the [data-hero] section includes the trust bar).
  const heroBottom = await page.evaluate(
    () => document.querySelector("[data-hero]")!.getBoundingClientRect().bottom + scrollY
  );
  await page.evaluate((y) => window.scrollTo(0, y + 10), heroBottom);
  await expect.poll(() => launcherState(page)).toMatchObject({
    visibility: "visible",
    // Vendor 43px inset minus the watcher's 25px/35px anchor translate =
    // 18px right / 6px bottom of iframe-edge clearance → ~22px/~10px of
    // visible circle clearance, the same anchor every state shares.
    bottom: ANCHOR_BOTTOM_PX,
    right: ANCHOR_RIGHT_PX,
    transform: "matrix(1, 0, 0, 1, 25, 37)",
    launcherOnly: true,
  });

  // Back to the hero — closed launcher hides again.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");
});

test("an open conversation is never forcibly hidden on the hero", async ({ page }) => {
  await hydratedGoto(page, "/");
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-hero-in-view"));
  await injectLauncher(page, { state: "widgetOpen" });
  const s = await launcherState(page);
  expect(s?.visibility).toBe("visible");
  // The open state lands on the same anchor translate — the launcher
  // circle does not move when the panel appears.
  await expect
    .poll(async () => (await launcherState(page))?.transform)
    .toBe("matrix(1, 0, 0, 1, 25, 37)");
});

test("prompt card hides on the hero but is never clipped", async ({ page }) => {
  await hydratedGoto(page, "/");
  // Prompt-visible closed state (issue #184): the vendor grows the same
  // widgetClose iframe to ~330x178 at right/bottom:43px. The watcher
  // leaves it unmarked, so the clip must not apply — but it still shares
  // the anchor translate, and hero suppression still applies (the rule
  // keys off state="widgetClose").
  await injectLauncher(page, { width: 330, height: 178 });
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");
  const s = await launcherState(page);
  expect(s?.launcherOnly).toBe(false);
  expect(s?.clipPath).toBe("none");
  // The prompt's iframe edge lands on the same anchor — the launcher
  // circle keeps its exact position when the teaser appears.
  await expect.poll(async () => {
    const p = await launcherState(page);
    return [p?.bottom, p?.right, p?.transform];
  }).toEqual([ANCHOR_BOTTOM_PX, ANCHOR_RIGHT_PX, "matrix(1, 0, 0, 1, 25, 37)"]);
});

test("the 25px mount transient lands on the same anchor as steady state", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  // Production: the vendor mounts at right/bottom:25px before remote
  // config rewrites it to 43px. The adaptive delta lands both on the
  // same anchor edges.
  await injectLauncher(page, { right: 25, bottom: 25 });
  await expect.poll(() => launcherState(page)).toMatchObject({
    bottom: ANCHOR_BOTTOM_PX,
    right: ANCHOR_RIGHT_PX,
    transform: "matrix(1, 0, 0, 1, 7, 19)",
  });
});

test("a full-bleed mobile open panel keeps vendor geometry", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  // Production (390px portrait): the open panel is viewport-sized at
  // right/bottom:0 — anchoring it would push it offscreen.
  const vp = page.viewportSize()!;
  await injectLauncher(page, {
    state: "widgetOpen",
    width: vp.width,
    height: vp.height,
    right: 0,
    bottom: 0,
  });
  await page.waitForFunction(() => {
    const f = document.querySelector('iframe[title="Webchat Widget"]');
    // Give the watcher a beat to attach+sync; a full-bleed panel must be
    // left alone, so "still untransformed" is the assertion.
    return f !== null;
  });
  await page.waitForTimeout(250);
  const s = await launcherState(page);
  expect(s?.transform).toBe("none");
  expect(s?.bottom).toBe(0);
  expect(s?.right).toBe(0);
});

test("interior pages show the launcher immediately", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  await injectLauncher(page);
  await expect.poll(() => launcherState(page)).toMatchObject({
    visibility: "visible",
    bottom: ANCHOR_BOTTOM_PX,
    right: ANCHOR_RIGHT_PX,
    transform: "matrix(1, 0, 0, 1, 25, 37)",
  });
  // Transforms never create document overflow — pin that here.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("client-side navigation toggles suppression", async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name.startsWith("mobile");
  await hydratedGoto(page, "/diving");
  await injectLauncher(page);
  expect((await launcherState(page))?.visibility).toBe("visible");

  // Navigate home via the header logo link (works on mobile and desktop).
  await page.locator('header a[href="/"]').first().click();
  await page.waitForURL("/");
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");

  // Navigate back to an interior page via primary/mobile nav.
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Diving" }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Diving" }).click();
  }
  await page.waitForURL("/diving");
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("visible");

  // Browser back to the homepage — launcher hides again without reload.
  await page.goBack();
  await page.waitForURL("/");
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");
});
