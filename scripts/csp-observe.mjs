// CSP diagnostic: capture third-party request hosts + CSP violations on a
// target deployment, attributed to the top-level page (governed by our CSP)
// vs named iframes (governed by the frame's own CSP). Usage:
//
//   node scripts/csp-observe.mjs [url]     (default https://www.seasaba.com)
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "https://www.seasaba.com";
const top = new Map();
const framed = new Map(); // iframe host -> Map(host -> types)
const violations = [];

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("request", (req) => {
  const url = new URL(req.url());
  if (url.origin === new URL(BASE).origin) return;
  const frame = req.frame();
  const frameHost = frame && frame.url() ? new URL(frame.url()).host : "?";
  const map = frameHost === new URL(BASE).host ? top : framed;
  if (!map.has(frameHost === new URL(BASE).host ? url.host : frameHost)) {
    map.set(frameHost === new URL(BASE).host ? url.host : frameHost, frameHost === new URL(BASE).host ? new Set() : new Map());
  }
  if (frameHost === new URL(BASE).host) {
    top.get(url.host).add(req.resourceType());
  } else {
    const inner = framed.get(frameHost);
    if (!inner.has(url.host)) inner.set(url.host, new Set());
    inner.get(url.host).add(req.resourceType());
  }
});
page.on("console", (msg) => {
  if (/content.security.policy|refused to|violat|evalerror/i.test(msg.text()))
    violations.push(`[${new URL(page.url()).pathname}] ${msg.text()}`);
});

const routes = ["/", "/book", "/dive-sites", "/cookie-policy", "/dive-log", "/contact"];
for (const r of routes) {
  await page.goto(BASE + r, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
}

// Try to open a YouTube dive-site modal (only sites with videoId embed).
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

console.log("=== TOP-LEVEL third-party hosts (governed by our CSP) ===");
for (const [h, t] of [...top].sort()) console.log(`${h}  <- ${[...t].sort().join(",")}`);
console.log("\n=== INSIDE IFRAMES (governed by the frame's own CSP) ===");
for (const [fh, inner] of [...framed].sort()) {
  console.log(`[iframe ${fh}]`);
  for (const [h, t] of [...inner].sort()) console.log(`  ${h}  <- ${[...t].sort().join(",")}`);
}
console.log("\n=== CSP/console violations ===");
console.log(violations.length ? violations.join("\n") : "(none)");
