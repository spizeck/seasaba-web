import { chromium } from "playwright";

// Measure the REAL Respond.io vendor iframe on production in each state.
// Run during the #235 rollback: our own translate on top of the vendor's
// inline right/bottom is visible in getBoundingClientRect, so the raw
// vendor inset = rect offset minus the CSS translate.
const URL = process.env.PROD_URL ?? "https://www.seasaba.com";

const probe = () => {
  const f = document.querySelector('iframe[title="Webchat Widget"]');
  if (!f) return null;
  const cs = getComputedStyle(f);
  const r = f.getBoundingClientRect();
  // getBoundingClientRect includes our anchor translate, so the measured
  // gap is the anchored inset — add the translate back to recover the
  // vendor's own inline inset.
  const m = /matrix\(1,\s*0,\s*0,\s*1,\s*(-?[\d.]+),\s*(-?[\d.]+)\)/.exec(
    cs.transform
  );
  const tx = m ? +m[1] : 0;
  const ty = m ? +m[2] : 0;
  return {
    state: f.getAttribute("state"),
    launcherOnly: f.hasAttribute("data-launcher-only"),
    cssText: f.style.cssText,
    width: +r.width.toFixed(1),
    height: +r.height.toFixed(1),
    anchoredBottom: +(innerHeight - r.bottom).toFixed(1),
    anchoredRight: +(innerWidth - r.right).toFixed(1),
    vendorBottom: +(innerHeight - r.bottom + ty).toFixed(1),
    vendorRight: +(innerWidth - r.right + tx).toFixed(1),
    transform: cs.transform,
    clipPath: cs.clipPath,
  };
};

for (const [name, vp] of [
  ["mobile-390", { width: 390, height: 844 }],
  ["tablet-768", { width: 768, height: 1024 }],
  ["desktop-1440", { width: 1440, height: 900 }],
  ["mobile-landscape", { width: 844, height: 390 }],
]) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: vp });
  await page.goto(URL + "/diving", { waitUntil: "load" });
  // Widget injects on window load; give the CDN iframe a moment.
  let s = null;
  for (let i = 0; i < 30 && !s; i++) {
    s = await page.evaluate(probe);
    if (!s) await page.waitForTimeout(500);
  }
  console.log(`\n=== ${name} ${vp.width}x${vp.height} ===`);
  console.log("closed:", JSON.stringify(s));

  if (s) {
    // Watch for the teaser: the same iframe grows taller while staying
    // state=widgetClose. Sample for up to 30s.
    let teaser = null;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      const cur = await page.evaluate(probe);
      if (cur && cur.state === "widgetClose" && (cur.width > 120 || cur.height > 120)) {
        teaser = cur;
        break;
      }
    }
    console.log("teaser:", JSON.stringify(teaser));

    // Open the chat via the public API, then measure the open panel.
    const opened = await page.evaluate(() => {
      const r = window.$respond;
      if (!r) return "no $respond";
      try {
        r.do("chat:open");
        return "ok";
      } catch (e) {
        return String(e);
      }
    });
    console.log("open call:", opened);
    await page.waitForTimeout(2500);
    console.log("open:", JSON.stringify(await page.evaluate(probe)));

    // Close it again and measure the return-to-closed position.
    await page.evaluate(() => window.$respond?.do("chat:close"));
    await page.waitForTimeout(1500);
    console.log("after close:", JSON.stringify(await page.evaluate(probe)));
  }
  await browser.close();
}
