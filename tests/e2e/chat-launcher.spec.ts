import type { Page } from "@playwright/test";
import { test, expect, hydratedGoto } from "./fixtures";

// Homepage chat-launcher suppression (issue #123).
//
// The real Respond.io iframe is third-party and asynchronous, so these tests
// inject a deterministic stand-in matching the vendor's contract: an iframe
// titled "Webchat Widget" carrying a `state` attribute ("widgetClose" /
// "widgetOpen") and the vendor's fixed bottom-right geometry. What we own is
// the mechanism — IntersectionObserver toggling `data-hero-in-view` on
// <html>, plus the CSS rule hiding `[state="widgetClose"]` while it is set —
// and that is what these assertions exercise. Real-widget verification was
// done manually against a production build.

async function injectLauncher(page: Page, state = "widgetClose") {
  await page.evaluate((s) => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", s);
    // Vendor geometry: fixed, 90x90, bottom/right 25px.
    f.style.cssText =
      "position:fixed;bottom:25px;right:25px;width:90px;height:90px;border:0;z-index:9999";
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
    bottom: 25,
    right: 25,
    transform: "none", // the old -60px mobile lift is gone
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
});

test("interior pages show the launcher immediately", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  await injectLauncher(page);
  const s = await launcherState(page);
  expect(s?.visibility).toBe("visible");
  expect(s?.bottom).toBe(25);
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
