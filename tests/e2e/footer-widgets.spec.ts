import { test, expect, hydratedGoto } from "./fixtures";

// Footer clearance above the fixed bottom-corner launchers (issue #127).
//
// Real production geometry (measured on www.seasaba.com):
//   Respond.io closed iframe: 90x90, right/bottom:49px, plus our
//     translate(36px, 36px) calibration -> box occupies x:[vw-103, vw-13],
//     y:[vh-103, vh-13]. Its transparent padding still intercepts clicks.
//   Cookiebot icon: 48x48 at left:10, bottom:11 -> x:[10,58], y:[vh-59, vh-11].
// The footer container's bottom padding keeps the copyright/link bar above
// both zones; these tests assert that with deterministic stand-ins and real
// bounding boxes rather than screenshots.

const WIDTHS = [320, 375, 430, 768, 1024, 1280, 1440] as const;

async function injectLaunchers(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", "widgetClose");
    // Vendor geometry measured on production; the site's transform rule
    // applies the calibration on top of this inline positioning.
    f.style.cssText =
      "position:fixed;bottom:49px;right:49px;width:90px;height:90px;border:0;z-index:9999";
    document.body.appendChild(f);
    const c = document.createElement("div");
    c.id = "CookiebotWidget";
    c.style.cssText =
      "position:fixed;left:10px;bottom:11px;width:48px;height:48px;z-index:9999";
    document.body.appendChild(c);
  });
}

test("footer bottom bar clears both floating launchers at every width", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await injectLaunchers(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const m = await page.evaluate(() => {
      const rf = document
        .querySelector('iframe[title="Webchat Widget"]')!
        .getBoundingClientRect();
      const cb = document
        .querySelector("#CookiebotWidget")!
        .getBoundingClientRect();
      const overlaps = (r: DOMRect, z: DOMRect) =>
        !(r.right <= z.left || r.left >= z.right || r.bottom <= z.top || r.top >= z.bottom);
      const hits: string[] = [];
      document
        .querySelectorAll<HTMLElement>("footer p, footer a, footer button")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          const label = el.textContent!.trim().slice(0, 24);
          if (overlaps(r, rf)) hits.push(`respond:${label}`);
          if (overlaps(r, cb)) hits.push(`cookiebot:${label}`);
        });
      const bar = document.querySelector("footer .border-t")!.getBoundingClientRect();
      const reviews = [...document.querySelectorAll<HTMLElement>("footer a")].find(
        (a) => a.textContent!.trim() === "Google Reviews"
      )!;
      return {
        hits,
        barClearance: +(innerHeight - bar.bottom).toFixed(1),
        reviewsVisible: reviews.getBoundingClientRect().bottom <= rf.top,
        docOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(m.docOverflow, `${width}px document overflow`).toBeLessThanOrEqual(0);
    expect(m.hits, `${width}px launcher collisions`).toEqual([]);
    // Content clears the 103px-deep Respond.io zone, not just the bubble.
    expect(m.barClearance, `${width}px clearance`).toBeGreaterThanOrEqual(104);
    expect(m.reviewsVisible, `${width}px Google Reviews covered`).toBe(true);
  }
});

test("Google Reviews stays clickable above the launcher", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  await page.setViewportSize({ width: 1024, height: 800 });
  await injectLaunchers(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // Resolves to the link itself only if no overlay (e.g. the chat iframe)
  // intercepts the click point.
  await page.getByRole("link", { name: "Google Reviews" }).click({ trial: true });
});
