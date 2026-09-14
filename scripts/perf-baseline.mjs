// Performance baseline + budget check for the public website.
//
// Runs Lighthouse (lab, simulated throttling) against the local production
// TEST build by default — build:test ships empty analytics IDs and a demo
// Firebase project, so measured cost is first-party and does not depend on
// GTM/Cookiebot/Checkfront uptime. Point --base-url at production for a
// real-world read including third parties (used for the baseline report, not
// CI budgets).
//
// Usage:
//   npm run build:test
//   node scripts/perf-baseline.mjs                 # mobile lab, CI budgets
//   node scripts/perf-baseline.mjs --desktop       # desktop lab profile
//   node scripts/perf-baseline.mjs --runs=5
//   node scripts/perf-baseline.mjs --base-url=https://www.seasaba.com --no-assert
//
// Chrome is located via CHROME_PATH, a system Chrome install, or the
// Playwright-bundled Chromium (which CI already ships).

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import lighthouse from "lighthouse";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const BASE_URL = arg("base-url", "http://127.0.0.1:3101");
const RUNS = Number(arg("runs", 3));
const DESKTOP = flag("desktop");
const NO_ASSERT = flag("no-assert");
const OUT_DIR = arg("out", "perf-report");
const ROUTES = ["/", "/diving", "/dive-sites", "/plan-your-trip", "/book", "/dive-log"];

const BUDGETS_PATH = "perf/budgets.json";

const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)/.test(BASE_URL);

// Third-party vendors blocked during LOCAL measurement so CI budgets reflect
// first-party cost deterministically and never depend on vendor uptime. The
// production run (no blocking) documents their real cost separately.
// Mirrors the host list in tests/production/fixtures.ts plus Firestore.
const VENDOR_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googlesyndication.com",
  "googleadservices.com",
  "doubleclick.net",
  "clarity.ms",
  "facebook.net",
  "facebook.com",
  "bat.bing.com",
  "cookiebot.com",
  "checkfront.com",
  "googleapis.com", // Firestore
];
// blockedUrlPatterns has no negation; enumerate the vendor hosts.
const BLOCKED_PATTERNS = VENDOR_HOSTS.flatMap((h) => [`*://${h}/*`, `*://*.${h}/*`]);
// --block-vendors / --no-block-vendors; default: block when target is local.
const blockVendors = flag("block-vendors") || (!flag("no-block-vendors") && isLocal);

// --- Chrome discovery -------------------------------------------------------

function candidateChromePaths() {
  const candidates = [];
  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);
  if (process.platform === "win32") {
    candidates.push(
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    );
    const pw = path.join(os.homedir(), "AppData", "Local", "ms-playwright");
    if (existsSync(pw)) {
      for (const dir of readdirSync(pw).filter((d) => d.startsWith("chromium")).sort().reverse()) {
        candidates.push(path.join(pw, dir, "chrome-win64", "chrome.exe"));
      }
    }
  } else {
    candidates.push("/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser");
    const pw = "/ms-playwright";
    if (existsSync(pw)) {
      for (const dir of readdirSync(pw).filter((d) => d.startsWith("chromium")).sort().reverse()) {
        candidates.push(path.join(pw, dir, "chrome-linux", "chrome"));
      }
    }
  }
  return candidates;
}

const chromePath = candidateChromePaths().find((p) => existsSync(p));
if (!chromePath) {
  console.error("No Chrome/Chromium found. Set CHROME_PATH or run `npx playwright install chromium`.");
  process.exit(1);
}

// --- Chrome process ----------------------------------------------------------

const profileDir = path.join("tmp", `lh-profile-${process.pid}`);
mkdirSync(profileDir, { recursive: true });

// detached+ignored stdio: piped stdio makes Windows headless Chrome exit(21).
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${path.resolve(profileDir)}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--mute-audio",
    ...(process.env.CI ? ["--no-sandbox", "--disable-dev-shm-usage"] : []),
    "about:blank",
  ],
  { stdio: "ignore", detached: true }
);

async function devtoolsPort() {
  const portFile = path.join(profileDir, "DevToolsActivePort");
  for (let i = 0; i < 100; i++) {
    if (existsSync(portFile)) {
      const [port] = readFileSync(portFile, "utf8").split("\n");
      if (port && Number(port) > 0) return Number(port);
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Chrome did not expose a DevTools port");
}

// --- Local server ------------------------------------------------------------

let serverProc = null;

async function ensureServer() {
  if (!isLocal) return;
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    if (res.status < 500) return; // already running
  } catch {
    /* not running */
  }
  const port = new URL(BASE_URL).port || "80";
  const host = new URL(BASE_URL).hostname;
  serverProc = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", host, "--port", port],
    { stdio: ["ignore", "pipe", "inherit"] }
  );
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return;
    } catch {
      /* keep waiting */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for next start on ${BASE_URL} — run npm run build:test first`);
}

// --- Measurement -------------------------------------------------------------

const profile = DESKTOP
  ? {
      formFactor: "desktop",
      screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      throttlingMethod: "simulate",
    }
  : {};

function extract(lhr) {
  const a = lhr.audits;
  const rs = Object.fromEntries(
    (a["resource-summary"]?.details?.items ?? []).map((i) => [i.resourceType, i])
  );
  const thirdParty = (a["third-parties-insight"]?.details?.items ?? [])
    .filter((i) => i.entity && i.entity !== "127.0.0.1" && i.entity !== "localhost")
    .map((i) => ({ entity: i.entity, transferSize: i.transferSize, blockingTime: i.mainThreadTime }))
    .sort((x, y) => (y.transferSize ?? 0) - (x.transferSize ?? 0));
  const lcpEl = a["lcp-breakdown-insight"]?.details?.items?.find((i) => i.type === "node")?.snippet;
  return {
    url: lhr.requestedUrl,
    fetchTime: lhr.fetchTime,
    score: lhr.categories.performance.score,
    fcp: a["first-contentful-paint"]?.numericValue,
    lcp: a["largest-contentful-paint"]?.numericValue,
    cls: a["cumulative-layout-shift"]?.numericValue,
    tbt: a["total-blocking-time"]?.numericValue,
    si: a["speed-index"]?.numericValue,
    ttfb: a["server-response-time"]?.numericValue,
    tti: a["interactive"]?.numericValue,
    lcpElement: lcpEl,
    bytes: {
      total: rs.total?.transferSize,
      script: rs.script?.transferSize,
      image: rs.image?.transferSize,
      document: rs.document?.transferSize,
      stylesheet: rs.stylesheet?.transferSize,
      font: rs.font?.transferSize,
      other: rs.other?.transferSize,
      media: rs.media?.transferSize,
      thirdParty: rs["third-party"]?.transferSize,
    },
    thirdParty,
    diagnostics: a.diagnostics?.details?.items?.[0]
      ? {
          numRequests: a.diagnostics.details.items[0].numRequests,
          totalByteWeight: a.diagnostics.details.items[0].totalByteWeight,
          mainThreadWorkMs: a.diagnostics.details.items[0].mainThreadWorkMs,
        }
      : undefined,
    opportunities: Object.fromEntries(
      ["render-blocking-resources", "unused-javascript", "uses-responsive-images", "offscreen-images", "modern-image-formats", "efficient-animated-content", "unminified-javascript", "unused-css-rules", "prioritize-lcp-image"]
        .filter((id) => a[id] && (a[id].numericValue > 0 || (a[id].details?.overallSavingsBytes ?? 0) > 0))
        .map((id) => [id, { numericValue: a[id].numericValue, savingsBytes: a[id].details?.overallSavingsBytes, savingsMs: a[id].details?.overallSavingsMs }])
    ),
  };
}

const median = (values) => {
  const sorted = [...values].sort((x, y) => x - y);
  return sorted[Math.floor(sorted.length / 2)];
};

// --- Budgets -------------------------------------------------------------------

// metric -> { get(run), higherIsBetter }
const METRICS = {
  score: { get: (r) => r.score, better: "high" },
  fcpMs: { get: (r) => r.fcp, better: "low" },
  lcpMs: { get: (r) => r.lcp, better: "low" },
  cls: { get: (r) => r.cls, better: "low" },
  tbtMs: { get: (r) => r.tbt, better: "low" },
  ttfbMs: { get: (r) => r.ttfb, better: "low" },
  jsBytes: { get: (r) => r.bytes.script, better: "low" },
  imageBytes: { get: (r) => r.bytes.image, better: "low" },
  totalBytes: { get: (r) => r.bytes.total, better: "low" },
  thirdPartyBytes: { get: (r) => r.bytes.thirdParty, better: "low" },
};

function checkBudgets(medianByRoute, budgets) {
  const failures = [];
  const warnings = [];
  for (const [route, medianRun] of medianByRoute) {
    const budget = { ...(budgets["*"] ?? {}), ...(budgets[route] ?? {}) };
    for (const [metric, rule] of Object.entries(budget)) {
      const m = METRICS[metric];
      if (!m) continue;
      const value = m.get(medianRun);
      if (value === undefined || value === null) continue;
      const breaches = (limit) =>
        m.better === "low" ? value > limit : value < limit;
      if (rule.error !== undefined && breaches(rule.error)) {
        failures.push(`${route}: ${metric}=${fmtMetric(metric, value)} exceeds error budget ${fmtMetric(metric, rule.error)}`);
      } else if (rule.warn !== undefined && breaches(rule.warn)) {
        warnings.push(`${route}: ${metric}=${fmtMetric(metric, value)} exceeds warn budget ${fmtMetric(metric, rule.warn)}`);
      }
    }
  }
  return { failures, warnings };
}

const fmtMetric = (metric, v) =>
  metric === "score" ? v.toFixed(2) : metric === "cls" ? v.toFixed(3) : metric.endsWith("Bytes") ? `${(v / 1024).toFixed(0)}KB` : `${Math.round(v)}ms`;

// --- Main ----------------------------------------------------------------------

let exitCode = 0;
try {
  const port = await devtoolsPort();
  await ensureServer();

  console.log(`\nLighthouse ${DESKTOP ? "desktop" : "mobile (simulated)"} — ${RUNS} run(s) per route — target ${BASE_URL}\n`);

  const resultsByRoute = new Map();
  mkdirSync(OUT_DIR, { recursive: true });

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const result = await lighthouse(url, {
        port,
        output: ["json", "html"],
        logLevel: "error",
        ...(blockVendors ? { blockedUrlPatterns: BLOCKED_PATTERNS } : {}),
        ...profile,
      });
      if (!result?.lhr) throw new Error(`Lighthouse returned no result for ${url}`);
      const safe = route === "/" ? "index" : route.slice(1).replaceAll("/", "-");
      writeFileSync(path.join(OUT_DIR, `${safe}-run${i + 1}.json`), JSON.stringify(result.lhr));
      if (i === Math.floor(RUNS / 2)) {
        writeFileSync(path.join(OUT_DIR, `${safe}.report.html`), result.report[1] ?? result.report);
      }
      runs.push(extract(result.lhr));
    }
    resultsByRoute.set(route, runs);
    const l = runs.map((r) => r.lcp);
    console.log(`${route.padEnd(18)} score=${(median(runs.map((r) => r.score)) * 100).toFixed(0).padStart(3)}  LCP=${Math.round(median(l))}ms  CLS=${median(runs.map((r) => r.cls)).toFixed(3)}  TBT=${Math.round(median(runs.map((r) => r.tbt)))}ms  TTFB=${Math.round(median(runs.map((r) => r.ttfb)))}ms  JS=${(median(runs.map((r) => r.bytes.script)) / 1024).toFixed(0)}KB  img=${(median(runs.map((r) => r.bytes.image)) / 1024).toFixed(0)}KB  total=${(median(runs.map((r) => r.bytes.total)) / 1024).toFixed(0)}KB`);
  }

  const medianByRoute = new Map(
    [...resultsByRoute].map(([route, runs]) => [route, runs[Math.floor(runs.length / 2)]])
  );

  writeFileSync(
    path.join(OUT_DIR, "summary.json"),
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        profile: DESKTOP ? "desktop" : "mobile-simulated",
        runs: RUNS,
        generatedAt: new Date().toISOString(),
        routes: Object.fromEntries(
          [...medianByRoute].map(([route, medianRun]) => [
            route,
            { median: medianRun, runs: resultsByRoute.get(route) },
          ])
        ),
      },
      null,
      2
    )
  );

  if (!NO_ASSERT && existsSync(BUDGETS_PATH)) {
    const budgets = JSON.parse(await readFile(BUDGETS_PATH, "utf8"));
    const { failures, warnings } = checkBudgets(medianByRoute, budgets);
    for (const w of warnings) console.log(`WARN  ${w}`);
    for (const f of failures) console.log(`FAIL  ${f}`);
    if (failures.length) {
      console.error(`\n${failures.length} performance budget(s) breached. Reports: ${OUT_DIR}/`);
      exitCode = 1;
    } else {
      console.log(`\nAll performance budgets satisfied. Reports: ${OUT_DIR}/`);
    }
  } else {
    console.log(`\nReports written to ${OUT_DIR}/`);
  }
} finally {
  chrome.kill("SIGKILL");
  if (serverProc) serverProc.kill();
  // Best-effort cleanup: Chrome may still hold profile files briefly.
  for (let i = 0; i < 10; i++) {
    try {
      rmSync(profileDir, { recursive: true, force: true });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}
process.exit(exitCode);
