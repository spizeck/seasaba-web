import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Issue #204 follow-up: PageSectionNav ↔ floating header interface shots.
const BASE = process.env.BASE_URL ?? "http://localhost:3105";
const OUT = process.env.OUT ?? "review-shots/204e/after/";
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["/plan-your-trip", "plan-your-trip"],
  ["/diving", "diving"],
  ["/partners", "partners"],
  ["/visiting-yachts", "visiting-yachts"],
];

const WIDTHS = [
  { name: "390", viewport: { width: 390, height: 844 } },
  { name: "768", viewport: { width: 768, height: 800 } },
  { name: "924x412", viewport: { width: 924, height: 412 } },
  { name: "1024", viewport: { width: 1024, height: 800 } },
  { name: "1440", viewport: { width: 1440, height: 900 } },
];

const browser = await chromium.launch();

const hideCookiebot = async (page) => {
  await page.addStyleTag({
    content:
      "#CybotCookiebotDialog,#CookiebotWidget,#cookie-banner,[id^='CybotCookiebot'],[id*='Cookiebot']{display:none!important}",
  }).catch(() => {});
};

for (const { name: wName, viewport } of WIDTHS) {
  const page = await browser.newPage({ viewport });
  for (const [route, slug] of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(1800);
      await hideCookiebot(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (overflow > 0) console.log(`${slug} @${wName}: H-OVERFLOW ${overflow}px`);
      await page.screenshot({ path: `${OUT}${slug}-${wName}-top.png` });
      // Scrolled: both sticky layers visible over mid-page content.
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${OUT}${slug}-${wName}-scrolled.png` });
    } catch (e) {
      console.log(`${slug} @${wName}: FAILED ${e.message.split("\n")[0]}`);
    }
  }
  await page.close();
}

// Anchor landing: click a section pill, let it settle, shoot the result.
for (const w of [390, 1024]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  await page.goto(BASE + "/plan-your-trip", { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(1800);
  await hideCookiebot(page);
  await page.getByRole("button", { name: "Where to Stay" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}plan-your-trip-${w}-anchor-landing.png` });
  await page.close();
}

// Short mobile viewport, stuck state.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 560 } });
  await page.goto(BASE + "/plan-your-trip", { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(1800);
  await hideCookiebot(page);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}plan-your-trip-short-scrolled.png` });
  await page.close();
}

await browser.close();
console.log("done");
