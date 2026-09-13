import { test, expect, hydratedGoto, isFirstParty, mockCheckfrontScript } from "./fixtures";

// Booking is the conversion-critical path: run on the full browser/device matrix.

test("@smoke generic /book shows the booking context and a working fallback when Checkfront is unreachable", async ({ page }) => {
  await hydratedGoto(page, "/book");
  await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();
  // The fixture blocks the Checkfront loader script, so the widget must degrade.
  await expect(page.getByText("Booking system unavailable")).toBeVisible();
  const fallback = page.getByRole("link", { name: "Continue to Secure Booking System" });
  await expect(fallback).toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/");
  await expect(fallback).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "book directly" })).toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/");
});

test("Classic 2-Tank deep link selects the correct Checkfront item", async ({ page }) => {
  await mockCheckfrontScript(page);
  await hydratedGoto(page, "/book?item=classic");
  await expect(page.getByText("Booking: Classic 2-Tank Dive")).toBeVisible();
  await expect(page.getByText("Test availability for item 244")).toBeVisible();
  await expect(page.getByText("Loading availability...")).toHaveCount(0);
});

test("Advanced 2-Tank deep link selects the correct Checkfront item", async ({ page }) => {
  await mockCheckfrontScript(page);
  await hydratedGoto(page, "/book?item=advanced");
  await expect(page.getByText("Booking: Advanced 2-Tank Dive")).toBeVisible();
  await expect(page.getByText("Test availability for item 243")).toBeVisible();
  await expect(page.getByText("Loading availability...")).toHaveCount(0);
});

test("parameterized booking URLs stay noindex while the canonical page does not", async ({ page }) => {
  await page.goto("/book?item=classic");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto("/book");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
});

test("the item banner links back to the generic booking page", async ({ page }) => {
  await hydratedGoto(page, "/book?item=afternoon");
  await expect(page.getByText("Booking: Afternoon 1-Tank Dive")).toBeVisible();
  await page.getByRole("link", { name: "view all options" }).click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByText(/^Booking:/)).toHaveCount(0);
});

test("booking fallback and meaningful content work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("**/*", async (route) => {
    if (isFirstParty(route.request().url())) await route.continue();
    else await route.abort("blockedbyclient");
  });
  try {
    await page.goto(`${baseURL}/book`);
    await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue to Secure Booking System" })).toBeVisible();
  } finally { await context.close(); }
});
