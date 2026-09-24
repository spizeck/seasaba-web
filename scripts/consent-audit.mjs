// scripts/consent-audit.mjs — manual production consent-boundary audit (#167).
//
// Opens the deployed site in a fresh Playwright context for each consent
// state (no interaction / decline / accept-all) and reports which tracker
// scripts, requests, cookies and storage entries exist at each point.
//
// MANUAL USE ONLY — not part of CI. It loads the real GTM container, so a
// run generates real analytics/Clarity hits the same way a browser visit
// does. Run it after changing GTM/Cookiebot configuration.
//
// Usage:
//   node scripts/consent-audit.mjs                 # chromium, https://www.seasaba.com
//   node scripts/consent-audit.mjs webkit          # webkit engine
//   CONSENT_AUDIT_URL=https://www.seasaba.com node scripts/consent-audit.mjs
//
// Expected after the #167 GTM fix is published:
//   none/decline  -> no clarity.ms or bat.bing.com requests, no _clck/_clsk/
//                    _uetsid/_uetvid cookies, no _uet* localStorage, no
//                    MUID/CLID/fr cookies
//   accept        -> Clarity + UET + Meta initialize; *_uet* identifiers may
//                    appear only after consent

import { chromium, webkit } from "playwright";

const BASE = process.env.CONSENT_AUDIT_URL ?? "https://www.seasaba.com/";
const ENGINE = process.argv[2] === "webkit" ? webkit : chromium;
const ENGINE_NAME = process.argv[2] === "webkit" ? "webkit" : "chromium";

// Optional (consent-gated) tracking surface. Requests to Cookiebot/GTM
// themselves are expected — they are the delivery mechanism, not the leak.
const OPTIONAL_HOSTS = /clarity\.ms|bing\.com|connect\.facebook\.net|facebook\.com|doubleclick\.net|googlesyndication\.com|googleadservices\.com/i;
// GA4/google-analytics collect pings are CONSENT-MODE-AWARE: denied pings are
// expected pre-consent and carry gcs=G1xx — reported separately, not counted
// as optional-tracking leaks.
const GA_PING = /google-analytics\.com|analytics\.google\.com|stats\.g\.doubleclick/i;
// First-party cookies that must not exist before consent.
const OPTIONAL_COOKIE = /^_clck$|^_clsk$|^_uetsid$|^_uetvid$|^_ga($|_)|^_gcl|^_fbp$|^_fbc$/;
// Third-party advertising cookies that must not exist before consent.
const OPTIONAL_3P = /^MUID$|^CLID$|^ANONCHK$|^SM$|^MR$|^SRM_B$|^fr$|^test_cookie$/;
const OPTIONAL_LS = /^_uet|^clarity|^CLARITY|^hm_|\b_fbp\b/i;

async function audit(scenario) {
  const browser = await ENGINE.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const optionalReqs = [];
  const gaPings = [];
  page.on("request", (r) => {
    const u = r.url();
    if (OPTIONAL_HOSTS.test(u)) optionalReqs.push(u);
    else if (GA_PING.test(u)) gaPings.push(u);
  });

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 });
  // Let GTM, the CMP banner and tag machinery settle before judging state.
  await page.waitForTimeout(9000);

  let action = "none";
  if (scenario !== "none") {
    const selectors =
      scenario === "decline"
        ? ["#CybotCookiebotDialogBodyButtonDecline", 'button:has-text("Decline")']
        : [
            "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
            'button:has-text("Allow all")',
            'button:has-text("Accept")',
          ];
    for (const s of selectors) {
      const el = page.locator(s).first();
      if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
        await el.click();
        action = s;
        break;
      }
    }
    await page.waitForTimeout(6000);
  }

  const cookies = await ctx.cookies();
  const firstParty = cookies.filter((c) => OPTIONAL_COOKIE.test(c.name)).map((c) => `${c.name}=${c.value.slice(0, 24)}…`);
  const thirdParty = cookies.filter((c) => OPTIONAL_3P.test(c.name)).map((c) => `${c.name}@${c.domain}`);
  const storage = await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    return keys.filter((k) => OPTIONAL_LS.test(k));
  });
  const cb = await page.evaluate(() =>
    window.Cookiebot
      ? {
          statistics: window.Cookiebot.consent?.statistics,
          marketing: window.Cookiebot.consent?.marketing,
          declined: window.Cookiebot.declined,
          hasResponse: window.Cookiebot.hasResponse,
        }
      : null
  );

  console.log(`\n===== ${ENGINE_NAME} :: ${scenario} (clicked: ${action}) =====`);
  console.log("cookiebot:", JSON.stringify(cb));
  console.log(`optional tracker requests (${optionalReqs.length}):`);
  for (const u of optionalReqs) console.log("   ", u.length > 140 ? u.slice(0, 140) + "…" : u);
  console.log(`GA consent pings (${gaPings.length}):`);
  for (const u of gaPings) console.log("   ", (u.match(/gcs=G\d+|gcd=[^&]+/) ?? [""]).join(" "), u.slice(0, 110) + "…");
  console.log("first-party optional cookies:", firstParty.length ? firstParty.join(", ") : "(none)");
  console.log("third-party optional cookies:", thirdParty.length ? thirdParty.join(", ") : "(none)");
  console.log("optional localStorage keys:", storage.length ? storage.join(", ") : "(none)");

  await browser.close();
  const leaks = firstParty.length + thirdParty.length + storage.length + optionalReqs.length;
  return { scenario, leaks };
}

const results = [];
for (const scenario of ["none", "decline", "accept"]) {
  results.push(await audit(scenario));
}
console.log("\n===== summary =====");
for (const r of results) {
  console.log(`${r.scenario}: ${r.leaks} optional-tracking artifacts`);
}
console.log("NOTE: 'accept' is expected to show artifacts; 'none'/'decline' should show none once #167 is fixed.");
