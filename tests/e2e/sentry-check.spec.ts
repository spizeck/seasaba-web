import { test, expect, waitForHydration } from "./fixtures";

/**
 * #129: the /sentry-check ops page must exist but stay locked down and
 * undiscoverable. The test build never configures SENTRY_CHECK_TOKEN, so the
 * gate is exercised in its fail-closed state — exactly what Preview and any
 * environment without the token get.
 */
test("sentry-check is token-gated, noindexed and unlinked", async ({
  page,
  monitor,
}) => {
  // A denied authorize attempt returns 401 — an expected response the
  // browser still logs as a resource error and a failed request.
  monitor.allowConsoleError(/sentry-check\/session/);
  monitor.allowRequestFailure(/sentry-check\/session/);

  const response = await page.goto("/sentry-check");
  expect(response?.status()).toBe(200);

  // Operational page — never indexable.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );

  // The gate renders; the test actions never do without a session.
  await waitForHydration(page, "#sentry-token");
  await expect(page.getByLabel(/access token/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send browser test error/i })
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /send server test error/i })
  ).toHaveCount(0);

  // A wrong token is refused in place and never reveals controls.
  await page.getByLabel(/access token/i).fill("definitely-wrong");
  await page.getByRole("button", { name: /authorize/i }).click();
  await expect(page.getByText(/token was not accepted/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send browser test error/i })
  ).toHaveCount(0);
});

test("sentry-check is not linked anywhere on the public site", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('a[href*="sentry-check"]')).toHaveCount(0);
  await page.goto("/contact");
  await expect(page.locator('a[href*="sentry-check"]')).toHaveCount(0);
});

test("sentry-check has no localized variant", async ({ page, monitor }) => {
  monitor.allowRequestFailure(/sentry-check/);
  monitor.allowConsoleError(/sentry-check|404/);
  const response = await page.goto("/nl/sentry-check");
  expect(response?.status()).toBe(404);
});
