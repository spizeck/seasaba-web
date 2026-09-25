// scripts/consent-audit.mjs — manual production consent-boundary audit (#167).
//
// Opens the deployed site in a fresh Playwright context for each consent
// state (no interaction / decline / accept-all) and classifies observable
// tracking behavior against the deployed consent architecture:
//
//   - Clarity GTM tag requires analytics_storage -> clarity.js never loads
//     before Statistics consent, so ANY *.clarity.ms request or _clck/_clsk
//     cookie in a denied state is a defect.
//   - Meta Pixel requires ad_storage -> no fbevents/facebook.com requests or
//     fr cookie before Marketing consent.
//   - Microsoft UET runs Advanced Consent Mode: the base tag loads even when
//     denied, but an explicit `uetq consent default denied` (Consent
//     Initialization) means bat.js may only emit denied-state signals
//     (evt=consent, asc=D, cdb=…) and must not write real identifiers —
//     _uetsid/_uetvid may exist ONLY with `null|…` placeholder values.
//   - GA4/Google Ads send denied pings (gcs=G1x0) without cookies — expected.
//   - GTM/Cookiebot requests themselves are the delivery mechanism, never
//     violations.
//
// MANUAL USE ONLY — not part of CI. It loads the real GTM container, so a
// run generates real vendor hits the same way a browser visit does. Run it
// after changing GTM/Cookiebot configuration.
//
// Usage:
//   node scripts/consent-audit.mjs                 # chromium, https://www.seasaba.com
//   node scripts/consent-audit.mjs webkit          # webkit engine
//   CONSENT_AUDIT_URL=https://example.com node scripts/consent-audit.mjs

import { chromium, webkit } from "playwright";

const BASE = process.env.CONSENT_AUDIT_URL ?? "https://www.seasaba.com/";
const ENGINE = process.argv[2] === "webkit" ? webkit : chromium;
const ENGINE_NAME = process.argv[2] === "webkit" ? "webkit" : "chromium";

// Hard-blocked pre-consent: gated tags must produce NO traffic at all.
const GATED_HOSTS = /clarity\.ms|connect\.facebook\.net|facebook\.com|fbevents/i;
// UET beacons are allowed when denied — bat.js Advanced Consent Mode still
// talks to Microsoft. A granted signal (asc=G / gasc=G) pre-consent is a leak.
const UET_HOSTS = /bat\.bing\.(com|net)/i;
const UET_GRANTED = /[?&](asc|gasc)=G\b/;
// GA collect in denied mode is expected (cookieless Consent Mode pings).
const GA_PING = /google-analytics\.com|analytics\.google\.com|stats\.g\.doubleclick|googlesyndication\.com\/ccm|google\.com\/ccm|ad\.doubleclick\.net\/ccm/i;
// First-party cookies that must NEVER exist before consent.
const FORBIDDEN_COOKIE = /^_clck$|^_clsk$|^_ga($|_)|^_gcl|^_fbp$|^_fbc$|^MSPTC$/;
// Third-party identifiers that must not exist before consent. MR/ANONCHK/SM/
// SRM_B are excluded: Microsoft documents a fraud-prevention carve-out under
// denied consent, so they are reported as informational only.
const FORBIDDEN_3P = /^MUID$|^CLID$|^fr$|^test_cookie$|^_uetsid$|^_uetvid$/i;
const INFO_3P = /^MR$|^ANONCHK$|^SM$|^SRM_B$/i;
// _uetsid/_uetvid are evaluated separately: allowed only as `null|…`
// placeholders (Microsoft's documented denied-mode value).
const UET_COOKIE = /^_uetsid$|^_uetvid$/;
const OPTIONAL_LS = /^_uet/i;

async function audit(scenario) {
  const browser = await ENGINE.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const gatedReqs = [];
  const uetReqs = [];
  const uetGranted = [];
  const gaPings = [];
  page.on("request", (r) => {
    const u = r.url();
    if (GATED_HOSTS.test(u)) gatedReqs.push(u);
    else if (UET_HOSTS.test(u)) {
      uetReqs.push(u);
      if (UET_GRANTED.test(u)) uetGranted.push(u);
    } else if (GA_PING.test(u)) gaPings.push(u);
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
  const forbidden1p = cookies.filter((c) => FORBIDDEN_COOKIE.test(c.name)).map((c) => c.name);
  const forbidden3p = cookies.filter((c) => FORBIDDEN_3P.test(c.name)).map((c) => `${c.name}@${c.domain}`);
  const info3p = cookies.filter((c) => INFO_3P.test(c.name)).map((c) => `${c.name}@${c.domain}`);
  // UET cookies: real identifiers are a violation; `null|…` placeholders are
  // Microsoft's documented denied-mode value (acceptable, reported as info).
  const uetReal = [];
  const uetPlaceholder = [];
  for (const c of cookies.filter((c) => UET_COOKIE.test(c.name))) {
    (c.value.startsWith("null|") ? uetPlaceholder : uetReal).push(`${c.name}=${c.value.slice(0, 20)}…`);
  }
  const storage = await page.evaluate((reSource) => {
    const re = new RegExp(reSource);
    const keys = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (re.test(k)) keys[k] = (localStorage.getItem(k) ?? "").slice(0, 24);
    }
    return keys;
  }, OPTIONAL_LS.source);
  // Only the identifier keys can carry `null|…`; *_exp keys are timestamps.
  const uetLsReal = Object.entries(storage)
    .filter(([k, v]) => UET_COOKIE.test(k) && !v.startsWith("null|"))
    .map(([k]) => k);
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

  const denied = scenario !== "accept";
  const violations = [];
  if (denied) {
    for (const u of gatedReqs) violations.push(`gated request: ${u}`);
    for (const n of forbidden1p) violations.push(`cookie: ${n}`);
    for (const n of forbidden3p) violations.push(`3p cookie: ${n}`);
    for (const n of uetReal) violations.push(`real UET identifier: ${n}`);
    for (const k of uetLsReal) violations.push(`real UET localStorage: ${k}`);
    for (const u of uetGranted) violations.push(`granted UET signal: ${u.slice(0, 120)}`);
  }

  console.log(`\n===== ${ENGINE_NAME} :: ${scenario} (clicked: ${action}) =====`);
  console.log("cookiebot:", JSON.stringify(cb));
  console.log(`gated-tag requests (${gatedReqs.length})${denied && gatedReqs.length ? "  <-- VIOLATION" : ""}:`);
  for (const u of gatedReqs) console.log("   ", u.slice(0, 140));
  console.log(`UET requests (${uetReqs.length}):`);
  for (const u of uetReqs) console.log("   ", (u.match(/evt=[a-zA-Z]+|asc=[A-Z]|gasc=[A-Z]|cdb=[A-Za-z]+/g) ?? ["?"]).join(" "), u.slice(0, 120));
  console.log(`GA denied/consent pings (${gaPings.length}):`);
  for (const u of gaPings.slice(0, 4)) console.log("   ", (u.match(/gcs=G\d+|gcd=[^&]+/) ?? [""]).join(" "), u.slice(0, 110) + "…");
  console.log("forbidden first-party cookies:", forbidden1p.join(", ") || "(none)");
  console.log("forbidden third-party cookies:", forbidden3p.join(", ") || "(none)");
  console.log("UET cookies — real:", uetReal.join(", ") || "(none)", "| placeholders:", uetPlaceholder.join(", ") || "(none)");
  console.log("UET localStorage:", Object.keys(storage).join(", ") || "(none)", uetLsReal.length ? (denied ? "(real values — VIOLATION)" : "(real values — expected after consent)") : "");
  console.log("info (fraud-prevention carve-out):", info3p.join(", ") || "(none)");
  if (denied) {
    console.log(violations.length ? `VIOLATIONS: ${violations.length}` : "PASS — no consented tracking");
    for (const v of violations) console.log("   ", v);
  } else {
    console.log("accept state — tracking expected; review above for sanity");
  }

  await browser.close();
  return { scenario, violations: denied ? violations.length : null };
}

const results = [];
for (const scenario of ["none", "decline", "accept"]) {
  results.push(await audit(scenario));
}
console.log("\n===== summary =====");
let failed = false;
for (const r of results) {
  console.log(`${r.scenario}: ${r.violations === null ? "informational" : r.violations === 0 ? "PASS" : `FAIL (${r.violations} violations)`}`);
  if (r.violations) failed = true;
}
process.exit(failed ? 1 : 0);
