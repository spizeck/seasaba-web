import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Measure the REAL launcher circle's pixel clearance on production, per
// state. The circle is dark navy inside a cross-origin iframe, so we scan
// a corner screenshot for its pixel extent. Iframe edge geometry comes
// from getBoundingClientRect (includes our deployed CSS translate).
const URL = process.env.PROD_URL ?? "https://www.seasaba.com";
const OUT = "review-shots/chat-anchor-prod/";
mkdirSync(OUT, { recursive: true });

const VP = { width: 1440, height: 900 };

async function scanCircle(page, tag) {
  const geo = await page.evaluate(() => {
    const f = document.querySelector('iframe[title="Webchat Widget"]');
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return {
      state: f.getAttribute("state"),
      right: +(innerWidth - r.right).toFixed(1),
      bottom: +(innerHeight - r.bottom).toFixed(1),
      w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      transform: getComputedStyle(f).transform,
      cssText: f.style.cssText,
    };
  });
  if (!geo) { console.log(tag, "no iframe"); return; }
  const clip = { x: VP.width - 400, y: VP.height - 300, width: 400, height: 300 };
  const buf = await page.screenshot({ path: `${OUT}1440-${tag}.png`, clip });
  const px = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = "data:image/png;base64," + b64; });
    const cv = document.createElement("canvas");
    cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let maxX = -1, maxY = -1, minX = 1e9, minY = 1e9, count = 0;
    for (let y = 0; y < cv.height; y++) {
      for (let x = 0; x < cv.width; x++) {
        const i = (y * cv.width + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // dark navy circle fill: blue-dominant, dark overall
        if (b > 90 && b > r * 1.5 && b > g * 1.4 && r < 90 && g < 90) {
          count++;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
        }
      }
    }
    return count < 500 ? null : { minX, maxX, minY, maxY, count };
  }, buf.toString("base64"));
  if (!px) {
    console.log(tag, "iframe:", JSON.stringify(geo), "| no circle pixels found");
    return;
  }
  const circleRight = VP.width - (clip.x + px.maxX);
  const circleBottom = VP.height - (clip.y + px.maxY);
  console.log(
    `${tag}: circle right=${circleRight}px bottom=${circleBottom}px ` +
    `d=${px.maxX - px.minX + 1}x${px.maxY - px.minY + 1} ` +
    `| iframe edge=${geo.right}/${geo.bottom} state=${geo.state} ` +
    `transform=${geo.transform} inline=[${geo.cssText}]`
  );
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VP });
await page.goto(URL + "/diving", { waitUntil: "load" });
await page.waitForSelector('iframe[title="Webchat Widget"]', { timeout: 20000 });
await page.waitForTimeout(800);   // before the proactive prompt pops
await scanCircle(page, "closed-initial");

// Wait for the teaser, then scan.
for (let i = 0; i < 30; i++) {
  await page.waitForTimeout(1000);
  const big = await page.evaluate(() => {
    const f = document.querySelector('iframe[title="Webchat Widget"]');
    return f && f.getBoundingClientRect().width > 120;
  });
  if (big) break;
}
await page.waitForTimeout(500);
await scanCircle(page, "teaser");

await page.evaluate(() => window.$respond?.do("chat:open"));
await page.waitForTimeout(2500);
await scanCircle(page, "open");

await page.evaluate(() => window.$respond?.do("chat:close"));
await page.waitForTimeout(1500);
await scanCircle(page, "closed-after");

await browser.close();
