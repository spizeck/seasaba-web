import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Issue #204 menu redesign: the mobile menu is a floating panel below the
// pill — the shell must not move or resize while it reveals. Verifies:
//   (a) shell geometry is identical before/during/after open and close
//   (b) the panel sits below the shell, fades+settles in < ~300ms
//   (c) Escape + rapid re-toggle keep working
//   (d) reduced motion: panel is at final opacity immediately
// Usage: BASE_URL=... OUT=review-shots/204f/ node verify-204f.mjs
const BASE = process.env.BASE_URL ?? "http://localhost:3107";
const OUT = process.env.OUT ?? "review-shots/204f/";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const hideCookiebot = async (page) => {
  await page.addStyleTag({
    content:
      "#CybotCookiebotDialog,#CookiebotWidget,[id^='CybotCookiebot'],[id*='Cookiebot']{display:none!important}",
  }).catch(() => {});
};

// Sample the shell's rect on consecutive frames around an action; returns
// true if it never moved.
async function shellStaysPut(page, action) {
  return page.evaluate(async (act) => {
    const shell = document.querySelector("header > div > div > div");
    const first = shell.getBoundingClientRect();
    const same = (r) =>
      r.x === first.x && r.y === first.y &&
      r.width === first.width && r.height === first.height;
    let stable = true;
    const probe = () => {
      if (!same(shell.getBoundingClientRect())) stable = false;
    };
    if (act === "open")
      document.querySelector('button[aria-controls="mobile-navigation"]').click();
    else if (act === "escape")
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    const frames = new Promise((done) => {
      let n = 0;
      const tick = () => (probe(), ++n < 30 ? requestAnimationFrame(tick) : done());
      requestAnimationFrame(tick);
    });
    await frames;
    return stable && same(shell.getBoundingClientRect());
  }, action);
}

for (const vp of [
  { width: 390, height: 844, name: "390" },
  { width: 768, height: 800, name: "768" },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  const toggle = page.getByRole("button", { name: "Open menu" });

  // (a)+(b) open: shell stays put, panel reveals below it.
  const openStable = await shellStaysPut(page, "open");
  await page.waitForTimeout(400);
  const geo = await page.evaluate(() => {
    const shell = document.querySelector("header > div > div > div").getBoundingClientRect();
    const nav = document.getElementById("mobile-navigation");
    const r = nav.getBoundingClientRect();
    return {
      gap: Math.round(r.top - shell.bottom),
      shellH: Math.round(shell.height),
      panelW: Math.round(r.width),
      shellW: Math.round(shell.width),
      bottom: Math.round(r.bottom),
      vh: innerHeight,
      opacity: getComputedStyle(nav).opacity,
    };
  });
  console.log(
    `home @${vp.name} open: shellStable=${openStable} gap=${geo.gap}px ` +
    `widths=${geo.panelW}/${geo.shellW} bottom=${geo.bottom}/${geo.vh} opacity=${geo.opacity}`
  );
  await page.screenshot({ path: `${OUT}home-${vp.name}-menu-open.png` });

  // (a) close via Escape: shell still put.
  const closeStable = await shellStaysPut(page, "escape");
  await page.waitForTimeout(300);
  const closed = await page.evaluate(() =>
    getComputedStyle(document.getElementById("mobile-navigation")).opacity
  );
  console.log(`home @${vp.name} esc-close: shellStable=${closeStable} opacity=${closed}`);

  // (c) rapid re-open right after close.
  await toggle.click();
  await page.waitForTimeout(60);
  await page.getByRole("button", { name: "Close menu" }).click();
  await page.waitForTimeout(60);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(400);
  const reopened = await page.evaluate(() =>
    getComputedStyle(document.getElementById("mobile-navigation")).opacity
  );
  console.log(`home @${vp.name} rapid-toggle: reopenedOpacity=${reopened}`);
  await page.close();
}

// Interior page: same checks + a mid-animation frame for the reveal feel.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + "/diving", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(90);
  await page.screenshot({ path: `${OUT}diving-390-menu-opening.png` });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}diving-390-menu-open.png` });
  // Menu link navigates and closes.
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "About" }).click();
  await page.waitForURL("**/about");
  console.log("diving link-nav: landed on /about");
  await page.close();
}

// (d) Reduced motion: state change is effectively instant.
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await hideCookiebot(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  // One frame after the click the panel must already be fully revealed.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const instant = await page.evaluate(() => {
    const nav = document.getElementById("mobile-navigation");
    const cs = getComputedStyle(nav);
    return { opacity: cs.opacity, translate: cs.translate, duration: cs.transitionDuration };
  });
  console.log(`reduced-motion open: opacity=${instant.opacity} translate=${instant.translate} duration=${instant.duration}`);
  await page.screenshot({ path: `${OUT}home-390-menu-reduced.png` });
  await ctx.close();
}

await browser.close();
console.log("done");
