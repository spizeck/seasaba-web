import type { Page } from "@playwright/test";
import { test, expect, hydratedGoto } from "./fixtures";

// Homepage chat-launcher suppression (#123) and prompt-safety (#184).
//
// The real Respond.io iframe is third-party and asynchronous, so these
// tests inject deterministic stand-ins matching the vendor's contract:
// an iframe titled "Webchat Widget" carrying a `state` attribute
// ("widgetClose" / "widgetOpen") and vendor-owned inline positioning —
// measured on production: inline right/bottom plus an inline transform,
// launcher-only 90x90, prompt card ~330x178, desktop open panel
// ~400x600, full-bleed on small viewports.
//
// Positioning is entirely vendor-owned (dashboard alignment/spacing):
// nothing in this codebase may write `transform`, `right`, or `bottom`
// on the iframe. What we own is the mechanism — IntersectionObserver
// toggling `data-hero-in-view` on <html>, the CSS rule hiding
// `[state="widgetClose"]` while it is set, and the geometry watcher
// (lib/respond-io.ts) marking launcher-sized iframes `data-launcher-only`
// so the hit-region clip stays off prompt/open states. Stand-ins carry
// real vendor inline styles so the assertions prove we never mutate
// them. Real-widget verification was done manually against production —
// the circle lives inside a cross-origin iframe, so its exact pixels are
// not inspectable here.

const VENDOR_STYLE =
  "position:fixed;bottom:43px;right:43px;border:0;z-index:2147483000;transform:translate(25px, 37px)";

async function injectLauncher(
  page: Page,
  opts: {
    state?: string;
    width?: number;
    height?: number;
    style?: string;
  } = {}
) {
  const geo = {
    state: opts.state ?? "widgetClose",
    width: opts.width ?? 90,
    height: opts.height ?? 90,
    style: opts.style ?? VENDOR_STYLE,
  };
  await page.evaluate((g) => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", g.state);
    f.style.cssText =
      g.style + `;width:${g.width}px;height:${g.height}px;max-width:calc(100% - 86px)`;
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
      inlineTransform: f.style.transform,
      inlineRight: f.style.right,
      inlineBottom: f.style.bottom,
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
    launcherOnly: true,
  });

  // The launcher gets the hit-region clip — and nothing else: vendor
  // inline positioning is byte-for-byte untouched.
  const s = await launcherState(page);
  expect(s?.clipPath).toBe("inset(25% 0px 0px 25%)");
  expect(s?.inlineTransform).toBe("translate(25px, 37px)");
  expect(s?.inlineRight).toBe("43px");
  expect(s?.inlineBottom).toBe("43px");

  // Back to the hero — closed launcher hides again.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");
});

test("an open conversation is never forcibly hidden on the hero", async ({ page }) => {
  await hydratedGoto(page, "/");
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-hero-in-view"));
  await injectLauncher(page, { state: "widgetOpen", width: 400, height: 600 });
  const s = await launcherState(page);
  expect(s?.visibility).toBe("visible");
  // Open panel is never marked or clipped, and vendor styles stay intact.
  expect(s?.launcherOnly).toBe(false);
  expect(s?.clipPath).toBe("none");
  expect(s?.inlineTransform).toBe("translate(25px, 37px)");
});

test("prompt card hides on the hero but is never clipped", async ({ page }) => {
  await hydratedGoto(page, "/");
  // Prompt-visible closed state (issue #184): the vendor grows the same
  // widgetClose iframe to ~330x178. The watcher leaves it unmarked, so
  // the launcher clip must not apply — but hero suppression still does
  // (the rule keys off state="widgetClose").
  await injectLauncher(page, { width: 330, height: 178 });
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");
  const s = await launcherState(page);
  expect(s?.launcherOnly).toBe(false);
  expect(s?.clipPath).toBe("none");
  // Vendor positioning untouched — including the vendor's own transform.
  expect(s?.inlineTransform).toBe("translate(25px, 37px)");
  expect(s?.inlineRight).toBe("43px");
  expect(s?.inlineBottom).toBe("43px");
});

test("the watcher never writes styles onto a vendor iframe with no transform", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  // Some vendor states may carry no inline transform at all — the
  // watcher must add nothing.
  await injectLauncher(page, {
    style: "position:fixed;bottom:18px;right:18px;border:0;z-index:2147483000",
  });
  await expect.poll(async () => (await launcherState(page))?.launcherOnly).toBe(true);
  const s = await launcherState(page);
  expect(s?.inlineTransform).toBe("");
  expect(s?.inlineRight).toBe("18px");
  expect(s?.inlineBottom).toBe("18px");
  expect(s?.clipPath).toBe("inset(25% 0px 0px 25%)");
});

test("a full-bleed mobile open panel keeps vendor geometry", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  // Production (390px portrait): the open panel is viewport-sized at
  // right/bottom:0 — nothing may reposition it.
  const vp = page.viewportSize()!;
  await injectLauncher(page, {
    state: "widgetOpen",
    width: vp.width,
    height: vp.height,
    style: "position:fixed;bottom:0;right:0;border:0;z-index:2147483000",
  });
  await page.waitForFunction(() => {
    const f = document.querySelector('iframe[title="Webchat Widget"]');
    return f !== null;
  });
  await page.waitForTimeout(250);
  const s = await launcherState(page);
  expect(s?.launcherOnly).toBe(false);
  expect(s?.clipPath).toBe("none");
  expect(s?.inlineTransform).toBe("");
  expect(s?.inlineRight).toBe("0px");
  expect(s?.inlineBottom).toBe("0px");
  expect(s?.bottom).toBe(0);
  expect(s?.right).toBe(0);
});

test("interior pages show the launcher immediately", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  await injectLauncher(page);
  await expect.poll(() => launcherState(page)).toMatchObject({
    visibility: "visible",
    launcherOnly: true,
  });
  // No horizontal overflow from the vendor iframe either way.
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
