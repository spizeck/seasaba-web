import { test, expect, hydratedGoto, stubWindowOpen, windowOpenCalls } from "./fixtures";

// The contact form is a conversion path: run on the full browser/device matrix.
// hydratedGoto probes #name so fills land after React hydration (see fixtures).

const name = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: /^Name/ });
const email = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: /^Email/ });
const inquiry = (page: import("@playwright/test").Page) => page.getByRole("combobox");
const emailButton = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Continue to email" });
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

test("email handoff opens the visitor's mail app and sends nothing to a server", async ({ page }) => {
  // The handoff is a mailto: URI delegated to the OS mail client — stubbed
  // here so the test captures the draft instead of launching an app.
  await stubWindowOpen(page, "mailCalls");
  const apiCalls: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/contact")) apiCalls.push(req.url());
  });
  await hydratedGoto(page, "/contact?interest=sdi-open-water", "#name");
  await name(page).fill("Email Guest");
  await email(page).fill("guest@example.test");
  await emailButton(page).click();

  await expect.poll(() => windowOpenCalls(page, "mailCalls")).toHaveLength(1);
  const href = (await windowOpenCalls(page, "mailCalls"))[0];
  const url = new URL(href);
  expect(href.startsWith("mailto:")).toBe(true);
  expect(url.pathname).toBe("info@seasaba.com");
  expect(url.searchParams.get("subject")).toBe("SDI Open Water Diver Inquiry — Email Guest");
  const body = url.searchParams.get("body") ?? "";
  expect(body).toContain("Name: Email Guest");
  expect(body).toContain("Email: guest@example.test");
  expect(body).toContain("Inquiry: SDI Open Water Diver");
  expect(body).toContain("Preferred contact method: Email");

  // Truthful UX: a handoff notice, never a delivery confirmation.
  await expect(page.getByRole("status")).toContainText("email app should open");
  await expect(page.getByRole("status")).not.toContainText("sent");
  expect(page.url()).toContain("/contact");
  // No server round-trip and no submission-confirmed analytics for email.
  expect(apiCalls).toEqual([]);
  const events = await page.evaluate(() => (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []);
  expect(events.find((e) => e.event === "email_click")).toMatchObject({ method: "email", inquiry_type: "SDI Open Water Diver" });
  expect(events.find((e) => e.event === "contact_form_submit" && e.method === "email")).toBeUndefined();
});

test("the handoff notice keeps the form editable and offers a reopen link", async ({ page }) => {
  await stubWindowOpen(page, "mailCalls");
  await hydratedGoto(page, "/contact", "#name");
  await name(page).fill("Retry Guest");
  await email(page).fill("guest@example.test");
  await inquiry(page).selectOption("general");
  await page.getByRole("textbox", { name: /^Message/ }).fill("Please keep this text.");
  await emailButton(page).click();

  const notice = page.getByRole("status");
  await expect(notice).toContainText("email app should open");
  // Nothing is lost: the fields still hold the entered values.
  await expect(page.getByRole("textbox", { name: /^Message/ })).toHaveValue("Please keep this text.");
  // A missed protocol handoff is retryable — the notice links the same draft.
  const reopen = notice.getByRole("link", { name: "try opening it again" });
  const reopenHref = await reopen.getAttribute("href");
  expect(reopenHref?.startsWith("mailto:info@seasaba.com")).toBe(true);
  expect(reopenHref).toBe((await windowOpenCalls(page, "mailCalls"))[0]);
  await expect(notice.getByRole("link", { name: "info@seasaba.com" })).toHaveAttribute("href", "mailto:info@seasaba.com");
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
