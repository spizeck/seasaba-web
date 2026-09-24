// Pure aggregation + budget logic for scripts/perf-baseline.mjs, kept
// importable (no side effects) so unit tests can pin the exact statistic
// that budgets enforce.
//
// Budget philosophy: every metric is enforced on the SAME statistic the
// route summary line prints — the median across Lighthouse runs. Before
// #163, enforcement silently used `runs[1]` (the second run by execution
// order) while the summary printed the sorted median, so a route could
// display ~4.7s and pass or fail depending on which value happened to
// land in run slot 2.

export const median = (values) => {
  const sorted = [...values].sort((x, y) => x - y);
  return sorted[Math.floor(sorted.length / 2)];
};

// metric -> { get(run), higherIsBetter }
export const METRICS = {
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

// Synthesizes a single run-shaped object where every budgeted field holds
// the median of that metric across `runs` — the same value the summary
// prints for each metric. Per-metric (not "median run") because each
// budget line must evaluate the statistic it claims to evaluate.
export function synthesizeMedianRun(runs) {
  const fieldMedian = (get) => median(runs.map(get));
  return {
    score: fieldMedian((r) => r.score),
    fcp: fieldMedian((r) => r.fcp),
    lcp: fieldMedian((r) => r.lcp),
    cls: fieldMedian((r) => r.cls),
    tbt: fieldMedian((r) => r.tbt),
    si: fieldMedian((r) => r.si),
    ttfb: fieldMedian((r) => r.ttfb),
    tti: fieldMedian((r) => r.tti),
    bytes: {
      total: fieldMedian((r) => r.bytes.total),
      script: fieldMedian((r) => r.bytes.script),
      image: fieldMedian((r) => r.bytes.image),
      document: fieldMedian((r) => r.bytes.document),
      stylesheet: fieldMedian((r) => r.bytes.stylesheet),
      font: fieldMedian((r) => r.bytes.font),
      other: fieldMedian((r) => r.bytes.other),
      media: fieldMedian((r) => r.bytes.media),
      thirdParty: fieldMedian((r) => r.bytes.thirdParty),
    },
  };
}

export const fmtMetric = (metric, v) =>
  metric === "score" ? v.toFixed(2) : metric === "cls" ? v.toFixed(3) : metric.endsWith("Bytes") ? `${(v / 1024).toFixed(0)}KB` : `${Math.round(v)}ms`;

export function checkBudgets(medianByRoute, budgets) {
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
