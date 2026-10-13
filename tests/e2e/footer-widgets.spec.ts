import {
  test,
  expect,
  hydratedGoto,
  scrollToBottomSettled,
} from "./fixtures";

// Footer clearance above the fixed bottom-corner launchers (issue #127).
//
// Real production geometry (measured on www.seasaba.com):
//   Respond.io iframe — launcher-only (90x90), prompt card (~330x178),
//   desktop open panel (~400x600) — carries vendor-owned inline
//   positioning (right/bottom insets, plus an inline transform in some
//   builds), which no JS may rewrite. The stylesheet adds one fixed
//   translate(18px, 18px) nudge toward the corner, so the clipped zone
//   follows wherever the vendor's own box lands. Launcher-only geometry
//   gets marked `data-launcher-only` by the watcher, which applies the
//   hit-region clip -> the clipped zone is the iframe's bottom-right
//   quarter (inset 25% top + left).
//   Cookiebot icon: 48x48 at left:10, bottom:11 -> x:[10,58], y:[vh-59, vh-11].
// These tests use deterministic stand-ins and assert the real UX contract:
// no element inside the clipped zones, every bottom-bar link clickable via
// hit-testing, and no horizontal overflow — not a fixed padding value.

const WIDTHS = [320, 375, 390, 430, 640, 768, 1024, 1280, 1360, 1440] as const;

// Vendor inline contract measured on production at 0/0 dashboard
// spacing — 25px insets, plus an inline transform the way the vendor
// sets one in some builds. The tests assert these styles survive our
// watcher byte-for-byte while the stylesheet nudge wins the computed
// transform.
const VENDOR_STYLE =
  "position:fixed;bottom:25px;right:25px;border:0;z-index:2147483000;transform:translate(25px, 37px)";

async function injectLaunchers(page: import("@playwright/test").Page) {
  await page.evaluate((vendorStyle) => {
    document.querySelector('iframe[title="Webchat Widget"]')?.remove();
    document.querySelector("#CookiebotWidget")?.remove();
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    f.setAttribute("state", "widgetClose");
    // Vendor geometry measured on production; the real geometry watcher
    // (unconditional — not gated on the cId env var) applies only the
    // data-launcher-only marker on top of this inline positioning.
    f.style.cssText = vendorStyle + ";width:90px;height:90px";
    document.body.appendChild(f);
    const c = document.createElement("div");
    c.id = "CookiebotWidget";
    c.style.cssText =
      "position:fixed;left:10px;bottom:11px;width:48px;height:48px;z-index:9999";
    document.body.appendChild(c);
  }, VENDOR_STYLE);
  // Wait until the watcher has attached and applied the marker.
  await page.waitForFunction(() => {
    const f = document.querySelector('iframe[title="Webchat Widget"]');
    return f instanceof HTMLIFrameElement && f.hasAttribute("data-launcher-only");
  });
}

test("footer bottom bar clears both floating launchers at every width", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await injectLaunchers(page);
    await scrollToBottomSettled(page);

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
    // back into an empty slab (zone top ≈ vh-74.5 with the 18px nudge,
    // so >35px would mean ~110px+ of dead space).
    expect(m.gapAboveZone, `${width}px gap above launcher zone`).toBeGreaterThan(4);
    expect(m.gapAboveZone, `${width}px gap above launcher zone`).toBeLessThan(35);
  }
});

// Regression for issue #184: the vendor reuses the closed-state iframe
// for its promotional prompt card. Measured on production the prompt
// iframe is ~178px tall and min(330, vw-86)px wide, carrying the same
// vendor-owned inline positioning — still state="widgetClose" but never
// marked data-launcher-only. A blanket widgetClose clip-path would cut
// off the left quarter of the prompt exactly as reported. The watcher
// must leave both the marker off and every vendor style untouched.
test("prompt-sized closed iframe keeps vendor geometry and is never clipped", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    const promptWidth = Math.min(330, width - 86);
    await page.evaluate(
      ({ pw, vendorStyle }) => {
        document.querySelector('iframe[title="Webchat Widget"]')?.remove();
        const f = document.createElement("iframe");
        f.title = "Webchat Widget";
        f.setAttribute("state", "widgetClose");
        // Prompt-state geometry measured on production, including the
        // vendor's inline transform. The watcher does NOT mark this
        // state — the launcher clip must not apply, and the vendor's
        // inline styles must survive byte-for-byte.
        f.style.cssText =
          vendorStyle + `;width:${pw}px;height:178px;max-width:calc(100% - 86px)`;
        document.body.appendChild(f);
      },
      { pw: promptWidth, vendorStyle: VENDOR_STYLE }
    );
    // Give the watcher a beat to attach — the assertions prove it ran
    // without marking or mutating anything.
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const f = document.querySelector<HTMLIFrameElement>(
        'iframe[title="Webchat Widget"]'
      )!;
      const cs = getComputedStyle(f);
      const r = f.getBoundingClientRect();
      // Hit-test the region the old clip would have hidden: the prompt's
      // top-left quarter must still reach the iframe (real content), not
      // pass through or be blocked.
      const hit = document.elementFromPoint(r.left + 8, r.top + 8);
      return {
        clipPath: cs.clipPath,
        transform: cs.transform,
        launcherOnly: f.hasAttribute("data-launcher-only"),
        inlineTransform: f.style.transform,
        inlineRight: f.style.right,
        inlineBottom: f.style.bottom,
        hitIsIframe: hit === f,
        docOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(m.launcherOnly, `${width}px prompt must stay unmarked`).toBe(false);
    expect(m.clipPath, `${width}px prompt must not be clipped`).toBe("none");
    // The prompt is widgetClose, so the fixed nudge applies at every
    // width — while vendor inline styles stay byte-for-byte untouched.
    expect(m.transform, `${width}px prompt gets the fixed nudge`).toBe(
      "matrix(1, 0, 0, 1, 18, 18)"
    );
    expect(m.inlineTransform, `${width}px vendor transform untouched`).toBe(
      "translate(25px, 37px)"
    );
    expect(m.inlineRight).toBe("25px");
    expect(m.inlineBottom).toBe("25px");
    expect(m.hitIsIframe, `${width}px prompt corner must be clickable`).toBe(true);
    expect(m.docOverflow, `${width}px document overflow`).toBeLessThanOrEqual(0);
  }
});

test("Google Reviews stays clickable above the launcher", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  await page.setViewportSize({ width: 1024, height: 800 });
  await injectLaunchers(page);
  await scrollToBottomSettled(page);
  // Resolves to the link itself only if no overlay (e.g. the chat iframe)
  // intercepts the click point.
  await page.getByRole("link", { name: "Google Reviews" }).click({ trial: true });
});
