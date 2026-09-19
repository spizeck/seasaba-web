import { test, expect, hydratedGoto } from "./fixtures";

// PageHero narrow-viewport clipping regression (issue #117).
//
// The hero shell previously used `aspect-[4/3] min-h-[320px]` with an auto
// width. Below ~427px viewports the min-height clamp transferred through the
// aspect ratio and inflated the shell to ~427px wide, so the centered
// title/subtitle laid out in that oversized shell clipped at the screen edge.
//
// These tests measure real layout — shell/title/subtitle bounding boxes — at
// the widths where the defect was observed, rather than asserting on class
// names. They run on every project because the check is cheap and WebKit
// implements the same aspect-ratio constraint transfer.

const WIDTHS = [320, 375, 430] as const;

// Representative routes chosen for content length and prior defect evidence.
const HERO_ROUTES = [
  { path: "/courses", name: "courses" }, // longest title + subtitle
  { path: "/diving", name: "diving" }, // clipping observed in the font audit
  { path: "/visiting-yachts", name: "visiting yachts" },
];

function heroGeometry() {
  const h1 = document.querySelector("main h1");
  if (!h1) return { error: "no h1 inside main" } as const;
  const subtitle = h1.parentElement?.querySelector("p") ?? null;
  // The aspect-ratio shell is the nearest ancestor with a non-auto computed
  // ratio — robust to class-name churn in the component.
  let shell: Element | null = h1;
  while (shell && getComputedStyle(shell).aspectRatio === "auto") shell = shell.parentElement;
  if (!shell) return { error: "no aspect-ratio shell" } as const;
  const s = shell.getBoundingClientRect();
  const h = h1.getBoundingClientRect();
  const p = subtitle?.getBoundingClientRect() ?? null;
  return {
    shellWidth: s.width,
    shellHeight: s.height,
    h1Left: h.left,
    h1Right: h.right,
    subLeft: p ? p.left : 0,
    subRight: p ? p.right : 0,
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

for (const route of HERO_ROUTES) {
  test(`PageHero fits the viewport on ${route.name} at narrow widths`, async ({ page }) => {
    await hydratedGoto(page, route.path);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const g = await page.evaluate(heroGeometry);
      expect(g, `${route.path} @ ${width}px: ${JSON.stringify(g)}`).not.toHaveProperty("error");
      if ("error" in g) continue;

      // The shell must not exceed the viewport it claims to span.
      expect(g.shellWidth).toBeLessThanOrEqual(width + 0.5);
      // Title and subtitle must stay inside the visible viewport.
      expect(g.h1Left).toBeGreaterThanOrEqual(-0.5);
      expect(g.h1Right).toBeLessThanOrEqual(width + 0.5);
      expect(g.subRight).toBeLessThanOrEqual(width + 0.5);
      // Minimum visual presence is preserved; outer wrapper caps at 640px.
      expect(g.shellHeight).toBeGreaterThanOrEqual(320);
      expect(g.shellHeight).toBeLessThanOrEqual(640);
      // These routes must not scroll horizontally. /about is excluded here —
      // its residual ~4px overflow is the carousel arrow tracked in #118.
      expect(g.docOverflow).toBeLessThanOrEqual(0);
    }
  });
}

test("PageHero on /about keeps title and subtitle inside the viewport at narrow widths", async ({ page }) => {
  await hydratedGoto(page, "/about");
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    const g = await page.evaluate(heroGeometry);
    if ("error" in g) throw new Error(g.error);
    expect(g.shellWidth).toBeLessThanOrEqual(width + 0.5);
    expect(g.h1Right).toBeLessThanOrEqual(width + 0.5);
    expect(g.subRight).toBeLessThanOrEqual(width + 0.5);
  }
});
