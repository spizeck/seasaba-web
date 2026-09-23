import { test, expect, waitForHydration } from "./fixtures";

/**
 * #129: /sentry-check is temporary verification tooling — reachable by exact
 * URL only, noindexed, unlinked, and guarded by the production-only Sentry
 * activation itself. The test build is never a Vercel Production deployment,
 * so both actions must report inactivity rather than emit a real event.
 */
test("sentry-check renders both test actions, stays noindexed and fails closed", async ({
  page,
  monitor,
}) => {
  // The server test answers 503 (sentry_inactive) in this build — an
  // expected response the browser logs as a failed request/console error.
  monitor.allowConsoleError(/sentry-check\/server-error/);
  monitor.allowRequestFailure(/sentry-check\/server-error/);

  const response = await page.goto("/sentry-check");
  expect(response?.status()).toBe(200);

  // Temporary verification page — never indexable.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );

  const browserButton = page.getByRole("button", {
    name: /send browser test error/i,
  });
  const serverButton = page.getByRole("button", {
    name: /send server test error/i,
  });
  await expect(browserButton).toBeVisible();
  await expect(serverButton).toBeVisible();
  // No token/session gate remains.
  await expect(page.getByLabel(/token/i)).toHaveCount(0);

  // Outside Vercel Production each action reports inactivity instead of
  // pretending to send — one status line per action.
  await waitForHydration(page, "button");
  const statuses = page.getByText(/inactive in this deployment/i);
  await browserButton.click();
  await expect(statuses).toHaveCount(1);
  await serverButton.click();
  await expect(statuses).toHaveCount(2);
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
