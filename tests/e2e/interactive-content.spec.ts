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

test("the dive log still renders its UI when Firestore is unreachable", async ({ page }) => {
  // With the backend fully blocked (fixture default), the SDK resolves from an
  // empty offline cache — the page must render its empty state rather than
  // crash or spin forever. The "Unable to load dive log" error card is covered
  // by tests/integration/dive-log-client.test.tsx; route interception can't
  // reach it because the SDK treats failed requests as offline and serves
  // cache instead of rejecting.
  await hydratedGoto(page, "/dive-log");
  await expect(page.getByRole("heading", { name: "Sea Saba Dive Log" })).toBeVisible();
  await expect(page.getByText(/No dives match your filters|Unable to load dive log/)).toBeVisible({ timeout: 25_000 });
});
