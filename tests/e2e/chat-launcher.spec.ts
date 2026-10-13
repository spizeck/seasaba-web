import type { Page } from "@playwright/test";
import { test, expect, hydratedGoto } from "./fixtures";

// Homepage chat-launcher suppression (#123) and prompt-safety (#184).
//
// The real Respond.io iframe is third-party and asynchronous, so these
// tests inject deterministic stand-ins matching the vendor's contract:
// an iframe titled "Webchat Widget" carrying a `state` attribute
// ("widgetClose" / "widgetOpen") and vendor-owned inline positioning —
// measured on production: inline right/bottom, launcher-only 90x90,
// prompt card ~330x178, desktop open panel ~400x600, edge-to-edge at
// viewport widths <= 600px.
//
// Ownership boundary: no JS in this codebase writes `transform`,
// `right`, or `bottom` on the iframe — inline styles stay byte-for-byte
// as the vendor wrote them. The stylesheet applies exactly one fixed
// visual nudge (`translate(18px, 18px) !important`), skipped for
// `widgetOpen` at <=600px where the vendor goes edge-to-edge. What we
// own is the mechanism — IntersectionObserver toggling
// `data-hero-in-view` on <html>, the CSS rule hiding
// `[state="widgetClose"]` while it is set, and the geometry watcher
// (lib/respond-io.ts) marking launcher-sized iframes `data-launcher-only`
// so the hit-region clip stays off prompt/open states. Real-widget
// verification was done manually against production — the circle lives
// inside a cross-origin iframe, so its exact pixels are not inspectable
// here.

// Vendor inline contract measured on production at 0/0 dashboard
// spacing: right/bottom insets of 25px (the vendor's own base), no
// `!important`, plus an inline transform the way the vendor sets one in
// some builds — kept here to prove the watcher leaves it untouched and
// the stylesheet nudge wins the computed value.
const VENDOR_STYLE =
  "position:fixed;bottom:25px;right:25px;border:0;z-index:2147483000;transform:translate(25px, 37px)";

// Computed transform the stylesheet nudge produces — stylesheet
// !important outranks non-important inline transforms.
const NUDGE_MATRIX = "matrix(1, 0, 0, 1, 18, 18)";

async function injectLauncher(
  page: Page,
  opts: {
    state?: string;
    width?: number;
    height?: number;
    style?: string;
    maxWidth?: string;
  } = {}
) {
  const geo = {
    state: opts.state ?? "widgetClose",
    width: opts.width ?? 90,
    height: opts.height ?? 90,
    style: opts.style ?? VENDOR_STYLE,
    maxWidth: opts.maxWidth ?? "calc(100% - 86px)",
  };
  await page.evaluate((g) => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", g.state);
    f.style.cssText =
      g.style + `;width:${g.width}px;height:${g.height}px;max-width:${g.maxWidth}`;
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
      width: Math.round(r.width),
      height: Math.round(r.height),
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

  // The launcher gets the hit-region clip and the stylesheet's fixed
  // nudge — but its inline styles stay byte-for-byte as the vendor wrote
  // them (JS never touches positioning).
  const s = await launcherState(page);
  expect(s?.clipPath).toBe("inset(25% 0px 0px 25%)");
  expect(s?.transform).toBe(NUDGE_MATRIX);
  expect(s?.inlineTransform).toBe("translate(25px, 37px)");
  expect(s?.inlineRight).toBe("25px");
  expect(s?.inlineBottom).toBe("25px");
  // 25px vendor inset − 18px nudge = 7px visible gap, same as production.
  expect(s?.right).toBe(7);
  expect(s?.bottom).toBe(7);

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
  // The nudge applies to the open panel only above the vendor's 600px
  // full-bleed breakpoint — below it the panel stays edge-to-edge.
  const expectedTransform =
    page.viewportSize()!.width <= 600 ? "none" : NUDGE_MATRIX;
  expect(s?.transform).toBe(expectedTransform);
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
  // The prompt is a widgetClose state, so the fixed nudge applies at
  // every viewport — while the vendor's inline styles stay untouched.
  expect(s?.transform).toBe(NUDGE_MATRIX);
  expect(s?.inlineTransform).toBe("translate(25px, 37px)");
  expect(s?.inlineRight).toBe("25px");
  expect(s?.inlineBottom).toBe("25px");
});

test("the watcher never writes styles onto a vendor iframe with no transform", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  // Some vendor states carry no inline transform at all — JS must add
  // nothing; only the stylesheet's constant nudge shows up computed.
  await injectLauncher(page, {
    style: "position:fixed;bottom:18px;right:18px;border:0;z-index:2147483000",
  });
  await expect.poll(async () => (await launcherState(page))?.launcherOnly).toBe(true);
  const s = await launcherState(page);
  expect(s?.inlineTransform).toBe("");
  expect(s?.inlineRight).toBe("18px");
  expect(s?.inlineBottom).toBe("18px");
  expect(s?.transform).toBe(NUDGE_MATRIX);
  expect(s?.clipPath).toBe("inset(25% 0px 0px 25%)");
});

test("a full-bleed mobile open panel skips the nudge and stays edge-to-edge", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  // Production: the vendor renders the open panel edge-to-edge at
  // viewport widths <= 600px. Pin the viewport so the guard is exercised
  // on every project — a translated full-viewport panel would leave a
  // gap at top/left and bleed 18px off-screen at right/bottom.
  await page.setViewportSize({ width: 390, height: 844 });
  await injectLauncher(page, {
    state: "widgetOpen",
    width: 390,
    height: 844,
    // max-width: unset — a real full-bleed panel, not the 86px-clamped
    // default the other stand-ins use.
    maxWidth: "unset",
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
  expect(s?.transform).toBe("none");
  expect(s?.inlineTransform).toBe("");
  expect(s?.inlineRight).toBe("0px");
  expect(s?.inlineBottom).toBe("0px");
  // Truly viewport-sized: a translated panel would read -18 on the
  // right/bottom gaps or leave a gap at top/left.
  expect(s?.width).toBe(390);
  expect(s?.height).toBe(844);
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
