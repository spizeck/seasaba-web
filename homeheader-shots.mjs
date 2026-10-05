import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Issue #204 follow-up: homepage floating-pill polish (toggle tint + scroll
// compaction). Usage: BASE_URL=... OUT=review-shots/204c/after/ node ...
const BASE = process.env.BASE_URL ?? "http://localhost:3107";
const OUT = process.env.OUT ?? "review-shots/204c/after/";
mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { name: "390", viewport: { width: 390, height: 844 } },
  { name: "768", viewport: { width: 768, height: 800 } },
  { name: "1024", viewport: { width: 1024, height: 800 } },
  { name: "1440", viewport: { width: 1440, height: 900 } },
];

const browser = await chromium.launch();

const hideCookiebot = async (page) => {
  await page.addStyleTag({
    content:
      "#CybotCookiebotDialog,#CookiebotWidget,[id^='CybotCookiebot'],[id*='Cookiebot']{display:none!important}",
  }).catch(() => {});
};

for (const { name: wName, viewport } of WIDTHS) {
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1800);
    await hideCookiebot(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (overflow > 0) console.log(`home @${wName}: H-OVERFLOW ${overflow}px`);
    await page.screenshot({ path: `${OUT}home-${wName}-top.png` });
    // Scrolled past the 48px threshold -> compact pill.
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}home-${wName}-scrolled.png` });
  } catch (e) {
    console.log(`home @${wName}: FAILED ${e.message.split("\n")[0]}`);
  }
  await page.close();
}

// Mobile menu open: at top (transparent pill) and scrolled (compact pill).
for (const state of ["top", "scrolled"]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1800);
    await hideCookiebot(page);
    if (state === "scrolled") {
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(800);
    }
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}home-390-menu-${state}.png` });
  } catch (e) {
    console.log(`menu-${state}: FAILED ${e.message.split("\n")[0]}`);
  }
  await page.close();
}

// Short mobile viewport, compact state.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 560 } });
  try {
    await page.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1800);
    await hideCookiebot(page);
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}home-390-short-scrolled.png` });
  } catch (e) {
    console.log(`short: FAILED ${e.message.split("\n")[0]}`);
  }
  await page.close();
}

await browser.close();
console.log("done");
