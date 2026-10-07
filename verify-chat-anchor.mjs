import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Chat launcher anchor verification: the launcher circle must keep one
// fixed viewport position across closed / teaser / open-panel states.
// Injects stand-in iframes at the vendor's measured geometries (closed
// 90x90 @ right/bottom:49px — the watcher marks it data-launcher-only;
// prompt ~330x179 @ right/bottom:43px; open panel placeholder) plus a
// blue marker at the iframe's bottom-right corner where the real circle
// sits, then screenshots each state at several viewports and reports the
// marker's distance from the viewport corner.
// Shots -> review-shots/chat-anchor/.
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const OUT = process.env.OUT ?? "review-shots/chat-anchor/";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const injectState = async (page, kind) => {
  await page.evaluate((k) => {
    document
      .querySelectorAll('iframe[title="Webchat Widget"], #anchor-marker')
      .forEach((el) => el.remove());
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    const geo = {
      closed: { state: "widgetClose", marked: true, w: 90, h: 90, inset: 49 },
      teaser: { state: "widgetClose", marked: false, w: 330, h: 179, inset: 43 },
      open: { state: "widgetOpen", marked: false, w: 380, h: 580, inset: 43 },
    }[k];
    f.setAttribute("state", geo.state);
    if (geo.marked) f.setAttribute("data-launcher-only", "");
    f.style.cssText = `position:fixed;bottom:${geo.inset}px;right:${geo.inset}px;width:${geo.w}px;height:${geo.h}px;border:0;z-index:9999;outline:1px dashed rgba(0,0,0,.25)`;
    document.body.appendChild(f);
    // Marker stands in for the launcher circle: ~58px diameter sitting
    // ~5px inside the iframe's bottom-right corner.
    const m = document.createElement("div");
    m.id = "anchor-marker";
    const r = f.getBoundingClientRect();
    m.style.cssText = `position:fixed;left:${r.right - 63}px;top:${r.bottom - 63}px;width:58px;height:58px;border-radius:50%;background:#0b72de;z-index:10000;pointer-events:none`;
    document.body.appendChild(m);
  }, kind);
};

const markerAnchor = (page) =>
  page.evaluate(() => {
    const m = document.getElementById("anchor-marker");
    const f = document.querySelector('iframe[title="Webchat Widget"]');
    if (!m || !f) return null;
    const r = m.getBoundingClientRect();
    const fr = f.getBoundingClientRect();
    return {
      markerBottom: +(innerHeight - r.bottom).toFixed(1),
      markerRight: +(innerWidth - r.right).toFixed(1),
      markerCenterX: +(r.left + r.width / 2).toFixed(1),
      markerCenterY: +(r.top + r.height / 2).toFixed(1),
      iframeBottom: +(innerHeight - fr.bottom).toFixed(1),
      iframeRight: +(innerWidth - fr.right).toFixed(1),
    };
  });

const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: vp });
  await page.goto(BASE + "/diving", { waitUntil: "load" });
  await page.waitForTimeout(600);
  // Scroll past nothing — interior pages show the launcher immediately.
  for (const kind of ["closed", "teaser", "open"]) {
    await injectState(page, kind);
    await page.waitForTimeout(250);
    const a = await markerAnchor(page);
    await page.screenshot({ path: `${OUT}${vp.name}-${kind}.png` });
    console.log(vp.name, kind, JSON.stringify(a));
  }
  await page.close();
}

await browser.close();
