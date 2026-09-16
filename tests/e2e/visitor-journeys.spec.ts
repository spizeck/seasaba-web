import { test, expect, hydratedGoto, waitForHydration, clickNavLink, stubWindowOpen, windowOpenCalls, mockCheckfrontScript } from "./fixtures";

// Representative customer journeys run on the full browser/device matrix.
// Each verifies a real visitor can reach the right information and the right
// next action — not that specific marketing copy exists.

test("new diver: home → courses → try scuba inquiry → WhatsApp handoff", async ({ page, isMobile }) => {
  await stubWindowOpen(page);
  await hydratedGoto(page, "/");
  await clickNavLink(page, "Courses", isMobile);
  await expect(page.getByRole("heading", { name: "Learn to Dive with Sea Saba" })).toBeVisible();

  await page.getByRole("link", { name: "Request Try Scuba Info" }).click();
  await expect(page).toHaveURL(/\/contact\?interest=try-scuba/);
  await waitForHydrationProbe(page);
  await expect(page.getByRole("heading", { name: "Try Scuba Inquiry" })).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveValue("try-scuba");

  await page.getByRole("textbox", { name: /^Name/ }).fill("Curious Guest");
  await page.getByRole("textbox", { name: /^Email/ }).fill("guest@example.test");
  await page.getByRole("button", { name: "Send inquiry by WhatsApp" }).click();
  await expect.poll(() => windowOpenCalls(page)).toHaveLength(1);
  const url = new URL((await windowOpenCalls(page))[0]);
  expect(url.searchParams.get("text")).toContain("Curious Guest");
});

test("experienced diver: diving page → advanced deep link → correct Checkfront item", async ({ page }) => {
  await mockCheckfrontScript(page);
  await hydratedGoto(page, "/diving");
  await expect(page.getByRole("heading", { name: "Diving with Sea Saba" })).toBeVisible();

  await page.getByRole("link", { name: "Book Advanced Diving" }).click();
  await expect(page).toHaveURL(/\/book\?item=advanced/);
  await expect(page.getByText("Booking: Advanced 2-Tank Dive")).toBeVisible();
  await expect(page.getByText("Test availability for item 243")).toBeVisible();
});

test("course inquiry customer: courses → open water info → message handoff", async ({ page, browserName }) => {
  await stubWindowOpen(page);
  await hydratedGoto(page, "/courses");
  await page.getByRole("link", { name: "Request Open Water Info" }).click();
  await expect(page).toHaveURL(/\/contact\?interest=sdi-open-water/);
  await waitForHydrationProbe(page);
  await expect(page.getByRole("heading", { name: "SDI Open Water Diver Inquiry" })).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveValue("sdi-open-water");

  await page.getByRole("textbox", { name: /^Name/ }).fill("Student Guest");
  await page.getByRole("textbox", { name: /^Email/ }).fill("student@example.test");

  if (browserName === "webkit") {
    // mailto: is not observable under Playwright WebKit (it navigates the page
    // away); the WhatsApp handoff exercises the same end-to-end path here. The
    // email handoff itself is verified on Chromium below.
    await page.getByRole("button", { name: "Send inquiry by WhatsApp" }).click();
    await expect.poll(() => windowOpenCalls(page)).toHaveLength(1);
  } else {
    await page.getByRole("button", { name: "Send inquiry by email" }).click();
    const events = await page.evaluate(() => (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []);
    expect(events.find((e) => e.event === "contact_form_submit")).toMatchObject({ method: "email" });
    expect(events.find((e) => e.event === "email_click")).toMatchObject({ link_url: "mailto:info@seasaba.com" });
    expect(page.url()).toContain("/contact");
  }
});

test("trip planner: plan-your-trip → generic booking page with fallback", async ({ page }) => {
  await hydratedGoto(page, "/plan-your-trip");
  await expect(page.getByRole("heading", { name: "Plan Your Trip to Saba" })).toBeVisible();

  await page.getByRole("link", { name: "Book Diving" }).last().click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();
  // Checkfront is blocked by the test fixture, so the fallback must appear.
  await expect(page.getByText("Booking isn't loading")).toBeVisible();
});

// Navigations between pages are client-side transitions; wait for the
// destination form to exist before filling.
async function waitForHydrationProbe(page: import("@playwright/test").Page) {
  await waitForHydration(page, "#name");
}
