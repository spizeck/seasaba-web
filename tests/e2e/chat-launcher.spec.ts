import type { Page } from "@playwright/test";
import { test, expect, hydratedGoto } from "./fixtures";

// Homepage chat-launcher suppression (#123), fixed launcher anchor
// (#125 calibration, reworked), and prompt-safety (#184).
//
// The real Respond.io iframe is third-party and asynchronous, so these
// tests inject deterministic stand-ins matching the vendor's contract: an
// iframe titled "Webchat Widget" carrying a `state` attribute
// ("widgetClose" / "widgetOpen"), the vendor's fixed bottom-right
// geometry, and — for the launcher-only state — the `data-launcher-only`
// marker the component's geometry watcher sets on a 90x90 closed iframe
// (measured on production: launcher 90x90 at right/bottom:49px; prompt
// card inflates the same widgetClose iframe to ~330x179 at
// right/bottom:43px). What we own is the mechanism —
// IntersectionObserver toggling `data-hero-in-view` on <html>, the CSS
// rule hiding `[state="widgetClose"]` while it is set, and the 6px
// anchor-alignment translate scoped to `data-launcher-only` — and that is
// what these assertions exercise. The translate lands the closed
// launcher's edge on the same 43px inset the prompt and open states use,
// so the launcher circle keeps one fixed screen position in every state.
// The visible bubble sits inset inside the iframe, so iframe-box
// clearance (43px) intentionally differs from visible-bubble clearance
// (~47-48px). Real-widget verification was done manually against
// production.

async function injectLauncher(page: Page, state = "widgetClose") {
  await page.evaluate((s) => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", s);
    // The watcher marks only launcher-sized widgetClose iframes; the open
    // panel is never marked.
    if (s === "widgetClose") f.setAttribute("data-launcher-only", "");
    // Vendor geometry measured on production: fixed, 90x90,
    // bottom/right 49px.
    f.style.cssText =
      "position:fixed;bottom:49px;right:49px;width:90px;height:90px;border:0;z-index:9999";
    document.body.appendChild(f);
  }, state);
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
    // Vendor 49px offset minus the 6px anchor translate = 43px of
    // iframe-box clearance — the same inset the prompt state uses, so the
    // launcher circle stays put when the teaser appears.
    bottom: 43,
    right: 43,
    transform: "matrix(1, 0, 0, 1, 6, 6)",
  });

  // Back to the hero — closed launcher hides again.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");
});

test("an open conversation is never forcibly hidden on the hero", async ({ page }) => {
  await hydratedGoto(page, "/");
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-hero-in-view"));
  await injectLauncher(page, "widgetOpen");
  const s = await launcherState(page);
  expect(s?.visibility).toBe("visible");
  // The anchor translate is scoped to data-launcher-only — the open
  // conversation is never repositioned.
  expect(s?.transform).toBe("none");
});

test("prompt card hides on the hero but is never clipped or repositioned", async ({ page }) => {
  await hydratedGoto(page, "/");
  // Prompt-visible closed state (issue #184): the vendor grows the same
  // widgetClose iframe to ~330x179 at right/bottom:43px. The watcher
  // leaves it unmarked, so clip/translate must not apply — but hero
  // suppression still does (the rule keys off state="widgetClose").
  await page.evaluate(() => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", "widgetClose");
    f.style.cssText =
      "position:fixed;bottom:43px;right:43px;width:330px;height:179px;border:0;z-index:9999";
    document.body.appendChild(f);
  });
  await expect.poll(async () => (await launcherState(page))?.visibility).toBe("hidden");
  const s = await launcherState(page);
  expect(s?.transform).toBe("none");
  expect(s?.clipPath).toBe("none");
  // The prompt's iframe edge pins the shared 43px anchor — the same
  // effective inset the marked launcher-only state lands on.
  expect(s?.bottom).toBe(43);
  expect(s?.right).toBe(43);
});

test("interior pages show the launcher immediately", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  await injectLauncher(page);
  const s = await launcherState(page);
  expect(s?.visibility).toBe("visible");
  expect(s?.bottom).toBe(43);
  expect(s?.right).toBe(43);
  expect(s?.transform).toBe("matrix(1, 0, 0, 1, 6, 6)");
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
