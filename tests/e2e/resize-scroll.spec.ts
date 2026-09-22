import { test, expect, hydratedGoto, clickNavLink } from "./fixtures";

// Bottom-distance preservation on viewport resize (issue #140).
//
// Browsers preserve the absolute scrollY offset when a responsive reflow makes
// the document taller. Measured on master (production build, Chromium and
// WebKit): a visitor at the footer of /plan-your-trip resizing 1280→768 kept
// scrollY and ended up ~6100px above the bottom (~61% down). The fix restores
// the recorded distance-from-bottom after the resize settles — only for
// visitors inside the footer region — so these assertions are geometric
// (distance-from-bottom, landmark visibility), never pixel-position matches.

type Geo = {
  docH: number;
  y: number;
  vh: number;
  fromBottom: number;
  footerVisible: boolean;
  hOverflow: number;
};

async function measure(page: import("@playwright/test").Page): Promise<Geo> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const docH = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const footer = document.querySelector("footer");
    const fr = footer ? footer.getBoundingClientRect() : null;
    return {
      docH,
      y: window.scrollY,
      vh: window.innerHeight,
      fromBottom: docH - window.scrollY - window.innerHeight,
      footerVisible: !!fr && fr.top < window.innerHeight && fr.bottom > 0,
      hOverflow: doc.scrollWidth - doc.clientWidth,
    };
  });
}

async function scrollToBottom(page: import("@playwright/test").Page) {
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight)
  );
}

// The keeper debounces one correction 150ms after the last resize event;
// 600ms covers settle + correction + the scroll event it fires.
const SETTLE_WAIT = 600;
// Sub-pixel rounding and reflow jitter around the exact restored distance.
const BOTTOM_TOLERANCE = 24;

test.describe("bottom preservation", () => {
  for (const path of ["/plan-your-trip", "/diving"]) {
    test(`footer visitor stays at the bottom when the window narrows (${path})`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!!isMobile, "desktop window-resize scenario");

      await page.setViewportSize({ width: 1280, height: 800 });
      await hydratedGoto(page, path);
      await scrollToBottom(page);
      const before = await measure(page);
      expect(before.fromBottom).toBeLessThanOrEqual(BOTTOM_TOLERANCE);

      // 1280→768 crosses lg/md and reflows grids to taller stacks.
      await page.setViewportSize({ width: 768, height: 800 });
      await page.waitForTimeout(SETTLE_WAIT);
      const after = await measure(page);

      expect(
        after.docH,
        "expected this transition to make the page taller"
      ).toBeGreaterThan(before.docH + 1000);
      expect(after.fromBottom).toBeLessThanOrEqual(BOTTOM_TOLERANCE);
      expect(after.footerVisible).toBe(true);
      expect(after.hOverflow).toBeLessThanOrEqual(0);
    });
  }

  test("a footer-region offset is preserved, not snapped to the very end", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/plan-your-trip");
    await page.evaluate(() =>
      window.scrollTo(
        0,
        document.documentElement.scrollHeight - window.innerHeight - 200
      )
    );
    const before = await measure(page);
    expect(before.fromBottom).toBeGreaterThan(150);

    await page.setViewportSize({ width: 768, height: 800 });
    await page.waitForTimeout(SETTLE_WAIT);
    const after = await measure(page);

    // Same distance from the bottom restored — not 0, not the old scrollY.
    expect(Math.abs(after.fromBottom - before.fromBottom)).toBeLessThanOrEqual(
      BOTTOM_TOLERANCE
    );
  });

  test("widening back keeps the footer visitor at the bottom", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 768, height: 800 });
    await hydratedGoto(page, "/diving");
    await scrollToBottom(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(SETTLE_WAIT);
    const after = await measure(page);

    expect(after.fromBottom).toBeLessThanOrEqual(BOTTOM_TOLERANCE);
    expect(after.footerVisible).toBe(true);
    expect(after.hOverflow).toBeLessThanOrEqual(0);
  });

  test("no correction for a visitor reading mid-page", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/plan-your-trip");
    await page.evaluate(() =>
      window.scrollTo(
        0,
        (document.documentElement.scrollHeight - window.innerHeight) / 2
      )
    );
    const before = await measure(page);

    await page.setViewportSize({ width: 768, height: 800 });
    await page.waitForTimeout(SETTLE_WAIT);
    const after = await measure(page);

    // Not pulled toward the bottom: still far above the footer region, and
    // the scroll offset moved only as much as native reflow/anchoring allows.
    expect(after.fromBottom).toBeGreaterThan(before.fromBottom);
    expect(Math.abs(after.y - before.y)).toBeLessThan(1500);
  });
});

test("no scroll correction fires on initial load", async ({ page }) => {
  await hydratedGoto(page, "/visiting-yachts");
  await page.waitForTimeout(SETTLE_WAIT);
  expect((await measure(page)).y).toBe(0);
});

test("fragment deep links still land on their section", async ({
  page,
  isMobile,
}) => {
  await hydratedGoto(page, "/plan-your-trip#where-to-stay");
  await expect(page.locator("#where-to-stay")).toBeInViewport();

  if (isMobile) return;
  // Resizing while a deep-linked section is on screen must not snap the
  // visitor to the bottom: #where-to-stay sits far above the footer.
  await page.setViewportSize({ width: 768, height: 800 });
  await page.waitForTimeout(SETTLE_WAIT);
  const geo = await measure(page);
  expect(geo.fromBottom).toBeGreaterThan(1500);
});

test("back/forward scroll restoration still works", async ({
  page,
  isMobile,
}) => {
  await hydratedGoto(page, "/diving");
  await page.evaluate(() => window.scrollTo(0, 4000));
  const before = await measure(page);
  expect(before.y).toBeGreaterThan(3000);

  await clickNavLink(page, "Dive Sites", isMobile);
  await expect(
    page.getByRole("heading", { name: /dive sites/i }).first()
  ).toBeVisible();

  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Diving with Sea Saba" })
  ).toBeVisible();
  // Browser restores the prior offset; the keeper never runs (no resize).
  await expect
    .poll(async () => (await measure(page)).y)
    .toBeGreaterThan(3000);
  const restored = await measure(page);
  expect(Math.abs(restored.y - before.y)).toBeLessThan(800);
});
