import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Issue #204 final polish: verify (a) the close now travels only ~2px,
// (b) the menu toggle has no visible chrome of its own, (c) landscape +
// reduced motion + rapid toggling stay clean. Shots -> review-shots/204h/.
const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const OUT = process.env.OUT ?? "review-shots/204h/";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const hideCookiebot = async (page) => {
  await page.addStyleTag({
    content: "[id^='CybotCookiebot'],[id*='Cookiebot']{display:none!important}",
  }).catch(() => {});
};

const navStyle = () => {
  const nav = document.getElementById("mobile-navigation");
  const cs = getComputedStyle(nav);
  return { opacity: cs.opacity, visibility: cs.visibility, translate: cs.translate };
};

const toggleStyle = () => {
  const btn = document.querySelector('button[aria-controls="mobile-navigation"]');
  const cs = getComputedStyle(btn);
  const r = btn.getBoundingClientRect();
  return {
    w: Math.round(r.width), h: Math.round(r.height),
    bg: cs.backgroundColor, ringShadow: cs.boxShadow, color: cs.color,
  };
};

for (const [route, tag] of [["/diving", "diving"], ["/", "home"]]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + route, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);

  console.log(`${tag}: closed=${JSON.stringify(await page.evaluate(navStyle))}`);
  console.log(`${tag}: toggle=${JSON.stringify(await page.evaluate(toggleStyle))}`);
  await page.screenshot({ path: `${OUT}${tag}-390-closed.png` });

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(500);
  console.log(`${tag}: open=${JSON.stringify(await page.evaluate(navStyle))}`);
  console.log(`${tag}: toggle-open=${JSON.stringify(await page.evaluate(toggleStyle))}`);
  await page.screenshot({ path: `${OUT}${tag}-390-open.png` });

  await page.getByRole("button", { name: "Close menu" }).click();
  await page.waitForTimeout(60);
  console.log(`${tag}: midClose(60ms)=${JSON.stringify(await page.evaluate(navStyle))}`);
  await page.waitForTimeout(300);
  console.log(`${tag}: afterClose=${JSON.stringify(await page.evaluate(navStyle))}`);

  // Rapid toggling.
  for (let i = 0; i < 4; i++) {
    await page.locator('button[aria-controls="mobile-navigation"]').click();
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(500);
  const expanded = await page.locator('button[aria-controls="mobile-navigation"]').getAttribute("aria-expanded");
  console.log(`${tag}: rapid x4 -> expanded=${expanded} ${JSON.stringify(await page.evaluate(navStyle))}`);
  await page.close();
}

// Landscape.
{
  const page = await browser.newPage({ viewport: { width: 924, height: 412 } });
  await page.goto(BASE + "/diving", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  await page.screenshot({ path: `${OUT}diving-924x412-closed.png` });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const nav = document.getElementById("mobile-navigation");
    const r = nav.getBoundingClientRect();
    const book = nav.querySelector('a[href="/book"]').getBoundingClientRect();
    return { navBottom: Math.round(r.bottom), vh: innerHeight, bookBottom: Math.round(book.bottom) };
  });
  console.log(`landscape 924x412: navBottom=${m.navBottom}/${m.vh} bookBottom=${m.bookBottom}`);
  await page.screenshot({ path: `${OUT}diving-924x412-open.png` });
  await page.close();
}

// Reduced motion.
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto(BASE + "/diving", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(30);
  console.log(`reduced-motion open @30ms: ${JSON.stringify(await page.evaluate(navStyle))}`);
  await page.close();
}

await browser.close();
console.log("done");
