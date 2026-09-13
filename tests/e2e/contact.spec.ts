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

test("email handoff targets info@seasaba.com and leaves the visitor on the page", async ({ page, browserName }) => {
  // mailto: handoffs cannot be verified in Playwright's WebKit: assigning a
  // mailto: URL to window.location makes emulated WebKit parse `info@` as
  // userinfo and navigate the page to https://www.seasaba.com/?subject=...
  // Real Safari delegates mailto: to the mail client without navigating, so
  // this is an emulation limitation, not an app defect. Verified on Chromium.
  test.skip(browserName === "webkit", "Playwright WebKit navigates mailto: handoffs away from the page");

  await hydratedGoto(page, "/contact?interest=sdi-open-water", "#name");
  await name(page).fill("Email Guest");
  await email(page).fill("guest@example.test");
  await emailButton(page).click();
  // handleEmail navigates via a mailto: URL, which browsers delegate to the mail
  // client without a page navigation. The observable browser-level signals are
  // the tracked handoff events pushed to the data layer. Subject/body contents
  // are covered by tests/integration/contact-form.test.tsx.
  const events = await page.evaluate(() => (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []);
  const submit = events.find((e) => e.event === "contact_form_submit" && e.method === "email");
  const click = events.find((e) => e.event === "email_click");
  expect(submit).toMatchObject({ inquiry_type: "SDI Open Water Diver" });
  expect(click).toMatchObject({ link_url: "mailto:info@seasaba.com" });
  expect(page.url()).toContain("/contact");
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
