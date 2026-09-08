import { test, expect } from "./fixtures";

test("@smoke booking remains available when Checkfront is blocked", async ({ page }) => {
  await page.goto("/book?item=classic");
  await expect(page.getByText("Booking: Classic 2-Tank Dive")).toBeVisible();
  await expect(page.getByText("Booking system unavailable")).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue to Secure Booking System" })).toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
test("Checkfront success uses the selected item without a real reservation", async ({ page }) => {
  await page.route("**/lib/interface--0.js", (route) => route.fulfill({ contentType: "application/javascript", body: `window.DROPLET = { Widget: class { constructor(config) { this.config = config; } render() { document.getElementById(this.config.target).textContent = 'Test availability for item ' + this.config.item_id; } } };` }));
  await page.goto("/book?item=advanced");
  await expect(page.getByText("Test availability for item 243")).toBeVisible();
  await expect(page.getByText("Loading availability...")).toHaveCount(0);
});
test("course inquiry validates then prepares a WhatsApp handoff", async ({ page }) => {
  await page.addInitScript(() => {
    window.open = (url) => { (window as unknown as { inquiryUrl: string }).inquiryUrl = String(url); return null; };
  });
  await page.goto("/contact?interest=try-scuba");
  await expect(page.getByRole("combobox")).toHaveValue("try-scuba");
  await page.getByRole("button", { name: "Send inquiry by email" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await page.getByRole("textbox", { name: /^Name/ }).fill("Test Guest");
  await page.getByRole("textbox", { name: /^Email/ }).fill("bad-email");
  await page.getByRole("button", { name: "Send inquiry by email" }).click();
  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  await page.getByRole("textbox", { name: /^Email/ }).fill("guest@example.test");
  await page.getByRole("textbox", { name: /^Email/ }).press("Tab");
  await expect(page.getByText("Please enter a valid email address.")).toHaveCount(0);
  // Capture the vendor handoff without sending a message or opening WhatsApp.
  await page.getByRole("button", { name: "Send inquiry by WhatsApp" }).click();
  await expect(page.getByRole("textbox", { name: /^Email/ })).toHaveAttribute("aria-invalid", "false");
  await expect.poll(() => page.evaluate(() => (window as unknown as { inquiryUrl?: string }).inquiryUrl)).toContain("https://wa.me/5994162246?text=");
  const href = await page.evaluate(() => (window as unknown as { inquiryUrl: string }).inquiryUrl);
  expect(new URL(href).searchParams.get("text")).toContain("Test Guest");
  expect(new URL(href).searchParams.get("text")).toContain("Try Scuba");
});
test("mobile menu opens, navigates, and closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile navigation only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("header nav").last().getByRole("link", { name: "Diving", exact: true }).click();
  await expect(page).toHaveURL(/\/diving$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("header nav").last().getByRole("link", { name: "Book Now" }).click();
  await expect(page).toHaveURL(/\/book$/);
});
test("booking fallback and meaningful content work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/book`);
    await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue to Secure Booking System" })).toBeVisible();
  } finally { await context.close(); }
});
