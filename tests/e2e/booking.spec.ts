import { test, expect, hydratedGoto, isFirstParty, mockCheckfrontScript } from "./fixtures";

// Booking is the conversion-critical path: run on the full browser/device matrix.

test("@smoke generic /book shows the booking context and a working fallback when Checkfront is unreachable", async ({ page }) => {
  await hydratedGoto(page, "/book");
  await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();
  // The fixture blocks the Checkfront loader script, so the widget must degrade.
  await expect(page.getByText("Booking isn't loading")).toBeVisible();
  const fallback = page.getByRole("link", { name: "Continue to Secure Booking System" });
  await expect(fallback).toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/?tid=seasaba-website");
  await expect(fallback).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "book directly" })).toHaveAttribute(
    "href",
    "https://seasaba.checkfront.com/reserve/?tid=seasaba-website"
  );
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

test("an unknown item param degrades to the full inventory with a notice", async ({ page }) => {
  await mockCheckfrontScript(page);
  await hydratedGoto(page, "/book?item=not-a-product");
  await expect(page.getByText("We couldn't find that experience.")).toBeVisible();
  // No product banner for an unrecognized value, and nothing bogus reaches the vendor.
  await expect(page.getByText(/^Booking:/)).toHaveCount(0);
  await expect(page.getByText("Test availability for item 245,244,243,246,247,248,253,249,254,328")).toBeVisible();
});

test("sunset cruise deep links select the owner-confirmed Checkfront items", async ({ page }) => {
  await mockCheckfrontScript(page);
  await hydratedGoto(page, "/book?item=sunset-cruise");
  await expect(page.getByText("Booking: Shared Sunset Cruise")).toBeVisible();
  await expect(page.getByText("Test availability for item 247")).toBeVisible();

  await hydratedGoto(page, "/book?item=private-sunset-cruise");
  await expect(page.getByText("Booking: Private Sunset Cruise")).toBeVisible();
  await expect(page.getByText("Test availability for item 328")).toBeVisible();
});

test("the sunset cruise CTAs on plan-your-trip enter the booking flow", async ({ page }) => {
  await hydratedGoto(page, "/plan-your-trip");
  const shared = page.getByRole("link", { name: "Book a Sunset Cruise" });
  const privateCruise = page.getByRole("link", { name: "Book a Private Sunset Cruise" });
  await expect(shared).toHaveAttribute("href", "/book?item=sunset-cruise");
  await expect(privateCruise).toHaveAttribute("href", "/book?item=private-sunset-cruise");

  await shared.click();
  await expect(page).toHaveURL(/\/book\?item=sunset-cruise/);
  // A booking CTA must emit booking intent, not a contact/inquiry event.
  const events = await page.evaluate(
    () => (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []
  );
  expect(events.find((e) => e.event === "book_now_click")).toMatchObject({
    booking_item: "sunset-cruise",
    button_location: "plan_your_trip_sunset",
  });
  expect(events.find((e) => e.event === "contact_click" && e.link_url === "/contact?interest=sunset-cruise")).toBeUndefined();
});

test("a failed widget keeps the selected product in its recovery links", async ({ page }) => {
  // No mockCheckfrontScript: the fixture's catch-all aborts the vendor script.
  await hydratedGoto(page, "/book?item=classic");
  await expect(page.getByText("Booking isn't loading")).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue to Secure Booking System" }))
    .toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/?tid=seasaba-website&item_id=244");
  // Contact recovery: WhatsApp and the preselected booking inquiry.
  await expect(page.getByRole("link", { name: "WhatsApp Us" }))
    .toHaveAttribute("href", "https://wa.me/5994162246");
  await expect(page.getByRole("link", { name: "Contact us instead" }))
    .toHaveAttribute("href", "/contact?interest=book-diving");
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
