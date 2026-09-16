import { test, expect, hydratedGoto, stubWindowOpen, windowOpenCalls } from "./fixtures";

// Conversion-boundary smoke checks. These verify OUR side of each integration:
// the booking page's guaranteed fallback and the contact form's client-side
// validation. They never create a booking, never send or open an external
// handoff, and never write to any production service.
//
// Checkfront is an external boundary: loading its widget would emit vendor
// conversion tracking (tid=seasaba-website) and its uptime is not a deployment
// property of this site, so the fixture aborts the vendor script. The
// invariant that protects customers — a booking page that always offers a
// direct booking path — is exactly what shows when the widget can't load.

test("/book renders and exposes a usable booking path", async ({ page }) => {
  const response = await hydratedGoto(page, "/book");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();

  // With the vendor script aborted, the documented fallback must appear —
  // this is the booking path a customer always has, even if Checkfront is down.
  await expect(page.getByText("Booking isn't loading")).toBeVisible();
  const fallback = page.getByRole("link", { name: "Continue to Secure Booking System" });
  await expect(fallback).toHaveAttribute(
    "href",
    "https://seasaba.checkfront.com/reserve/?tid=seasaba-website"
  );
  await expect(fallback).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "book directly" })).toHaveAttribute(
    "href",
    "https://seasaba.checkfront.com/reserve/?tid=seasaba-website"
  );
  // Deliberately not clicked: following the link opens the vendor checkout.
});

test("/book?item=classic keeps the product in the banner and the fallback", async ({ page }) => {
  const response = await hydratedGoto(page, "/book?item=classic");
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Booking: Classic 2-Tank Dive")).toBeVisible();
  // Vendor script aborted → fallback must preserve the selected item.
  await expect(page.getByRole("link", { name: "Continue to Secure Booking System" })).toHaveAttribute(
    "href",
    "https://seasaba.checkfront.com/reserve/?tid=seasaba-website&item_id=244"
  );
});

test("/contact renders a usable form and failed validation sends nothing", async ({ page }) => {
  // stubWindowOpen only affects this test browser; it cannot change what
  // production serves to real visitors. It lets us prove no handoff fired.
  await stubWindowOpen(page);
  const response = await hydratedGoto(page, "/contact", "#name");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
  for (const control of [
    page.getByRole("textbox", { name: /^Name/ }),
    page.getByRole("textbox", { name: /^Email/ }),
    page.getByRole("combobox"),
    page.getByRole("textbox", { name: /^Message/ }),
    page.getByRole("button", { name: "Send inquiry by email" }),
    page.getByRole("button", { name: "Send inquiry by WhatsApp" }),
  ]) {
    await expect(control).toBeVisible();
    await expect(control).toBeEnabled();
  }

  // Client-side validation on an empty form is provably side-effect free:
  // the handler returns before building any mailto/WhatsApp URL.
  await page.getByRole("button", { name: "Send inquiry by WhatsApp" }).click();
  for (const message of [
    "Please enter your name.",
    "Please enter your email address.",
    "Please select an inquiry type.",
    "Please enter a message.",
  ]) {
    await expect(page.getByText(message)).toBeVisible();
  }
  expect(await windowOpenCalls(page)).toEqual([]);
  expect(page.url()).toContain("/contact");
});
