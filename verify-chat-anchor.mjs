import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Chat launcher anchor verification (corrective rework after #235): the
// launcher circle must keep one fixed viewport position across
// closed / teaser / open-panel states. Injects stand-in iframes at the
// vendor's measured production geometries (closed 90x90, prompt
// ~330x178, open ~400x600 — all at inline right/bottom:43px; plus the
// 25px mount transient), lets the real geometry watcher apply
// `data-launcher-only` + the shared-anchor translate (edge lands at
// RESPOND_IO_ANCHOR_RIGHT_PX / _BOTTOM_PX = 18px / 6px), then drops a
// marker where the real
// circle sits (~58px, ~4px inside the iframe's bottom-right corner) and
// screenshots each state at several viewports, reporting the marker's
// distance from the viewport corner.
// Shots -> review-shots/chat-anchor/.
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const OUT = process.env.OUT ?? "review-shots/chat-anchor/";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const injectState = async (page, kind) => {
  const anchored = await page.evaluate((k) => {
    document
      .querySelectorAll('iframe[title="Webchat Widget"], #anchor-marker')
      .forEach((el) => el.remove());
    const f = document.createElement("iframe");
    f.title = "Webchat Widget";
    const geo = {
      closed: { state: "widgetClose", w: 90, h: 90, inset: 43 },
      transient: { state: "widgetClose", w: 90, h: 90, inset: 25 },
      teaser: { state: "widgetClose", w: 330, h: 178, inset: 43 },
      // Production: the open panel is ~400x600 @ 43px on tablet/desktop,
      // but full-bleed right/bottom:0 on small portrait viewports.
      open:
        innerWidth < 600
          ? { state: "widgetOpen", w: innerWidth, h: innerHeight, inset: 0 }
          : { state: "widgetOpen", w: 400, h: 600, inset: 43 },
    }[k];
    f.setAttribute("state", geo.state);
    f.style.cssText = `position:fixed;bottom:${geo.inset}px;right:${geo.inset}px;width:${geo.w}px;height:${geo.h}px;border:0;z-index:9999;outline:1px dashed rgba(0,0,0,.25)`;
    document.body.appendChild(f);
    return geo.inset > 1; // whether the watcher is expected to translate
  }, kind);
  if (anchored) {
    // Wait for the watcher to attach and apply the anchor translate.
    await page.waitForFunction(
      () => {
        const f = document.querySelector('iframe[title="Webchat Widget"]');
        return f instanceof HTMLIFrameElement && f.style.transform !== "";
      },
      { timeout: 5000 }
    );
  } else {
    // Full-bleed state is intentionally left at vendor geometry — give
    // the watcher a beat to attach, then verify it stayed untransformed.
    await page.waitForTimeout(400);
  }
  // Marker stands in for the launcher circle: ~58px diameter sitting
  // ~4px inside the iframe's (already transformed) bottom-right corner.
  await page.evaluate(() => {
    const f = document.querySelector('iframe[title="Webchat Widget"]');
    const r = f.getBoundingClientRect();
    const m = document.createElement("div");
    m.id = "anchor-marker";
    m.style.cssText = `position:fixed;left:${r.right - 62}px;top:${r.bottom - 62}px;width:58px;height:58px;border-radius:50%;background:#0b72de;z-index:2147483600;pointer-events:none`;
    document.body.appendChild(m);
  });
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
      transform: getComputedStyle(f).transform,
      launcherOnly: f.hasAttribute("data-launcher-only"),
    };
  });

const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-land-844", width: 844, height: 390 },
];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: vp });
  await page.goto(BASE + "/diving", { waitUntil: "load" });
  await page.waitForTimeout(600);
  // Scroll past nothing — interior pages show the launcher immediately.
  for (const kind of ["closed", "transient", "teaser", "open"]) {
    await injectState(page, kind);
    await page.waitForTimeout(150);
    const a = await markerAnchor(page);
    await page.screenshot({ path: `${OUT}${vp.name}-${kind}.png` });
    console.log(vp.name, kind, JSON.stringify(a));
  }
  await page.close();
}

await browser.close();
