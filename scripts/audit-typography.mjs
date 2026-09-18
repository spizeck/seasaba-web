// Typography audit — computed-style inventory for issue #112.
//
// Renders representative pages in headless Chromium at several viewport
// widths and records the computed font-family / size / weight / line-height
// of canonical elements (h1/h2/h3, body paragraphs, nav, buttons, form
// fields, footer). Also probes which locally-installed fonts in the heading
// stack actually resolve on this machine, and which webfonts the browser
// loaded (document.fonts).
//
// Usage:
//   next start --hostname 127.0.0.1 --port 3100   (production build)
//   node scripts/audit-typography.mjs [baseURL]
//
// Prints a JSON report to stdout. Read-only; exits 0 always.

import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://127.0.0.1:3100";

const PAGES = [
  "/",
  "/diving",
  "/courses",
  "/plan-your-trip",
  "/visiting-yachts",
  "/contact",
  "/book",
  "/privacy",
  "/terms",
];

const WIDTHS = [320, 375, 430, 768, 1024, 1440];

// Canonical probes: [role, selector, note]. First match per page is sampled.
const PROBES = [
  ["h1", "main h1", "page/hero title"],
  ["h2", "main h2", "first section heading"],
  ["h3", "main h3", "first sub-heading"],
  ["body-p", "main p", "first paragraph in main"],
  ["nav-link", "header nav a", "primary nav link"],
  ["cta-button", "header a[href='/book'], main a[href='/book']", "book CTA"],
  ["form-label", "label", "first form label"],
  ["form-input", "input", "first text input"],
  ["footer-link", "footer a", "first footer link"],
  ["footer-heading", "footer p", "footer column heading"],
  ["caption", "footer div p", "copyright line"],
];

const browser = await chromium.launch();

// --- 1. Which local fonts in the heading stack resolve on THIS machine ------
const page = await browser.newPage();
await page.goto(BASE + "/");
const localFontProbe = await page.evaluate(() => {
  // Canvas-measure trick: a font "exists" locally if measuring text in
  // `"<name>", monospace` differs from plain `monospace` (or serif).
  const ctx = document.createElement("canvas").getContext("2d");
  const testString = "mmmmmmmmmmlli WwWwWw 0123456789";
  const measure = (font) => {
    ctx.font = `72px ${font}`;
    return ctx.measureText(testString).width;
  };
  const baselines = { monospace: measure("monospace"), serif: measure("serif"), "sans-serif": measure("sans-serif") };
  const available = (name) => {
    for (const base of ["monospace", "serif", "sans-serif"]) {
      if (measure(`'${name}', ${base}`) !== baselines[base]) return true;
    }
    return false;
  };
  const candidates = ["Century Gothic", "CenturyGothic", "AppleGothic", "Poppins", "Open Sans", "Inter"];
  const result = {};
  for (const c of candidates) result[c] = available(c);
  // Which webfonts did the browser actually load (FontFaceSet)?
  const loaded = [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.style} ${f.status}`);
  return { localAvailability: result, documentFonts: loaded };
});

// --- 2. Which stack entry wins for a rendered heading? ----------------------
// Compare the h1's computed stack against a probe element forced to each
// single family, measuring identical text — first entry whose metrics match
// the heading's metrics is the one that actually rendered.
const headingResolution = await page.evaluate(() => {
  const h1 = document.querySelector("main h1");
  if (!h1) return null;
  const text = h1.textContent.trim();
  const computed = getComputedStyle(h1);
  const mk = (family) => {
    const el = document.createElement("span");
    el.textContent = text;
    el.style.cssText = `position:absolute;visibility:hidden;font-family:${family};font-size:${computed.fontSize};font-weight:${computed.fontWeight};font-style:${computed.fontStyle};letter-spacing:${computed.letterSpacing}`;
    document.body.appendChild(el);
    const w = el.getBoundingClientRect().width;
    el.remove();
    return w;
  };
  const rendered = mk(computed.fontFamily);
  const entries = ["'Century Gothic'", "'CenturyGothic'", "'AppleGothic'", "'Poppins'", "sans-serif"];
  const widths = Object.fromEntries(entries.map((e) => [e, mk(e)]));
  const resolved = entries.find((e) => Math.abs(widths[e] - rendered) < 0.5) ?? "unknown";
  return { declaredStack: computed.fontFamily, text, widths, resolved };
});

// --- 3. Computed styles per page per width ----------------------------------
const report = {};
for (const width of WIDTHS) {
  const ctx2 = await browser.newContext({ viewport: { width, height: 900 } });
  const p = await ctx2.newPage();
  for (const route of PAGES) {
    await p.goto(BASE + route, { waitUntil: "domcontentloaded" });
    const key = `${route} @${width}`;
    report[key] = await p.evaluate((probes) => {
      const out = {};
      for (const [role, sel] of probes) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const cs = getComputedStyle(el);
        out[role] = {
          tag: el.tagName.toLowerCase(),
          family: cs.fontFamily.length > 60 ? cs.fontFamily.slice(0, 60) + "…" : cs.fontFamily,
          size: cs.fontSize,
          weight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          text: el.textContent.trim().slice(0, 40),
        };
      }
      return out;
    }, PROBES);
  }
  await ctx2.close();
}

await browser.close();
console.log(JSON.stringify({ base: BASE, localFontProbe, headingResolution, report }, null, 2));
