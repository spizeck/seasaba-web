import { describe, expect, it } from "vitest";
import {
  checkBudgets,
  fmtMetric,
  median,
  METRICS,
  synthesizeMedianRun,
} from "../../scripts/perf-metrics.mjs";

// #163: the budget gate must enforce the SAME statistic the route summary
// prints — the per-metric median across Lighthouse runs. The pre-fix script
// enforced `runs[1]` (execution order), so a route could display a ~4.7s
// median yet pass (when run 2 happened to be fast) or fail on different code
// only because run 2's slot rolled high. These tests pin the contract so the
// two statistics can never silently diverge again.

const run = (lcp: number, over: Partial<Record<string, number>> = {}) => ({
  score: 0.9,
  fcp: 1500,
  lcp,
  cls: 0,
  tbt: 50,
  si: 1500,
  ttfb: 10,
  tti: 3000,
  bytes: {
    total: 700_000,
    script: 260_000,
    image: 200_000,
    document: 18_000,
    stylesheet: 18_000,
    font: 100_000,
    other: 10_000,
    media: 0,
    thirdParty: 0,
    ...over,
  },
});

describe("median", () => {
  it("picks the middle value of the sorted set, not the middle run", () => {
    expect(median([4879, 3328, 4676])).toBe(4676);
    expect(median([1, 100, 50])).toBe(50);
    // Even count takes the upper of the two middles (documented behavior).
    expect(median([10, 40, 20, 30])).toBe(30);
  });
});

describe("synthesizeMedianRun", () => {
  it("evaluates the per-metric median the summary displays", () => {
    // Real CI data from the #163 investigation (PR #160 run): display showed
    // 4676ms while the buggy enforcement evaluated run[1]=3328ms.
    const m = synthesizeMedianRun([run(4879), run(3328), run(4676)]);
    expect(m.lcp).toBe(4676);
  });

  it("aggregates each metric independently", () => {
    const runs = [
      run(5000, { script: 200_000 }),
      run(3000, { script: 300_000 }),
      run(4000, { script: 250_000 }),
    ];
    const m = synthesizeMedianRun(runs);
    expect(m.lcp).toBe(4000);
    expect(m.bytes.script).toBe(250_000);
  });
});

describe("checkBudgets", () => {
  const budgets = { "*": { lcpMs: { warn: 3600, error: 4500 } } };

  it("fails when the displayed median exceeds the error budget", () => {
    // #163 PR #162 rerun: runs [4869, 4712, 4715] → median 4715 fails.
    const byRoute = new Map([["/", synthesizeMedianRun([run(4869), run(4712), run(4715)])]]);
    const { failures } = checkBudgets(byRoute, budgets);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("4715ms");
  });

  it("no longer passes on a fast second run when the median breaches", () => {
    // The exact #160 scenario: median 4676 > 4500 must fail even though the
    // second run was 3328.
    const byRoute = new Map([["/", synthesizeMedianRun([run(4879), run(3328), run(4676)])]]);
    expect(checkBudgets(byRoute, budgets).failures).toHaveLength(1);
  });

  it("passes and warns when the median sits between warn and error", () => {
    const byRoute = new Map([["/", synthesizeMedianRun([run(3700), run(4000), run(3900)])]]);
    const { failures, warnings } = checkBudgets(byRoute, budgets);
    expect(failures).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("3900ms");
  });

  it("passes when the median is under every threshold", () => {
    const byRoute = new Map([["/", synthesizeMedianRun([run(3000), run(3100), run(3200)])]]);
    const { failures, warnings } = checkBudgets(byRoute, budgets);
    expect(failures).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it("merges per-route overrides over the wildcard budget", () => {
    const merged = { "*": { lcpMs: { error: 4500 } }, "/slow": { lcpMs: { error: 6000 } } };
    const byRoute = new Map([["/slow", synthesizeMedianRun([run(5000), run(5200), run(5100)])]]);
    expect(checkBudgets(byRoute, merged).failures).toHaveLength(0);
  });
});

describe("fmtMetric", () => {
  it("formats each metric family for the budget line", () => {
    expect(fmtMetric("lcpMs", 4670.9)).toBe("4671ms");
    expect(fmtMetric("score", 0.852)).toBe("0.85");
    expect(fmtMetric("cls", 0.0321)).toBe("0.032");
    expect(fmtMetric("jsBytes", 273 * 1024)).toBe("273KB");
  });
});

describe("METRICS registry", () => {
  it("every budget metric maps to a run field", () => {
    const r = run(1234);
    for (const m of Object.values(METRICS)) {
      expect(m.get(r)).not.toBeUndefined();
    }
  });
});
