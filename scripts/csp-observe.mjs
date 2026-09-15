// CSP diagnostic: capture third-party request hosts + CSP violations on a
// target deployment, attributed to the top-level page (governed by our CSP)
// vs named iframes (governed by the frame's own CSP). Usage:
//
//   node scripts/csp-observe.mjs [url]     (default https://www.seasaba.com)
//
// With --enforce <path-to-next.config.ts-build> the document's CSP header is
// replaced by the policy that the checked-out next.config produces, letting
// you trial a hardened policy against the live site and its real GTM tags.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "https://www.seasaba.com";
const enforce = process.argv.includes("--enforce");

// Mirror of next.config.ts CSP (production variant). Kept in sync manually
// for diagnostic use only.
const NEW_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' seasaba.checkfront.com https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://*.doubleclick.net https://www.google.com https://*.clarity.ms https://bat.bing.com https://connect.facebook.net https://consent.cookiebot.com https://consentcdn.cookiebot.com https://vercel.live",
  "style-src 'self' 'unsafe-inline' https://consentcdn.cookiebot.com",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' seasaba.checkfront.com https://firestore.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googleadservices.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://www.google.com https://*.clarity.ms https://bat.bing.com https://connect.facebook.net https://www.facebook.com https://consent.cookiebot.com https://consentcdn.cookiebot.com",
  "frame-src 'self' seasaba.checkfront.com https://www.googletagmanager.com https://www.youtube.com https://www.google.com https://*.doubleclick.net https://consentcdn.cookiebot.com",
  "media-src 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const top = new Map();
const framed = new Map();
const violations = [];

const browser = await chromium.launch();
const page = await browser.newPage();

if (enforce) {
  await page.route("**/*", async (route) => {
    const req = route.request();
    const sameOrigin = new URL(req.url()).origin === new URL(BASE).origin;
    if (req.resourceType() === "document" && sameOrigin) {
      const res = await route.fetch();
      const headers = { ...res.headers(), "content-security-policy": NEW_CSP };
      await route.fulfill({ response: res, headers });
    } else {
      await route.continue();
    }
  });
}

page.on("request", (req) => {
  const url = new URL(req.url());
  if (url.origin === new URL(BASE).origin) return;
  const frame = req.frame();
  const frameHost = frame && frame.url() ? new URL(frame.url()).host : "?";
  const isTop = frameHost === new URL(BASE).host;
  if (isTop) {
    if (!top.has(url.host)) top.set(url.host, new Set());
    top.get(url.host).add(req.resourceType());
  } else {
    if (!framed.has(frameHost)) framed.set(frameHost, new Map());
    const inner = framed.get(frameHost);
    if (!inner.has(url.host)) inner.set(url.host, new Set());
    inner.get(url.host).add(req.resourceType());
  }
});
page.on("console", (msg) => {
  if (/content.security.policy|refused to|violat|evalerror|eval\(/i.test(msg.text()))
    violations.push(`[${new URL(page.url()).pathname}] ${msg.text()}`);
});

const routes = ["/", "/book", "/dive-sites", "/cookie-policy", "/dive-log", "/contact"];
for (const r of routes) {
  await page.goto(BASE + r, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
}

await page.goto(BASE + "/dive-sites", { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(2000);
const chips = page.locator("main button");
const n = await chips.count();
for (let i = 0; i < Math.min(n, 12); i++) {
  await chips.nth(i).click().catch(() => {});
  await page.waitForTimeout(2500);
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
}

await browser.close();

console.log(`=== TOP-LEVEL third-party hosts ${enforce ? "(new CSP enforced)" : "(current CSP)"} ===`);
for (const [h, t] of [...top].sort()) console.log(`${h}  <- ${[...t].sort().join(",")}`);
console.log("\n=== INSIDE IFRAMES ===");
for (const [fh, inner] of [...framed].sort()) {
  console.log(`[iframe ${fh}]`);
  for (const [h, t] of [...inner].sort()) console.log(`  ${h}  <- ${[...t].sort().join(",")}`);
}
console.log("\n=== CSP/console violations ===");
console.log(violations.length ? violations.join("\n") : "(none)");
