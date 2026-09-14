import { defineConfig, devices } from "@playwright/test";

// Post-deployment smoke configuration. This suite is deliberately separate
// from the hermetic local suite (playwright.config.ts -> tests/e2e):
//
//   - It has NO webServer and never starts a local Next.js server.
//   - It runs against a deployed base URL (SMOKE_BASE_URL), defaulting to the
//     canonical production origin.
//   - Every test is read-only: no bookings, no form submissions that send,
//     no Firestore writes, no analytics/conversion beacons (see
//     tests/production/fixtures.ts for the blocking rules).
//
// The local suite cannot be pointed at production: its baseURL is hardcoded
// to 127.0.0.1:3100 and it refuses to reuse an existing server. Conversely,
// this suite contains no mutation-capable tests, so running it against
// production is safe by construction.

export const PRODUCTION_URL = "https://www.seasaba.com";

const baseURL = process.env.SMOKE_BASE_URL ?? PRODUCTION_URL;
const parsed = new URL(baseURL);
const isLocalhost = ["localhost", "127.0.0.1"].includes(parsed.hostname);
if (parsed.protocol !== "https:" && !isLocalhost) {
  throw new Error(
    `SMOKE_BASE_URL must be an https:// URL or localhost (got "${baseURL}"). ` +
      `Plain-http targets are refused so the suite can never run against an insecure origin.`
  );
}

export default defineConfig({
  testDir: "./tests/production",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-production" }]],
  outputDir: "test-results-production",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  // Deployment smoke verifies one real customer engine; marketing/browser
  // matrix coverage belongs to the hermetic local suite.
  projects: [{ name: "production-chromium", use: { ...devices["Desktop Chrome"] } }],
});
