import { test, expect, hydratedGoto, stubWindowOpen, windowOpenCalls } from "./fixtures";

// The contact form is a conversion path: run on the full browser/device matrix.
// hydratedGoto probes #name so fills land after React hydration (see fixtures).

const name = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: /^Name/ });
const email = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: /^Email/ });
const inquiry = (page: import("@playwright/test").Page) => page.getByRole("combobox");
const emailButton = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Send inquiry by email" });
const whatsappButton = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Send inquiry by WhatsApp" });

test("empty submission reports every required field without a handoff", async ({ page }) => {
  await stubWindowOpen(page);
  await hydratedGoto(page, "/contact", "#name");
  await whatsappButton(page).click();
  for (const message of [
    "Please enter your name.",
    "Please enter your email address.",
    "Please select an inquiry type.",
    "Please enter a message.",
  ]) await expect(page.getByText(message)).toBeVisible();
  await expect(email(page)).toHaveAttribute("aria-invalid", "true");
  expect(await windowOpenCalls(page)).toEqual([]);
});

test("course inquiry validates then prepares a WhatsApp handoff", async ({ page }) => {
  await stubWindowOpen(page, "inquiryCalls");
  await hydratedGoto(page, "/contact?interest=try-scuba", "#name");
  await expect(inquiry(page)).toHaveValue("try-scuba");
  await emailButton(page).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await name(page).fill("Test Guest");
  await email(page).fill("bad-email");
  await emailButton(page).click();
  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  await email(page).fill("guest@example.test");
  await email(page).press("Tab");
  await expect(page.getByText("Please enter a valid email address.")).toHaveCount(0);
  // Capture the vendor handoff without sending a message or opening WhatsApp.
  await whatsappButton(page).click();
  await expect(email(page)).toHaveAttribute("aria-invalid", "false");
  await expect.poll(() => windowOpenCalls(page, "inquiryCalls")).toHaveLength(1);
  const url = new URL((await windowOpenCalls(page, "inquiryCalls"))[0]);
  expect(url.origin + url.pathname).toBe("https://wa.me/5994162246");
  expect(url.searchParams.get("text")).toContain("Test Guest");
  expect(url.searchParams.get("text")).toContain("Try Scuba");
});

test("correcting an invalid email and clicking submit without Tab produces exactly one handoff", async ({ page }) => {
  await stubWindowOpen(page);
  await hydratedGoto(page, "/contact?interest=try-scuba", "#name");

  // Fill all required fields except email.
  await name(page).fill("Blur Test Guest");
  await email(page).fill("not-an-email");
  // Inquiry is pre-filled by ?interest=try-scuba; message is pre-filled by the component.

  // Submit to trigger validation -- should fail on invalid email.
  await whatsappButton(page).click();
  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();

  // Correct the email directly, then click submit WITHOUT pressing Tab first.
  // Before the fix, clearing the error on blur could shift the button and cause
  // the click to miss or fire twice.
  await email(page).fill("guest@example.test");
  await whatsappButton(page).click();

  // Wait for the handoff to complete.
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { handoffCalls: string[] }).handoffCalls.length
  )).toBeGreaterThan(0);

  // Verify exactly one handoff occurred and it contains the corrected data.
  const calls = await windowOpenCalls(page);
  expect(calls).toHaveLength(1);
  const url = new URL(calls[0]);
  expect(url.origin + url.pathname).toBe("https://wa.me/5994162246");
  expect(url.searchParams.get("text")).toContain("Blur Test Guest");
  expect(url.searchParams.get("text")).toContain("Try Scuba");
});

test("a rapid double submission still produces exactly one handoff", async ({ page }) => {
  await stubWindowOpen(page);
  await hydratedGoto(page, "/contact?interest=try-scuba", "#name");
  await name(page).fill("Double Click Guest");
  await email(page).fill("guest@example.test");
  await whatsappButton(page).dblclick();
  await expect.poll(() => windowOpenCalls(page)).toHaveLength(1);
});

test("the form submits via keyboard activation", async ({ page }) => {
  await stubWindowOpen(page);
  await hydratedGoto(page, "/contact?interest=try-scuba", "#name");
  await name(page).fill("Keyboard Guest");
  await email(page).fill("guest@example.test");
  await whatsappButton(page).focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => windowOpenCalls(page)).toHaveLength(1);
});

test("email submission posts to the site endpoint and confirms in place", async ({ page }) => {
  // The contact endpoint is a first-party boundary: intercepted here so the
  // test never touches Resend and the outcome is deterministic.
  let sent: unknown;
  await page.route("**/api/contact", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await hydratedGoto(page, "/contact?interest=sdi-open-water", "#name");
  await name(page).fill("Email Guest");
  await email(page).fill("guest@example.test");
  await emailButton(page).click();
  await expect(page.getByRole("status")).toContainText("Your inquiry has been sent.");
  expect(page.url()).toContain("/contact");
  const body = sent as Record<string, unknown>;
  expect(body).toMatchObject({ name: "Email Guest", email: "guest@example.test", inquiryType: "sdi-open-water" });
  const events = await page.evaluate(() => (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []);
  expect(events.find((e) => e.event === "contact_form_submit")).toMatchObject({ method: "email", inquiry_type: "SDI Open Water Diver" });
});

test("a provider failure keeps the entered message and allows recovery", async ({ page, monitor }) => {
  // The mocked 502 is the point of the test; keep the failure monitor strict.
  monitor.allowRequestFailure(/\/api\/contact/);
  monitor.allowConsoleError(/status of 502/);
  let calls = 0;
  await page.route("**/api/contact", async (route) => {
    calls++;
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "Your message could not be sent right now. Please try again, or reach us on WhatsApp." }),
    });
  });
  await hydratedGoto(page, "/contact", "#name");
  await name(page).fill("Retry Guest");
  await email(page).fill("guest@example.test");
  await inquiry(page).selectOption("general");
  await page.getByRole("textbox", { name: /^Message/ }).fill("Please keep this text.");
  await emailButton(page).click();
  // Next's route announcer also has role="alert" — filter to the form error.
  await expect(page.getByRole("alert").filter({ hasText: "could not be sent" })).toBeVisible();
  // Nothing is lost: the fields still hold the entered values for a retry.
  await expect(page.getByRole("textbox", { name: /^Message/ })).toHaveValue("Please keep this text.");
  const formError = page.getByRole("alert").filter({ hasText: "could not be sent" });
  await expect(formError.getByRole("link", { name: "info@seasaba.com" })).toHaveAttribute("href", "mailto:info@seasaba.com");
  const events = await page.evaluate(() => (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []);
  expect(events.find((e) => e.event === "contact_form_error")).toMatchObject({ method: "email" });
  expect(events.find((e) => e.event === "contact_form_submit")).toBeUndefined();
  expect(calls).toBe(1);
});

test("progressive disclosure reveals only fields relevant to the inquiry", async ({ page }) => {
  await hydratedGoto(page, "/contact", "#inquiry-type");
  // Default: no contextual fields at all.
  await expect(page.getByLabel(/Certification level/)).toHaveCount(0);
  await expect(page.getByLabel(/WhatsApp number/)).toHaveCount(0);

  await inquiry(page).selectOption("sdi-divemaster");
  await expect(page.getByLabel(/Certification level/)).toBeVisible();
  await expect(page.getByLabel(/Logged dives/)).toBeVisible();
  await expect(page.getByLabel(/Number of students/)).toBeVisible();

  // Switching to a non-diving inquiry removes the scuba fields.
  await inquiry(page).selectOption("sunset-cruise");
  await expect(page.getByLabel(/Certification level/)).toHaveCount(0);
  await expect(page.getByLabel(/Logged dives/)).toHaveCount(0);
  await expect(page.getByLabel(/Number of guests/)).toBeVisible();
});

test("a valid ?interest= preselects the inquiry and reveals its fields", async ({ page }) => {
  await hydratedGoto(page, "/contact?interest=sdi-open-water", "#inquiry-type");
  await expect(inquiry(page)).toHaveValue("sdi-open-water");
  await expect(page.getByLabel(/Number of students/)).toBeVisible();
  await expect(page.getByLabel(/Planned travel dates/)).toBeVisible();
  // Entry-level course: no credential questions.
  await expect(page.getByLabel(/Certification level/)).toHaveCount(0);
  await expect(page.getByLabel(/Logged dives/)).toHaveCount(0);
});

test("course interest query params preselect the inquiry and unknown values are ignored", async ({ page }) => {
  await hydratedGoto(page, "/contact?interest=sdi-nitrox", "#inquiry-type");
  await expect(page.getByRole("heading", { name: "SDI Nitrox Diver Inquiry" })).toBeVisible();
  await expect(inquiry(page)).toHaveValue("sdi-nitrox");
  await expect(page.getByRole("textbox", { name: /^Message/ })).toHaveValue(/Nitrox/);

  await hydratedGoto(page, "/contact?interest=not-a-real-inquiry", "#inquiry-type");
  await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
  await expect(inquiry(page)).toHaveValue("");
});
