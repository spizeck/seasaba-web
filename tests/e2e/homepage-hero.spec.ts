import { test, expect, hydratedGoto } from "./fixtures";

// Homepage hero first-screen composition regression (issue #120).
//
// The hero previously sized itself with min-h-screen (100vh), which mobile
// browsers resolve against the chrome-collapsed viewport — the bottom-
// anchored trust bar sat below the visible first screen — and stacked all
// three CTAs vertically, consuming ~156px. These tests measure real
// geometry at the widths where the defect was reported.

const MOBILE_WIDTHS = [320, 375, 430] as const;

function heroGeometry() {
  const hero = document.querySelector("main section");
  if (!hero) return { error: "no hero section" } as const;
  const h1 = hero.querySelector("h1");
  const lede = h1?.parentElement?.querySelector("p") ?? null;
  const ctas = [...hero.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')].map((a) => {
    const r = a.getBoundingClientRect();
    return { label: a.textContent?.trim() ?? "", top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
  });
  const trustBar = hero.querySelector("div.grid.grid-cols-3")?.closest("div.relative") ?? null;
  const trustRect = trustBar?.getBoundingClientRect() ?? null;
  const heroRect = hero.getBoundingClientRect();
  const doc = document.documentElement;
  return {
    heroBottom: heroRect.bottom,
    heroMinHeight: (hero as HTMLElement).style.minHeight,
    h1: h1 ? { top: h1.getBoundingClientRect().top, bottom: h1.getBoundingClientRect().bottom } : null,
    ledeBottom: lede ? lede.getBoundingClientRect().bottom : null,
    ctas,
    trustTop: trustRect?.top ?? null,
    trustBottom: trustRect?.bottom ?? null,
    viewport: innerHeight,
    docOverflow: doc.scrollWidth - doc.clientWidth,
  };
}

test("homepage hero fits the first screen at mobile widths", async ({ page }) => {
  await hydratedGoto(page, "/");
  for (const width of MOBILE_WIDTHS) {
    await page.setViewportSize({ width, height: 700 });
    const g = await page.evaluate(heroGeometry);
    expect(g, `homepage @ ${width}px: ${JSON.stringify(g)}`).not.toHaveProperty("error");
    if ("error" in g) continue;

    // The hero must size to the small viewport unit so the trust bar stays
    // on the first screen while mobile browser chrome is shown. The hero
    // runs ~2px past the viewport edge (pre-existing -mt-16/border overage,
    // unchanged by this fix) — allow 3px.
    expect(g.heroMinHeight).toBe("100svh");
    expect(g.heroBottom).toBeLessThanOrEqual(g.viewport + 3);

    // Title, lede and all three CTAs fully inside the viewport.
    expect(g.h1?.top).toBeGreaterThanOrEqual(0);
    expect(g.ledeBottom).toBeLessThanOrEqual(g.viewport + 0.5);
    expect(g.ctas.map((c) => c.label)).toEqual(["Book Diving", "Plan Your Trip", "Explore Dive Sites"]);
    for (const cta of g.ctas) {
      expect(cta.top).toBeGreaterThanOrEqual(0);
      expect(cta.bottom).toBeLessThanOrEqual(g.viewport + 0.5);
      expect(cta.left).toBeGreaterThanOrEqual(-0.5);
      expect(cta.right).toBeLessThanOrEqual(width + 0.5);
      // Touch target: all CTAs keep a ~44px height.
      expect(cta.height).toBeGreaterThanOrEqual(43);
    }

    // Compact secondary actions: the two secondary CTAs share one row.
    expect(g.ctas[1].top).toBeCloseTo(g.ctas[2].top, 0);

    // Trust bar is visible on the first screen, anchored to the hero bottom,
    // and does not overlap the CTA cluster.
    expect(g.trustTop).not.toBeNull();
    expect(g.trustTop!).toBeLessThan(g.viewport);
    expect(g.trustBottom!).toBeLessThanOrEqual(g.viewport + 3);
    expect(Math.max(...g.ctas.map((c) => c.bottom))).toBeLessThanOrEqual(g.trustTop! + 0.5);

    expect(g.docOverflow).toBeLessThanOrEqual(0);
  }
});

test("homepage hero preserves the desktop layout", async ({ page }) => {
  await hydratedGoto(page, "/");
  await page.setViewportSize({ width: 1440, height: 900 });
  const g = await page.evaluate(heroGeometry);
  if ("error" in g) throw new Error(g.error);

  // All three CTAs share one row on desktop, trust bar fills the hero bottom.
  expect(g.ctas[0].top).toBeCloseTo(g.ctas[1].top, 0);
  expect(g.ctas[1].top).toBeCloseTo(g.ctas[2].top, 0);
  expect(g.trustTop).toBeLessThan(g.viewport);
  expect(g.trustBottom).toBeLessThanOrEqual(g.viewport + 3);
  expect(g.docOverflow).toBeLessThanOrEqual(0);
});
