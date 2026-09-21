import { test, expect, hydratedGoto } from "./fixtures";

// Footer clearance above the fixed bottom-corner launchers (issue #127).
//
// Real production geometry (measured on www.seasaba.com):
//   Respond.io closed iframe: 90x90, right/bottom:49px, plus our
//     translate(36px, 36px) calibration -> box x:[vw-103, vw-13],
//     y:[vh-103, vh-13]. Its transparent region intercepts pointer events,
//     so globals.css clips the hit area to the bottom-right quarter that
//     holds the ~58px circle -> effective zone x:[vw-80, vw-13],
//     y:[vh-80, vh-13].
//   Cookiebot icon: 48x48 at left:10, bottom:11 -> x:[10,58], y:[vh-59, vh-11].
// These tests use deterministic stand-ins and assert the real UX contract:
// no element inside the clipped zones, every bottom-bar link clickable via
// hit-testing, and no horizontal overflow — not a fixed padding value.

const WIDTHS = [320, 375, 430, 640, 768, 1024, 1280, 1360, 1440] as const;

async function injectLaunchers(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    document.querySelector("#CookiebotWidget")?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", "widgetClose");
    // Vendor geometry measured on production; the site's transform +
    // clip-path rules apply on top of this inline positioning.
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
      // The clip-path shrinks the iframe's hit/visible area to its
      // bottom-right 75% (inset 25% top + 25% left).
      const zone = {
        left: rf.left + rf.width * 0.25,
        top: rf.top + rf.height * 0.25,
        right: rf.right,
        bottom: rf.bottom,
      };
      const overlaps = (r: DOMRect, z: typeof zone) =>
        !(r.right <= z.left || r.left >= z.right || r.bottom <= z.top || r.top >= z.bottom);
      const hits: string[] = [];
      const blocked: string[] = [];
      document
        .querySelectorAll<HTMLElement>("footer .border-t p, footer .border-t a, footer .border-t button")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          const label = el.textContent!.trim().slice(0, 24);
          if (overlaps(r, zone)) hits.push(`respond:${label}`);
          if (overlaps(r, { left: cb.left, top: cb.top, right: cb.right, bottom: cb.bottom }))
            hits.push(`cookiebot:${label}`);
          // Real hit-test: a click at the element's center must reach it,
          // not the launcher iframe.
          const hit = document.elementFromPoint(
            r.left + r.width / 2,
            r.top + r.height / 2
          );
          if (hit instanceof HTMLIFrameElement) blocked.push(label);
        });
      const bar = document.querySelector("footer .border-t")!.getBoundingClientRect();
      return {
        hits,
        blocked,
        gapAboveZone: +(zone.top - bar.bottom).toFixed(1),
        docOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(m.docOverflow, `${width}px document overflow`).toBeLessThanOrEqual(0);
    expect(m.hits, `${width}px content inside launcher zones`).toEqual([]);
    expect(m.blocked, `${width}px links intercepted by iframe`).toEqual([]);
    // Positive breathing room between the last content row and the
    // clipped launcher zone — but bounded so padding can't silently grow
    // back into an empty slab (zone top ≈ vh-80, so >35px would mean
    // ~115px+ of dead space).
    expect(m.gapAboveZone, `${width}px gap above launcher zone`).toBeGreaterThan(4);
    expect(m.gapAboveZone, `${width}px gap above launcher zone`).toBeLessThan(35);
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
