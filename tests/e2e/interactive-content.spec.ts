import { test, expect, hydratedGoto } from "./fixtures";

// Secondary behavioral coverage: Chromium only. These exercise interactive
// components (dialogs, selectors, section nav) whose behavior is
// browser-independent; the matrix already covers them implicitly via journeys.

test.beforeEach(async ({ browserName }) => {
  test.skip(browserName !== "chromium", "representative interactive coverage runs on Chromium");
});

test("dive site pills open a details dialog with prev/next, Escape closes it and restores focus", async ({ page }) => {
  await hydratedGoto(page, "/dive-sites");
  const pill = page.getByRole("button", { name: "Third Encounter", exact: true });
  await pill.click();

  const dialog = page.getByRole("dialog", { name: "Third Encounter dive site" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible();

  // Next-site navigation inside the dialog.
  await dialog.getByRole("button", { name: /Next:/ }).click();
  const nextDialog = page.getByRole("dialog", { name: "Twilight Zone dive site" });
  await expect(nextDialog).toBeVisible();
  await nextDialog.getByRole("button", { name: /Previous:/ }).click();
  await expect(dialog).toBeVisible();

  // Escape closes and focus returns to the triggering pill.
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(pill).toBeFocused();
});

test("accommodation pills open a hotel dialog, Escape closes it and restores focus", async ({ page }) => {
  await hydratedGoto(page, "/plan-your-trip");
  const pill = page.getByRole("button", { name: "Juliana's Hotel", exact: true });
  await pill.click();

  const dialog = page.getByRole("dialog", { name: "Juliana's Hotel" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Visit Hotel Website/ })).toHaveAttribute("href", /julianashotelsaba\.com/);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(pill).toBeFocused();
});

test("the experience selector switches the day schedule", async ({ page }) => {
  await hydratedGoto(page, "/diving");

  // Default is the Classic 2-Tank schedule.
  await expect(page.getByText(/two relaxed dives in Saba's Marine Park/)).toBeVisible();

  await page.getByRole("button", { name: "Advanced 2-Tank", exact: true }).click();
  await expect(page.getByText("Want a Third Dive?")).toBeVisible();
  await expect(page.getByText(/two relaxed dives in Saba's Marine Park/)).toHaveCount(0);

  await page.getByRole("button", { name: "Try Scuba", exact: true }).click();
  await expect(page.getByText(/Theory and confined water session/)).toBeVisible();
});

test("on-page section nav scrolls to the section and marks the pill current", async ({ page }) => {
  await hydratedGoto(page, "/plan-your-trip");
  const nav = page.getByRole("navigation", { name: "On this page" });
  const pill = nav.getByRole("button", { name: "Where to Stay" });
  await pill.click();

  await expect(page).toHaveURL(/#where-to-stay$/);
  await expect(pill).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#where-to-stay")).toBeVisible();
});

test("the diving page section nav jumps to the Marine Park guide section", async ({ page }) => {
  await hydratedGoto(page, "/diving");
  const nav = page.getByRole("navigation", { name: "On this page" });
  const pill = nav.getByRole("button", { name: "Marine Park" });
  await pill.click();

  await expect(page).toHaveURL(/#marine-park$/);
  await expect(pill).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#marine-park")).toBeVisible();
});

// Issue #204: the section nav is a single row at every width — overflow
// scrolls horizontally inside the strip rather than wrapping, and the page
// never gains horizontal overflow.
test("section nav stays one scrollable row at every width", async ({ page }) => {
  await hydratedGoto(page, "/plan-your-trip");
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    const info = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="On this page"]')!;
      const row = nav.querySelector("button")!.parentElement as HTMLElement;
      const tops = new Set(
        [...nav.querySelectorAll("button")].map((p) =>
          Math.round(p.getBoundingClientRect().top)
        )
      );
      return {
        rows: tops.size,
        scrollable: row.scrollWidth > row.clientWidth,
        docOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      };
    });
    expect(info.rows, `pill rows at ${width}px`).toBe(1);
    expect(info.docOverflow, `page overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

// Edge fades are a scroll affordance, not decoration: a narrow fade only at
// edges that actually have clipped content, so pills never wash out at rest.
// Computed maskImage serializes "to right" as 90deg, black as
// rgb(0, 0, 0), and transparent as rgba(0, 0, 0, 0); the first/last stops
// tell which edges fade.
test("section nav fades only edges that have clipped content", async ({ page }) => {
  await hydratedGoto(page, "/plan-your-trip");
  // Narrow viewport guarantees the strip overflows.
  await page.setViewportSize({ width: 390, height: 800 });
  const row = page.locator('nav[aria-label="On this page"] > div > div');

  const mask = () =>
    row.evaluate((el) => getComputedStyle(el).maskImage);
  const scrollRow = (x: number) =>
    row.evaluate((el, v) => {
      el.scrollLeft = v;
      el.dispatchEvent(new Event("scroll"));
    }, x);

  // Start: a right fade hints at more content; the left edge is untouched.
  await expect
    .poll(mask, "right-only fade at scroll start")
    .toMatch(/^linear-gradient\(90deg, rgb\(0, 0, 0\).*rgba\(0, 0, 0, 0\)\)$/);

  // Mid-scroll: both edges fade.
  await scrollRow(200);
  await expect
    .poll(mask, "both edges fade mid-scroll")
    .toMatch(/^linear-gradient\(90deg, rgba\(0, 0, 0, 0\).*rgba\(0, 0, 0, 0\)\)$/);

  // End: the right fade lifts; only the left affordance remains.
  await scrollRow(9999);
  await expect
    .poll(mask, "left-only fade at scroll end")
    .toMatch(/^linear-gradient\(90deg, rgba\(0, 0, 0, 0\).*rgb\(0, 0, 0\) 28px\)$/);
});

test("the dive log still renders its UI when Firestore is unreachable", async ({ page }) => {
  // With the backend fully blocked (fixture default), the SDK resolves from an
  // empty offline cache — the page must render its empty state rather than
  // crash or spin forever. The "Unable to load dive log" error card is covered
  // by tests/integration/dive-log-client.test.tsx; route interception can't
  // reach it because the SDK treats failed requests as offline and serves
  // cache instead of rejecting.
  await hydratedGoto(page, "/dive-log");
  await expect(page.getByRole("heading", { name: "Sea Saba Dive Log" })).toBeVisible();
  await expect(page.getByText(/No dives logged yet|Unable to load dive log/)).toBeVisible({ timeout: 25_000 });
});

// Issue #186: prose underlines every anchor; links rendered as buttons must
// not pick that up, while ordinary text links keep the underline. Assert the
// computed style — a class assertion can't prove what the cascade resolves to.
test("donate button links are not underlined, text links are", async ({ page }) => {
  await hydratedGoto(page, "/donate");

  const donateButton = page.getByRole("link", { name: /Donate directly to Sea & Learn/i });
  await expect(donateButton).toBeVisible();
  await expect(donateButton).toHaveCSS("text-decoration-line", "none");

  const visitLink = page.getByRole("link", { name: /Visit Sea & Learn.*website/i });
  await expect(visitLink).toBeVisible();
  await expect(visitLink).toHaveCSS("text-decoration-line", "underline");
});

// The recipient card's border/shadow cue applies on hover and while focus is
// inside the card — keyboard users get the same affordance, with no motion.
test("donate action card highlights on hover and focus-within, without layout shift", async ({ page }) => {
  await hydratedGoto(page, "/donate");

  const donateButton = page.getByRole("link", { name: /Donate directly to Sea & Learn/i });
  // The prose layout wrapper is also an <article> — take the closest one.
  const card = donateButton.locator("xpath=ancestor::article[1]");

  // Layout position, not viewport position — hover() may scroll the page.
  const layoutOf = (el: HTMLElement) => ({
    top: el.offsetTop,
    left: el.offsetLeft,
    width: el.offsetWidth,
    height: el.offsetHeight,
  });
  const borderAtRest = await card.evaluate((el) => getComputedStyle(el).borderColor);
  const layoutAtRest = await card.evaluate(layoutOf);

  // hover: styles only exist on devices with a real pointer (@media (hover:
  // hover)) — touch-emulated projects have no hover state to measure.
  if (await page.evaluate(() => matchMedia("(hover: hover)").matches)) {
    await card.hover();
    const borderOnHover = await card.evaluate((el) => getComputedStyle(el).borderColor);
    expect(borderOnHover).not.toBe(borderAtRest);
    expect(await card.evaluate(layoutOf)).toEqual(layoutAtRest);
  }

  await donateButton.focus();
  expect(await card.evaluate((el) => el.matches(":focus-within"))).toBe(true);
  const borderOnFocus = await card.evaluate((el) => getComputedStyle(el).borderColor);
  expect(borderOnFocus).not.toBe(borderAtRest);
  expect(await card.evaluate(layoutOf)).toEqual(layoutAtRest);
});
