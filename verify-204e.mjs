import { chromium } from "playwright";

// Issue #204 final pass: verify (a) open menu stays inside short viewports
// with Book Now reachable, (b) section nav is one scrolling row, (c) anchors
// land below the stuck strip.
const BASE = process.env.BASE_URL ?? "http://localhost:3107";
const browser = await chromium.launch();

const hideCookiebot = async (page) => {
  await page.addStyleTag({
    content: "[id^='CybotCookiebot'],[id*='Cookiebot']{display:none!important}",
  }).catch(() => {});
};

// (a) Menu bounds + Book Now reachability at short viewports.
for (const vp of [
  { width: 924, height: 412, name: "924x412" },
  { width: 812, height: 300, name: "812x300" },
  { width: 667, height: 250, name: "667x250" },
  { width: 390, height: 844, name: "390x844" },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const nav = document.getElementById("mobile-navigation");
    const r = nav.getBoundingClientRect();
    const book = nav.querySelector('a[href="/book"]');
    const br = book.getBoundingClientRect();
    return { navBottom: r.bottom, vh: innerHeight, bookBottom: br.bottom, bookVisible: br.bottom <= innerHeight && br.top >= 0 };
  });
  // Scroll the menu to its end, then re-check Book Now.
  await page.evaluate(() => {
    const el = document.getElementById("mobile-navigation").firstElementChild;
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => {
    const nav = document.getElementById("mobile-navigation");
    const r = nav.getBoundingClientRect();
    const book = nav.querySelector('a[href="/book"]');
    const br = book.getBoundingClientRect();
    return { navBottom: Math.round(r.bottom), vh: innerHeight, bookBottom: Math.round(br.bottom), bookTop: Math.round(br.top) };
  });
  console.log(`${vp.name}: navBottom=${m.navBottom}/${m.vh} bookVisibleInitially=${m.bookVisible} | scrolled-end bookBottom=${after.bookBottom} navBottom=${after.navBottom}`);
  await page.close();
}

// (b) Section nav single-row + horizontal scroll at all widths on all routes.
for (const route of ["/plan-your-trip", "/diving", "/partners", "/visiting-yachts"]) {
  for (const vp of [
    { width: 390, height: 844 }, { width: 768, height: 800 },
    { width: 924, height: 412 }, { width: 1024, height: 800 },
    { width: 1440, height: 900 },
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await hideCookiebot(page);
    const info = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="On this page"]');
      const row = nav.querySelector("button").parentElement;
      const tops = new Set([...nav.querySelectorAll("button")].map((p) => Math.round(p.getBoundingClientRect().top)));
      return {
        rows: tops.size,
        canScroll: row.scrollWidth - row.clientWidth > 4,
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    if (info.rows !== 1 || info.docOverflow > 0)
      console.log(`${route} @${vp.width}: rows=${info.rows} scroll=${info.canScroll} docOverflow=${info.docOverflow}  <-- PROBLEM`);
    else
      console.log(`${route} @${vp.width}: rows=1 scroll=${info.canScroll} docOverflow=0 ok`);
    await page.close();
  }
}

// (c) Anchor landing: strip bottom vs heading top after pill click.
for (const [route, pill] of [["/plan-your-trip", "Where to Stay"], ["/visiting-yachts", "Clearance"]]) {
  for (const vp of [{ width: 390, height: 844 }, { width: 1024, height: 800 }]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await hideCookiebot(page);
    try {
      await page.getByRole("button", { name: pill, exact: true }).click({ timeout: 5000 });
    } catch {
      // fall back to first pill
      await page.locator('nav[aria-label="On this page"] button').first().click();
    }
    await page.waitForTimeout(1500);
    const geo = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="On this page"]');
      const navBottom = nav.getBoundingClientRect().bottom;
      const header = document.querySelector("header > div > div").getBoundingClientRect();
      // first heading below the nav
      const h = [...document.querySelectorAll("h2")].find((e) => e.getBoundingClientRect().top > 60);
      return { navBottom: Math.round(navBottom), headerBottom: Math.round(header.bottom), headingTop: h ? Math.round(h.getBoundingClientRect().top) : null };
    });
    console.log(`${route} @${vp.width}: headerBottom=${geo.headerBottom} navBottom=${geo.navBottom} headingTop=${geo.headingTop}`);
    await page.close();
  }
}

await browser.close();
console.log("done");
