import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * #167: the consent boundary depends on every tracker entering the page
 * through GTM (where Cookiebot/Consent Mode can gate it). A direct script or
 * beacon anywhere else in shipped code bypasses the CMP entirely — that is
 * exactly how Clarity/UET/Meta ended up firing pre-consent in production.
 *
 * These scans pin the invariant: tracker hosts may be referenced only by the
 * GTM loader itself, CSP/config, verification tooling and docs/tests — never
 * by application code that loads them.
 */

// Tracker endpoints that must only ever be reached via the GTM container.
const TRACKER_PATTERNS = [
  "clarity.ms",
  "bat.bing.com",
  "bat.bing.net",
  "c.bing.com",
  "connect.facebook.net",
  "fbevents",
  "facebook.com/tr",
  "doubleclick.net",
  "googlesyndication.com",
  "googletagmanager.com",
];

// Files whose job is to reference these hosts: the GTM loader, CSP config,
// vendor-observation/perf tooling, the production smoke fixture that blocks
// them, this test, and the CSP test.
const ALLOWLIST = new Set([
  "components/analytics-loader.tsx",
  "next.config.ts",
  "scripts/csp-observe.mjs",
  "scripts/perf-baseline.mjs",
  "scripts/consent-audit.mjs",
  "tests/production/fixtures.ts",
  "tests/unit/security-headers.test.ts",
  "tests/unit/consent-boundary.test.ts",
]);

function trackedFiles(): string[] {
  return execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

describe("consent boundary: trackers enter only via GTM", () => {
  it("no application code references tracker hosts directly", () => {
    for (const file of trackedFiles()) {
      if (ALLOWLIST.has(file) || file.startsWith("docs/")) continue;
      const text = readFileSync(join(process.cwd(), file), "utf8");
      for (const pattern of TRACKER_PATTERNS) {
        expect(text, `${file} references ${pattern}`).not.toContain(pattern);
      }
    }
  });

  it("analytics-loader loads GTM and nothing else", () => {
    const text = readFileSync(
      join(process.cwd(), "components/analytics-loader.tsx"),
      "utf8"
    );
    expect(text).toContain("googletagmanager.com");
    for (const pattern of TRACKER_PATTERNS) {
      if (pattern === "googletagmanager.com") continue;
      expect(text, `analytics-loader must not load ${pattern}`).not.toContain(pattern);
    }
  });

  it("the consent-gated tracker CSP allowances still exist (post-consent path)", () => {
    const text = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    // Clarity/UET are reached through GTM — the CSP must still permit them
    // or both the denied-state signaling (bat.bing.net consent posts, #169)
    // and the granted-consent path break.
    expect(text).toContain("https://*.clarity.ms");
    expect(text).toContain("https://bat.bing.com");
    expect(text).toContain("https://bat.bing.net");
    expect(text).toContain("https://consent.cookiebot.com");
  });
});
