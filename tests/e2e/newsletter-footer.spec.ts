import { expect, test } from "@playwright/test";

/**
 * Newsletter footer band + /newsletter handoff. Consent, audience choice,
 * and the actual subscription POST stay on /newsletter; the footer only
 * carries the typed email across via sessionStorage (never the URL).
 */

const footerEmail = (page: import("@playwright/test").Page) =>
  page.getByRole("textbox", { name: /newsletter email/i });
const pageEmail = (page: import("@playwright/test").Page) =>
  page.getByRole("textbox", { name: /^Email/ });

test.describe("footer newsletter band", () => {
  test("appears on an ordinary page", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await expect(footerEmail(page)).toBeVisible();
  });

  test("is hidden on /newsletter itself", async ({ page }) => {
    await page.goto("/newsletter");
    await page.waitForLoadState("networkidle");
    await expect(pageEmail(page)).toBeVisible();
    await expect(footerEmail(page)).toHaveCount(0);
    // The rest of the footer still renders.
    await expect(
      page.locator("footer").getByRole("link", { name: "Dive Sites" })
    ).toBeVisible();
  });

  test("subscribe navigates to /newsletter with the email prefilled", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await footerEmail(page).fill("Diver@Example.com");
    // The input is controlled — the DOM value only holds once React has
    // hydrated and committed the change. Asserting it before the click
    // keeps slower engines (WebKit) from racing hydration.
    await expect(footerEmail(page)).toHaveValue("Diver@Example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await page.waitForURL(/\/newsletter/);
    await expect(pageEmail(page)).toHaveValue("Diver@Example.com");
    // The email must not appear in the URL — raw, encoded, or under any
    // email-ish query key.
    expect(page.url()).not.toContain("Diver@Example");
    expect(page.url()).not.toContain("Diver%40Example");
    expect(page.url()).not.toMatch(/[?&](email|e|mail|address)=/i);
    // Footer attribution travels in the handoff URL.
    expect(page.url()).toContain("placement=footer");
    expect(page.url()).toContain("source=website");
  });

  test("DEMA campaign params survive the prefill and preselect the audience", async ({
    page,
  }) => {
    await page.goto(
      "/newsletter?campaign=dema-2026&source=qr&placement=group-flyer&audience=group"
    );
    await page.waitForLoadState("networkidle");
    // The full attribution set must survive intact in the address bar.
    for (const param of [
      "campaign=dema-2026",
      "source=qr",
      "placement=group-flyer",
      "audience=group",
    ]) {
      expect(page.url()).toContain(param);
    }
    const group = page.getByRole("checkbox", {
      name: /Group Organizer/,
    });
    await expect(group).toBeChecked();
    // Audience can still be changed.
    const individual = page.getByRole("checkbox", {
      name: /Individual Diver/,
    });
    await individual.check();
    await expect(individual).toBeChecked();
    await expect(group).toBeChecked();
  });
});
