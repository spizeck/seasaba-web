import { test, expect, hydratedGoto } from "./fixtures";

// About team-carousel overflow regression (issue #118).
//
// The prev/next controls are absolutely anchored to the carousel edges and
// translated ±20px outward. Below `sm` the content column has only 16px of
// page padding, so both buttons extended 4px past the viewport —
// scrollWidth = clientWidth + 4 at every narrow width. The fix shrinks the
// overhang to 8px below `sm`. These tests assert real geometry and that the
// controls still operate the carousel.

const MOBILE_WIDTHS = [320, 375, 430] as const;

test("/about has no horizontal overflow and carousel controls stay inside the viewport", async ({ page }) => {
  await hydratedGoto(page, "/about");
  for (const width of MOBILE_WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    const g = await page.evaluate(() => {
      const doc = document.documentElement;
      const prev = document.querySelector('button[aria-label="Previous team members"]');
      const next = document.querySelector('button[aria-label="Next team members"]');
      if (!prev || !next) return { error: "carousel controls not found" } as const;
      const p = prev.getBoundingClientRect();
      const n = next.getBoundingClientRect();
      const unclipped: string[] = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || (r.right <= innerWidth + 0.5 && r.left >= -0.5)) return;
        let anc = el.parentElement;
        let clipped = false;
        while (anc) {
          const ox = getComputedStyle(anc).overflowX;
          if (ox === "hidden" || ox === "clip") { clipped = true; break; }
          anc = anc.parentElement;
        }
        if (!clipped)
          unclipped.push(
            `${el.tagName} aria="${el.getAttribute("aria-label")}" .${String(el.className).split(" ").filter(Boolean).slice(0, 5).join(".")} L${r.left.toFixed(1)} R${r.right.toFixed(1)}`
          );
      });
      return { docOverflow: doc.scrollWidth - doc.clientWidth, prev: p, next: n, unclipped };
    });
    expect(g, `/about @ ${width}px: ${JSON.stringify(g)}`).not.toHaveProperty("error");
    if ("error" in g) continue;

    expect(g.docOverflow, `unclipped offenders: ${JSON.stringify((g as { unclipped?: string[] }).unclipped)}`).toBeLessThanOrEqual(0);
    // Both controls fully inside the viewport, still overlapping the track edge.
    for (const btn of [g.prev, g.next]) {
      expect(btn.left).toBeGreaterThanOrEqual(0);
      expect(btn.right).toBeLessThanOrEqual(width);
    }
    // Touch targets unchanged: 36px circles.
    expect(g.prev.width).toBeGreaterThanOrEqual(35);
    expect(g.next.width).toBeGreaterThanOrEqual(35);
  }
});

test("team carousel controls navigate and respond to the keyboard", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 375, height: 800 });

  const track = page.locator('[aria-label="Team members carousel"] > .flex');
  const transform = () => track.evaluate((el) => el.style.transform);
  expect(await transform()).toContain("translateX(0%)");

  await page.getByRole("button", { name: "Next team members" }).click();
  expect(await transform()).toContain("translateX(-100%)");

  await page.getByRole("button", { name: "Previous team members" }).click();
  expect(await transform()).toContain("translateX(0%)");

  // Keyboard: focus the region, ArrowRight advances.
  await page.locator('[aria-label="Team members carousel"]').focus();
  await page.keyboard.press("ArrowRight");
  expect(await transform()).toContain("translateX(-100%)");
});

test("team carousel controls keep their desktop overhang", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  const g = await page.evaluate(() => {
    const prev = document.querySelector('button[aria-label="Previous team members"]')!.getBoundingClientRect();
    const next = document.querySelector('button[aria-label="Next team members"]')!.getBoundingClientRect();
    const track = document.querySelector('[aria-label="Team members carousel"]')!.getBoundingClientRect();
    return { prevRightOverhang: prev.left - track.left, nextRightOverhang: next.right - track.right };
  });
  // ±20px outward overhang preserved at >=sm (buttons anchored at edge, shifted out).
  expect(g.prevRightOverhang).toBeCloseTo(-20, 0);
  expect(g.nextRightOverhang).toBeCloseTo(20, 0);
});
