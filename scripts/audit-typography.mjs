// Typography audit — computed-style inventory for issue #112.
//
// Renders every public page in headless Chromium at several viewport widths
// and records the computed font-family / size / weight / line-height of
// canonical elements (h1/h2/h3, body paragraphs, nav, buttons, form fields,
// footer). Also probes which locally-installed fonts in the heading stack
// resolve on this machine, which webfont faces the browser actually loaded
// (vs merely declared), which font files were fetched over the network, and
// how the next/font CSS variable scopes across <html>/<body>.
//
// Usage:
//   next start --hostname 127.0.0.1 --port 3100   (production build)
//   node scripts/audit-typography.mjs [baseURL]
//
// Prints a JSON report to stdout.
//
// Exit behavior: exits 1 if the server cannot be reached or if any route or
// probe fails — failures are still recorded under `errors` in the JSON so
// partial evidence remains inspectable, but a failed audit can never be
// mistaken for a clean one. Exits 0 only when every probe succeeded.

import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://127.0.0.1:3100";

// All public routes in app/ (see git ls-files 'app/**/page.tsx').
const PAGES = [
  "/",
  "/about",
  "/book",
  "/contact",
  "/cookie-policy",
  "/courses",
  "/dive-log",
  "/dive-sites",
  "/diving",
  "/partners",
  "/plan-your-trip",
  "/privacy",
  "/terms",
  "/visiting-yachts",
];

const WIDTHS = [320, 375, 430, 768, 1024, 1440];
// Widths at which element-count histograms are sampled (mobile + desktop).
const HISTOGRAM_WIDTHS = [375, 1440];

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
  ["footer-heading", "footer p", "footer column heading (uppercase micro-label)"],
  // Bottom-bar copyright: the only footer <p> that is small but NOT an
  // uppercase column heading.
  ["caption", "footer p.text-xs:not(.uppercase)", "copyright/bottom-bar line"],
];

const errors = [];
const recordError = (where, e) =>
  errors.push({ where, error: e instanceof Error ? e.message : String(e) });

// Preflight: an unreachable server is a hard failure — no report is better
// than an empty one.
try {
  const res = await fetch(BASE + "/", { method: "HEAD" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (e) {
  console.error(
    `audit-typography: cannot reach ${BASE}. Start the production server first:\n` +
      `  node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100\n` +
      `(${e instanceof Error ? e.message : e})`
  );
  process.exit(1);
}

let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  console.error(`audit-typography: cannot launch Chromium (${e instanceof Error ? e.message : e})`);
  process.exit(1);
}

// --- 1. Fonts: local availability, declared vs loaded faces, network files --
const page = await browser.newPage();
const downloadedFontFiles = new Set();
page.on("response", (res) => {
  const type = res.headers()["content-type"] ?? "";
  const url = res.url();
  if (type.includes("font") || /\.(woff2?|ttf|otf)(\?|$)/.test(url)) {
    downloadedFontFiles.add(url);
  }
});
try {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  // Deterministic point: font loading for this document has settled.
  await page.evaluate(() => document.fonts.ready);
} catch (e) {
  recordError("goto:/", e);
}

let fontEvidence = null;
let headingResolution = null;
let fontScoping = null;
try {
  fontEvidence = await page.evaluate(() => {
    // Canvas-measure trick: a font "exists" locally if measuring text in
    // `"<name>", monospace` differs from plain `monospace` (or serif).
    const ctx = document.createElement("canvas").getContext("2d");
    const testString = "mmmmmmmmmmlli WwWwWw 0123456789";
    const measure = (font) => {
      ctx.font = `72px ${font}`;
      return ctx.measureText(testString).width;
    };
    const baselines = {
      monospace: measure("monospace"),
      serif: measure("serif"),
      "sans-serif": measure("sans-serif"),
    };
    const available = (name) =>
      ["monospace", "serif", "sans-serif"].some(
        (base) => measure(`'${name}', ${base}`) !== baselines[base]
      );
    const candidates = ["Century Gothic", "CenturyGothic", "AppleGothic", "Poppins", "Open Sans", "Inter"];
    const localAvailability = {};
    for (const c of candidates) localAvailability[c] = available(c);

    // FontFaceSet: a face is *declared* once registered; it only counts as
    // loaded evidence when status === 'loaded'.
    const declaredFaces = [...document.fonts].map((f) => ({
      family: f.family,
      weight: f.weight,
      style: f.style,
      status: f.status,
    }));
    const loadedFaces = declaredFaces.filter((f) => f.status === "loaded");
    const notLoadedFaces = declaredFaces.filter((f) => f.status !== "loaded");
    return { localAvailability, declaredFaces, loadedFaces, notLoadedFaces };
  });
} catch (e) {
  recordError("fontEvidence", e);
}

// --- 2. Which heading-stack entry actually renders? --------------------------
// Compare the h1's computed stack against probe elements forced to each
// single family, measuring identical text — the entry whose metrics match
// the heading's metrics is the one that rendered.
try {
  headingResolution = await page.evaluate(() => {
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
} catch (e) {
  recordError("headingResolution", e);
}

// --- 3. next/font variable scoping (the Open Sans wiring evidence) ----------
try {
  fontScoping = await page.evaluate(() => {
    const firstP = document.querySelector("main p");
    return {
      // --font-open-sans is set by the next/font variable class on <body>.
      fontOpenSansOnHtml: getComputedStyle(document.documentElement)
        .getPropertyValue("--font-open-sans")
        .trim(),
      fontOpenSansOnBody: getComputedStyle(document.body)
        .getPropertyValue("--font-open-sans")
        .trim(),
      // --default-font-family references var(--font-open-sans); on <html> the
      // variable is undefined, so this custom property is guaranteed-invalid
      // and reports as an empty string — the mechanism behind html falling
      // back to the Tailwind system stack.
      defaultFontFamilyOnHtml: getComputedStyle(document.documentElement)
        .getPropertyValue("--default-font-family")
        .trim(),
      htmlComputedFontFamily: getComputedStyle(document.documentElement).fontFamily,
      bodyComputedFontFamily: getComputedStyle(document.body).fontFamily,
      firstPComputedFontFamily: firstP ? getComputedStyle(firstP).fontFamily : null,
    };
  });
} catch (e) {
  recordError("fontScoping", e);
}

// --- 4. Computed styles + histograms + overflow, per page per width ---------
const report = {};
const histograms = {};
const horizontalOverflow = {};
for (const width of WIDTHS) {
  const ctx2 = await browser.newContext({ viewport: { width, height: 900 } });
  const p = await ctx2.newPage();
  for (const route of PAGES) {
    const key = `${route} @${width}`;
    try {
      await p.goto(BASE + route, { waitUntil: "domcontentloaded" });
    } catch (e) {
      recordError(key, e);
      continue;
    }
    try {
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
    } catch (e) {
      recordError(`probes:${key}`, e);
    }
    if (width === 320) {
      try {
        horizontalOverflow[route] = await p.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
      } catch (e) {
        recordError(`overflow:${key}`, e);
      }
    }
    if (HISTOGRAM_WIDTHS.includes(width)) {
      try {
        histograms[key] = await p.evaluate(() => {
          const textSizes = {};
          document.querySelectorAll("main p, main li").forEach((el) => {
            const s = getComputedStyle(el).fontSize;
            textSizes[s] = (textSizes[s] || 0) + 1;
          });
          const headings = {};
          document.querySelectorAll("main h1, main h2, main h3, main h4").forEach((el) => {
            const cs = getComputedStyle(el);
            const k = `${el.tagName}:${cs.fontSize}/w${cs.fontWeight}`;
            headings[k] = (headings[k] || 0) + 1;
          });
          return { textSizes, headings };
        });
      } catch (e) {
        recordError(`histogram:${key}`, e);
      }
    }
  }
  await ctx2.close();
}

await browser.close();

console.log(
  JSON.stringify(
    {
      base: BASE,
      generatedAt: new Date().toISOString(),
      fontEvidence: fontEvidence && {
        ...fontEvidence,
        downloadedFontFiles: [...downloadedFontFiles],
      },
      headingResolution,
      fontScoping,
      horizontalOverflow,
      histograms,
      report,
      errors,
    },
    null,
    2
  )
);

// Any recorded failure makes the audit fail — partial JSON is still printed
// above for inspection, but the nonzero exit prevents it being read as a
// clean measurement.
process.exit(errors.length ? 1 : 0);
