import { expect, test } from "@playwright/test";

/**
 * DEMA attribution must survive into the actual subscribe POST body —
 * #269. These tests intercept the browser's own /api/newsletter/subscribe
 * request and assert on the submitted payload, so a regression that
 * silently drops campaign/source/placement fails the suite. The endpoint
 * is mocked: no real subscribers and no real email delivery.
 */

interface SubscribePayload {
  subscription: {
    email: string;
    audiences: string[];
    organization: string;
    consent: boolean;
  };
  attribution: {
    campaign: string | null;
    source: string | null;
    placement: string | null;
    audience: string | null;
  };
}

const EMAIL = "Diver@Example.com";

function mockSubscribe(page: import("@playwright/test").Page) {
  const seen: SubscribePayload[] = [];
  const requestUrls: string[] = [];
  void page.route("**/api/newsletter/subscribe", async (route) => {
    requestUrls.push(route.request().url());
    seen.push(route.request().postDataJSON() as SubscribePayload);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  return { seen, requestUrls };
}

async function fillAndSubmit(
  page: import("@playwright/test").Page,
  { email = EMAIL } = {}
) {
  const emailField = page.getByRole("textbox", { name: /^Email/ });
  await emailField.fill(email);
  // Controlled input: asserting the value keeps slower engines from
  // racing hydration before the click (same convention as the footer spec).
  await expect(emailField).toHaveValue(email);
  await page
    .getByRole("checkbox", { name: /I agree to receive the Sea Saba/ })
    .check();
  await page.getByRole("button", { name: "Subscribe" }).click();
  // The mocked route always accepts — success state confirms the POST ran.
  await expect(page.getByText("Check your inbox")).toBeVisible();
}

const individual = (page: import("@playwright/test").Page) =>
  page.getByRole("checkbox", { name: /Individual Diver/ });
const group = (page: import("@playwright/test").Page) =>
  page.getByRole("checkbox", { name: /Group Organizer/ });

test.describe("newsletter signup payload attribution (#269)", () => {
  test("DEMA group-flyer signup submits the full attribution", async ({
    page,
  }) => {
    const { seen, requestUrls } = mockSubscribe(page);
    await page.goto(
      "/newsletter?campaign=dema-2026&source=qr&placement=group-flyer&audience=group"
    );
    await page.waitForLoadState("networkidle");
    await expect(group(page)).toBeChecked();
    await fillAndSubmit(page);

    expect(seen).toHaveLength(1);
    expect(seen[0].attribution).toEqual({
      campaign: "dema-2026",
      source: "qr",
      placement: "group-flyer",
      audience: "group",
    });
    expect(seen[0].subscription.audiences).toEqual(["group"]);
    expect(seen[0].subscription.consent).toBe(true);
    // The email rides in the POST body only — never the request or page URL.
    expect(seen[0].subscription.email).toBe(EMAIL);
    for (const url of [...requestUrls, page.url()]) {
      expect(url).not.toContain("Diver@Example");
      expect(url).not.toContain("Diver%40Example");
      expect(url).not.toMatch(/[?&](email|e|mail|address)=/i);
    }
  });

  test("DEMA individual-flyer signup submits the full attribution", async ({
    page,
  }) => {
    const { seen } = mockSubscribe(page);
    await page.goto(
      "/newsletter?campaign=dema-2026&source=qr&placement=individual-flyer&audience=individual"
    );
    await page.waitForLoadState("networkidle");
    await expect(individual(page)).toBeChecked();
    await fillAndSubmit(page);

    expect(seen).toHaveLength(1);
    expect(seen[0].attribution).toEqual({
      campaign: "dema-2026",
      source: "qr",
      placement: "individual-flyer",
      audience: "individual",
    });
    expect(seen[0].subscription.audiences).toEqual(["individual"]);
  });

  test("selecting both audiences submits both memberships", async ({
    page,
  }) => {
    const { seen } = mockSubscribe(page);
    await page.goto(
      "/newsletter?campaign=dema-2026&source=qr&placement=individual-flyer&audience=individual"
    );
    await page.waitForLoadState("networkidle");
    await group(page).check();
    await expect(group(page)).toBeChecked();
    await fillAndSubmit(page);

    expect(seen).toHaveLength(1);
    expect(seen[0].subscription.audiences).toEqual(
      expect.arrayContaining(["individual", "group"])
    );
    // Attribution still carries the link's preselect, not the change.
    expect(seen[0].attribution.audience).toBe("individual");
  });

  test("changing the audience selection never drops campaign attribution", async ({
    page,
  }) => {
    const { seen } = mockSubscribe(page);
    await page.goto(
      "/newsletter?campaign=dema-2026&source=qr&placement=group-flyer&audience=group"
    );
    await page.waitForLoadState("networkidle");
    // Flip the preselect: remove group, add individual.
    await group(page).uncheck();
    await individual(page).check();
    await expect(group(page)).not.toBeChecked();
    await fillAndSubmit(page);

    expect(seen).toHaveLength(1);
    expect(seen[0].attribution).toEqual({
      campaign: "dema-2026",
      source: "qr",
      placement: "group-flyer",
      audience: "group",
    });
    expect(seen[0].subscription.audiences).toEqual(["individual"]);
  });

  test("footer handoff submits source=website, placement=footer", async ({
    page,
  }) => {
    const { seen, requestUrls } = mockSubscribe(page);
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    const footerEmail = page.getByRole("textbox", {
      name: /newsletter email/i,
    });
    await footerEmail.fill(EMAIL);
    await expect(footerEmail).toHaveValue(EMAIL);
    await page.getByRole("button", { name: "Subscribe" }).click();
    await page.waitForURL(/\/newsletter/);
    // The footer handoff URL carries the attribution.
    expect(page.url()).toContain("placement=footer");
    expect(page.url()).toContain("source=website");
    await individual(page).check();
    await fillAndSubmit(page);

    expect(seen).toHaveLength(1);
    expect(seen[0].attribution).toEqual({
      campaign: null,
      source: "website",
      placement: "footer",
      audience: null,
    });
    expect(seen[0].subscription.email).toBe(EMAIL);
    for (const url of [...requestUrls, page.url()]) {
      expect(url).not.toContain("Diver@Example");
      expect(url).not.toMatch(/[?&](email|e|mail|address)=/i);
    }
  });
});
