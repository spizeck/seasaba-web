import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Issue #204 polish pass: verify (a) interior pages share the homepage's
// compact scrolled geometry, (b) the mobile menu reveals by position with
// only a narrow opacity range, (c) the section-nav stuck gap is preserved,
// (d) reduced motion is instant. Screenshots land in review-shots/204g/.
const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const OUT = process.env.OUT ?? "review-shots/204g/after/";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const hideCookiebot = async (page) => {
  await page.addStyleTag({
    content: "[id^='CybotCookiebot'],[id*='Cookiebot']{display:none!important}",
  }).catch(() => {});
};

const barGeo = () => {
  const bar = document.querySelector("header > div > div > div > div");
  const logo = document.querySelector("header img");
  const nav = document.querySelector('nav[aria-label="On this page"]');
  const br = bar.getBoundingClientRect();
  const lr = logo.getBoundingClientRect();
  return {
    barH: Math.round(br.height),
    barTop: Math.round(br.top),
    logoH: Math.round(lr.height),
    sectionNavTop: nav ? Math.round(nav.getBoundingClientRect().top) : null,
  };
};

// (a) Bar/logo geometry: homepage top vs scrolled vs interior pages.
for (const route of ["/", "/diving", "/plan-your-trip", "/partners", "/visiting-yachts"]) {
  for (const vp of [
    { width: 1440, height: 900, name: "1440" },
    { width: 1024, height: 800, name: "1024" },
    { width: 390, height: 844, name: "390" },
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await hideCookiebot(page);
    const top = await page.evaluate(barGeo);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    await page.waitForTimeout(700);
    const scrolled = await page.evaluate(barGeo);
    const tag = route === "/" ? "home" : route.slice(1);
    console.log(
      `${tag} @${vp.name}: top bar=${top.barH} logo=${top.logoH} navTop=${top.sectionNavTop}` +
      ` | scrolled bar=${scrolled.barH} logo=${scrolled.logoH} navTop=${scrolled.sectionNavTop}`
    );
    if (vp.name === "1440") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}${tag}-1440-top.png` });
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${OUT}${tag}-1440-scrolled.png` });
    }
    await page.close();
  }
}

// (b) Mobile menu reveal: closed rest state, mid-transition opacity,
// settled state, and close behavior — on a light interior pill and the
// dark hero pill.
for (const [route, tag] of [["/diving", "diving"], ["/", "home"]]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + route, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);

  const style = () => {
    const nav = document.getElementById("mobile-navigation");
    const cs = getComputedStyle(nav);
    return { opacity: cs.opacity, visibility: cs.visibility, translate: cs.translate };
  };

  const closed = await page.evaluate(style);
  await page.screenshot({ path: `${OUT}${tag}-390-closed.png` });

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(60);
  const midOpen = await page.evaluate(style);
  await page.screenshot({ path: `${OUT}${tag}-390-midopen.png` });
  await page.waitForTimeout(400);
  const open = await page.evaluate(style);
  await page.screenshot({ path: `${OUT}${tag}-390-open.png` });

  await page.getByRole("button", { name: "Close menu" }).click();
  await page.waitForTimeout(60);
  const midClose = await page.evaluate(style);
  await page.waitForTimeout(300);
  const afterClose = await page.evaluate(style);

  // Rapid toggling: hammer the toggle, confirm no stuck state.
  for (let i = 0; i < 4; i++) {
    await page.locator('button[aria-controls="mobile-navigation"]').click();
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(600);
  const rapidEnd = await page.evaluate(style);
  const expanded = await page.locator('button[aria-controls="mobile-navigation"]').getAttribute("aria-expanded");

  console.log(`${tag} @390 menu:`);
  console.log(`  closed=${JSON.stringify(closed)}`);
  console.log(`  midOpen(60ms)=${JSON.stringify(midOpen)}`);
  console.log(`  open=${JSON.stringify(open)}`);
  console.log(`  midClose(60ms)=${JSON.stringify(midClose)}`);
  console.log(`  afterClose=${JSON.stringify(afterClose)}`);
  console.log(`  rapid x4 -> expanded=${expanded} ${JSON.stringify(rapidEnd)}`);
  await page.close();
}

// (c) Landscape menu bounds.
{
  const page = await browser.newPage({ viewport: { width: 924, height: 412 } });
  await page.goto(BASE + "/diving", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(600);
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

// (d) Reduced motion: state change must be instant, no transition residue.
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto(BASE + "/diving", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(30); // one frame-ish: must already be settled
  const rm = await page.evaluate(() => {
    const nav = document.getElementById("mobile-navigation");
    const cs = getComputedStyle(nav);
    return { opacity: cs.opacity, visibility: cs.visibility, translate: cs.translate };
  });
  console.log(`reduced-motion open @30ms: ${JSON.stringify(rm)}`);
  await page.close();
}

await browser.close();
console.log("done");
