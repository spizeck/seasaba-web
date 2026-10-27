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
// The carousel moves one card per click on an infinite strip: the member
// list renders three times and the middle copy is the "real" strip, so a
// wrap transition animates onto cloned slides that are pixel-identical to
// the real position before snapping home invisibly.

const MOBILE_WIDTHS = [320, 375, 430] as const;
const CAROUSEL = '[aria-label="Team members carousel"]';
const MEMBERS = [
  "Mel",
  "Jeanine & Marc",
  "Otto",
  "Aaron",
  "Lenny",
  "Robins",
  "Lionel",
  "Anthony",
  "Julijana",
  "Gunner",
];

// Window of `count` crew names starting at a position on the circular strip.
const windowAt = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) => MEMBERS[(start + i) % MEMBERS.length]);

// Names on the cards that sit fully inside the carousel viewport — empty or
// partial while a transition is in flight, which is why callers use
// expect.poll. The card (not the slide) is measured: slides carry the gap
// padding and legitimately overhang the viewport edges by half a gap.
const visibleNames = (page: Page) =>
  page.evaluate((sel) => {
    const region = document.querySelector(sel);
    if (!region) return ["NO CAROUSEL REGION"];
    const bounds = region.getBoundingClientRect();
    const names: string[] = [];
    region.querySelectorAll(":scope > div > div").forEach((slide) => {
      const card = slide.firstElementChild ?? slide;
      const r = card.getBoundingClientRect();
      if (r.width > 0 && r.left >= bounds.left - 1 && r.right <= bounds.right + 1)
        card.querySelectorAll("h3").forEach((h) => names.push(h.textContent ?? ""));
    });
    return names;
  }, CAROUSEL);

// Cards at least partially overlapping the viewport — used to prove no blank
// space ever appears mid-transition.
const overlappingCards = (page: Page) =>
  page.evaluate((sel) => {
    const region = document.querySelector(sel);
    if (!region) return -1;
    const bounds = region.getBoundingClientRect();
    let count = 0;
    region.querySelectorAll(":scope > div > div").forEach((slide) => {
      const card = slide.firstElementChild ?? slide;
      const r = card.getBoundingClientRect();
      if (r.right > bounds.left + 1 && r.left < bounds.right - 1) count++;
    });
    return count;
  }, CAROUSEL);

// Samples card coverage across a whole transition (~300ms) and asserts the
// viewport never exposes blank space past the rendered strip.
async function expectCoverageThroughTransition(page: Page, minCards: number) {
  for (let i = 0; i < 8; i++) {
    expect(await overlappingCards(page)).toBeGreaterThanOrEqual(minCards);
    await page.waitForTimeout(60);
  }
}

// Deterministic reset to the first position (index 0) before stepping. The
// carousel is parked mid-viewport first: the dot click scrolls it to the
// bottom edge, which can leave the arrow controls under the sticky header
// where WebKit's actionability check refuses to click.
async function resetCarousel(page: Page) {
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollIntoView({ block: "center" });
  }, CAROUSEL);
  await waitForStableScroll(page);
  await page.getByRole("button", { name: "Go to Mel" }).click();
  await expect
    .poll(() => visibleNames(page), { timeout: 3000 })
    .not.toEqual([]);
}

const next = (page: Page) =>
  page.getByRole("button", { name: "Next team members" });
const prev = (page: Page) =>
  page.getByRole("button", { name: "Previous team members" });
const expectNames = (page: Page, names: string[]) =>
  expect.poll(() => visibleNames(page), { timeout: 3000 }).toEqual(names);

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
  // Mobile shows one card; index 0 rests at -(10 * 100%) on the tripled strip.
  expect(await transform()).toContain("translateX(-1000%)");

  await next(page).click();
  expect(await transform()).toContain("translateX(-1100%)");

  await prev(page).click();
  expect(await transform()).toContain("translateX(-1000%)");

  // Keyboard: focus the region, ArrowRight advances exactly one card.
  await page.locator(CAROUSEL).focus();
  await page.keyboard.press("ArrowRight");
  expect(await transform()).toContain("translateX(-1100%)");
});

test("desktop shows three cards and advances exactly one card per click", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetCarousel(page);

  await expectNames(page, ["Mel", "Jeanine & Marc", "Otto"]);
  await next(page).click();
  await expectNames(page, ["Jeanine & Marc", "Otto", "Aaron"]);
  await next(page).click();
  await expectNames(page, ["Otto", "Aaron", "Lenny"]);
  await prev(page).click();
  await expectNames(page, ["Jeanine & Marc", "Otto", "Aaron"]);
});

test("desktop wraps seamlessly in both directions", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetCarousel(page);

  // Walk to the last position one card at a time: the window slides by one
  // member per click and the tail re-enters from the start of the list.
  await page.getByRole("button", { name: "Go to Julijana" }).click();
  await expectNames(page, ["Julijana", "Gunner", "Mel"]);
  await next(page).click();
  await expectNames(page, ["Gunner", "Mel", "Jeanine & Marc"]); // last position
  // Forward wrap: after the transition the first position is back, still full.
  await next(page).click();
  await expectCoverageThroughTransition(page, 3);
  await expectNames(page, ["Mel", "Jeanine & Marc", "Otto"]);
  // Backward wrap: first → last position, same seamlessness.
  await prev(page).click();
  await expectNames(page, ["Gunner", "Mel", "Jeanine & Marc"]);
});

test("repeated cycling never reaches a dead end or an empty slot", async ({ page }) => {
  test.setTimeout(90000); // 20 clicked steps incl. real transitions are slow on WebKit
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetCarousel(page);

  // Two full loops of ten positions — every landing must show 3 cards in
  // source order, including across the wrap boundary.
  for (let i = 1; i <= 20; i++) {
    await next(page).click();
    await expectNames(page, windowAt(i, 3));
  }

  // And backward through the same boundary.
  await prev(page).click();
  await expectNames(page, windowAt(9, 3));
});

test("rapid clicks and direction reversals stay on real cards", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetCarousel(page);

  // Four presses inside one transition: the cloned runway absorbs them and
  // the carousel settles four cards ahead, never on a dead end.
  for (let i = 0; i < 4; i++) await next(page).click();
  await expectNames(page, windowAt(4, 3));

  // Same across the wrap boundary: from the last position, three presses.
  await page.getByRole("button", { name: "Go to Julijana" }).click();
  await expectNames(page, windowAt(8, 3));
  for (let i = 0; i < 3; i++) await next(page).click();
  await expectNames(page, windowAt(1, 3));

  // Reverse mid-flight: two forward, two back, landing where we started.
  await next(page).click();
  await next(page).click();
  await prev(page).click();
  await prev(page).click();
  await expectNames(page, windowAt(1, 3));
});

test("tablet shows two cards and mobile one, both wrapping one card at a time", async ({ page }) => {
  await hydratedGoto(page, "/about");
  await page.setViewportSize({ width: 768, height: 900 });
  await resetCarousel(page);

  // Tablet: 2 cards per view.
  await expectNames(page, ["Mel", "Jeanine & Marc"]);
  await next(page).click();
  await expectNames(page, ["Jeanine & Marc", "Otto"]);
  await prev(page).click();
  await prev(page).click();
  await expectNames(page, ["Gunner", "Mel"]); // backward wrap

  // Mobile: 1 card per view; both directions wrap one card at a time.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollIntoView({ block: "center" });
  }, CAROUSEL);
  await waitForStableScroll(page);
  await page.getByRole("button", { name: "Go to Mel" }).click();
  await expectNames(page, ["Mel"]);
  await next(page).click();
  await expectNames(page, ["Jeanine & Marc"]);
  await prev(page).click();
  await expectNames(page, ["Mel"]);
  await prev(page).click();
  await expectNames(page, ["Gunner"]); // backward wrap
  await next(page).click();
  await expectNames(page, ["Mel"]);
});

test("pointer swipe follows the drag and respects the loop", async ({ page, browserName }) => {
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
  // A card step is (track width / cards-per-view); ~70% of a card commits a move.
  const step = box.width / 3;
  const drag = step * 0.7;

  // Drag left → one card forward.
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - drag, y, { steps: 8 });
  await page.mouse.up();
  await expectNames(page, ["Jeanine & Marc", "Otto", "Aaron"]);

  // A short drag under half a card snaps back instead of moving.
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - step * 0.2, y, { steps: 8 });
  await page.mouse.up();
  await expectNames(page, ["Jeanine & Marc", "Otto", "Aaron"]);

  // Drag right → one card back.
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + drag, y, { steps: 8 });
  await page.mouse.up();
  await expectNames(page, ["Mel", "Jeanine & Marc", "Otto"]);
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
