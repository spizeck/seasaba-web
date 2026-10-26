import type { Page } from "@playwright/test";
import { test, expect, hydratedGoto, waitForStableScroll } from "./fixtures";

// About team-carousel overflow regression (issue #118).
//
// The prev/next controls are absolutely anchored to the carousel edges and
// translated ±20px outward. Below `sm` the content column has only 16px of
// page padding, so both buttons extended 4px past the viewport —
// scrollWidth = clientWidth + 4 at every narrow width. The fix shrinks the
// overhang to 8px below `sm`. These tests assert real geometry and that the
// controls still operate the carousel.
//
// The track prepends a clone of the last page so backward wraps animate
// seamlessly, which shifts every real page one slide to the right: resting
// transforms are -(index + 1) * 100%, never 0% on page 0.

const MOBILE_WIDTHS = [320, 375, 430] as const;
const CAROUSEL = '[aria-label="Team members carousel"]';

// Names on the slide that is flush with the carousel viewport — empty while
// a transition is in flight, which is why callers use expect.poll.
const visibleNames = (page: Page) =>
  page.evaluate((sel) => {
    const region = document.querySelector(sel);
    if (!region) return ["NO CAROUSEL REGION"];
    const bounds = region.getBoundingClientRect();
    const names: string[] = [];
    region.querySelectorAll(":scope > div > div").forEach((slide) => {
      const r = slide.getBoundingClientRect();
      if (r.width > 0 && r.left >= bounds.left - 1 && r.right <= bounds.right + 1)
        slide.querySelectorAll("h3").forEach((h) => names.push(h.textContent ?? ""));
    });
    return names;
  }, CAROUSEL);

// Autoplay advances every 5s, which makes step assertions racy on slow
// engines (WebKit setup alone can outlast the first interval). Clicking the
// first dot lands deterministically on page 0 and pauses autoplay.
async function resetCarousel(page: Page) {
  await page.getByRole("tab", { name: /Go to page 1 of/ }).click();
  await expect
    .poll(() => visibleNames(page), { timeout: 3000 })
    .not.toEqual([]);
}

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
  await resetCarousel(page);

  const track = page.locator(`${CAROUSEL} > .flex`);
  const transform = () => track.evaluate((el) => el.style.transform);
  expect(await transform()).toContain("translateX(-100%)");

  await page.getByRole("button", { name: "Next team members" }).click();
  expect(await transform()).toContain("translateX(-200%)");

  await page.getByRole("button", { name: "Previous team members" }).click();
  expect(await transform()).toContain("translateX(-100%)");

  // Keyboard: focus the region, ArrowRight advances.
  await page.locator(CAROUSEL).focus();
  await page.keyboard.press("ArrowRight");
  expect(await transform()).toContain("translateX(-200%)");
});

test("desktop shows three cards on every page and wraps seamlessly both ways", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetCarousel(page);

  const next = page.getByRole("button", { name: "Next team members" });
  const prev = page.getByRole("button", { name: "Previous team members" });
  const expectNames = (names: string[]) =>
    expect.poll(() => visibleNames(page), { timeout: 3000 }).toEqual(names);

  await expectNames(["Mel", "Jeanine & Marc", "Otto"]);
  await next.click();
  await expectNames(["Aaron", "Lenny", "Robins"]);
  await next.click();
  await expectNames(["Lionel", "Anthony", "Julijana"]);
  // Regression: the last page used to show Gunner alone in an empty grid.
  await next.click();
  await expectNames(["Gunner", "Mel", "Jeanine & Marc"]);
  // Forward wrap: last → first, still three cards.
  await next.click();
  await expectNames(["Mel", "Jeanine & Marc", "Otto"]);
  // Backward wrap: first → last.
  await prev.click();
  await expectNames(["Gunner", "Mel", "Jeanine & Marc"]);
});

test("repeated cycling never reaches a dead end or an empty slot", async ({ page }) => {
  test.setTimeout(90000); // 12 clicked wraps incl. real transitions are slow on WebKit
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetCarousel(page);
  const next = page.getByRole("button", { name: "Next team members" });

  // Three full loops of the four pages — every landing must show 3 cards.
  const PAGES: string[][] = [
    ["Aaron", "Lenny", "Robins"],
    ["Lionel", "Anthony", "Julijana"],
    ["Gunner", "Mel", "Jeanine & Marc"],
    ["Mel", "Jeanine & Marc", "Otto"],
  ];
  for (let i = 0; i < 12; i++) {
    const expected = PAGES[i % PAGES.length];
    await next.click();
    await expect
      .poll(() => visibleNames(page), { timeout: 3000 })
      .toEqual(expected);
  }

  const seen = await visibleNames(page);
  expect(seen).toEqual(["Mel", "Jeanine & Marc", "Otto"]);

  // And backward through the same boundary.
  const prev = page.getByRole("button", { name: "Previous team members" });
  await prev.click();
  await expect
    .poll(() => visibleNames(page), { timeout: 3000 })
    .toEqual(["Gunner", "Mel", "Jeanine & Marc"]);
});

test("tablet shows two cards per page and mobile one, both wrapping", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 768, height: 900 });
  await resetCarousel(page);

  const next = page.getByRole("button", { name: "Next team members" });
  const prev = page.getByRole("button", { name: "Previous team members" });
  const expectNames = (names: string[]) =>
    expect.poll(() => visibleNames(page), { timeout: 3000 }).toEqual(names);

  // Tablet: 2 cards per view → 5 full pages of 10 members.
  await expectNames(["Mel", "Jeanine & Marc"]);
  await prev.click();
  await expectNames(["Julijana", "Gunner"]); // backward wrap to page 5
  await next.click();
  await expectNames(["Mel", "Jeanine & Marc"]);

  // Mobile: 1 card per view → 10 pages; both directions wrap.
  await page.setViewportSize({ width: 375, height: 800 });
  await expectNames(["Mel"]);
  await next.click();
  await expectNames(["Jeanine & Marc"]);
  await prev.click();
  await expectNames(["Mel"]);
  await prev.click();
  await expectNames(["Gunner"]); // backward wrap to page 10
  await next.click();
  await expectNames(["Mel"]);
});

test("pointer swipe advances the carousel and respects the loop", async ({ page, browserName }) => {
  // Mobile WebKit does not dispatch mouse-driven pointer drags; real device
  // swipes arrive as touch pointer events on the same handlers.
  test.skip(browserName === "webkit", "mouse-drag pointer events are Chromium-only");
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetCarousel(page);
  const region = page.locator(CAROUSEL);
  // The carousel sits below the fold; drag coordinates must be measured after
  // the scroll settles or the pointer lands on the document background.
  await region.scrollIntoViewIfNeeded();
  await waitForStableScroll(page);
  const box = await region.boundingBox();
  if (!box) throw new Error("carousel region has no box");
  const y = box.y + box.height / 2;

  // Drag left → next page.
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 120, y, { steps: 6 });
  await page.mouse.up();
  await expect
    .poll(() => visibleNames(page), { timeout: 3000 })
    .toEqual(["Aaron", "Lenny", "Robins"]);

  // Drag right → back.
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, y, { steps: 6 });
  await page.mouse.up();
  await expect
    .poll(() => visibleNames(page), { timeout: 3000 })
    .toEqual(["Mel", "Jeanine & Marc", "Otto"]);
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
