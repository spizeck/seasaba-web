// Repository-hygiene invariants — deterministic, offline, fast.
//
//   1. No generated/local artifacts are tracked by git (denylist matched
//      against `git ls-files`).
//   2. .gitignore still covers the important generated paths — verified with
//      `git check-ignore` probes against real gitignore semantics, not string
//      matching.
//   3. Structural invariants established by the #68/#69 cleanup:
//      required root files/directories exist, the root Markdown set stays
//      limited to the three canonical entry points, and deliberately removed
//      structures (the MDX pipeline) stay gone.
//
// Exit 1 with a named file/pattern + reason per failure.

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];

const trackedFiles = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

// --- Check 1: generated/local artifacts must never be tracked ----------------

// Each entry is a regex matched against repo-relative tracked paths.
const ARTIFACT_DENYLIST = [
  [/^node_modules\//, "dependency install output"],
  [/^\.next\//, "Next.js build output"],
  [/^out\//, "Next.js static export output"],
  [/^build\//, "build output"],
  [/^coverage\//, "coverage report output"],
  [/^playwright-report(-production)?\//, "Playwright HTML report"],
  [/^test-results(-production)?\//, "Playwright test artifacts"],
  [/^perf-report\//, "Lighthouse/perf report output"],
  [/^\.lighthouseci\//, "Lighthouse CI output"],
  [/^tmp\//, "local scratch directory"],
  [/^\.vercel\//, "Vercel local state"],
  [/\.tsbuildinfo$/, "TypeScript incremental cache"],
  [/^next-env\.d\.ts$/, "generated Next.js env types"],
  [/^\.env($|\.(?!example$))/, "local env file (only .env.example may be committed)"],
  [/\.pem$/, "private key material"],
  [/^\.DS_Store$/, "macOS metadata"],
  [/^(npm|yarn|pnpm)-debug\.log/, "package-manager debug log"],
  [/^yarn-(debug|error)\.log/, "yarn log"],
  [/^\.pnp\./, "Yarn PnP state"],
];

for (const file of trackedFiles) {
  for (const [pattern, what] of ARTIFACT_DENYLIST) {
    if (pattern.test(file)) {
      failures.push(
        `${file} is tracked by git but looks like ${what} — remove it from the index (git rm --cached) and confirm .gitignore covers it`
      );
    }
  }
}

// --- Check 2: .gitignore still covers the generated paths ---------------------

// Probe paths are intentionally inside the ignored directory so coverage is
// proven by git's own ignore engine.
const IGNORE_PROBES = [
  "node_modules/probe-pkg/index.js",
  ".next/probe",
  "coverage/probe",
  "playwright-report/probe",
  "playwright-report-production/probe",
  "test-results/probe",
  "test-results-production/probe",
  "perf-report/probe",
  "tmp/probe",
  ".vercel/probe",
  ".env",
  ".env.local",
  "next-env.d.ts",
  "probe.tsbuildinfo",
];

for (const probe of IGNORE_PROBES) {
  try {
    execSync(`git check-ignore -q -- ${JSON.stringify(probe)}`, { cwd: ROOT });
  } catch {
    failures.push(
      `${probe} is not git-ignored — restore the corresponding pattern in .gitignore`
    );
  }
}

// --- Check 3: structural invariants --------------------------------------------

const REQUIRED_PATHS = [
  // Canonical entry points (see README documentation index)
  "README.md",
  "AI_INSTRUCTIONS.md",
  "SECURITY.md",
  ".env.example",
  // Toolchain / contract files the docs and CI assume
  "package.json",
  "package-lock.json",
  ".nvmrc",
  ".gitignore",
  "tsconfig.json",
  "next.config.ts",
  "eslint.config.mjs",
  "playwright.config.ts",
  "playwright.production.config.ts",
  "vitest.config.mts",
  "perf/budgets.json",
  // Canonical docs (existence — README linking is checked separately)
  "docs/TESTING.md",
  "docs/ANALYTICS_SEO.md",
  "docs/COOKIEBOT_CONSENT_SETUP.md",
  "docs/OPERATIONS.md",
  "docs/design/THEME_UX_GUIDE.md",
  "docs/design/IMAGE_STANDARD.md",
  // Source/test roots
  "app",
  "components",
  "lib",
  "scripts",
  "tests",
  ".github/workflows",
];

for (const p of REQUIRED_PATHS) {
  if (!existsSync(path.join(ROOT, p))) {
    failures.push(`required path ${p} is missing — it is part of the documented repo structure`);
  }
}

// Top-level Markdown is limited to the three canonical entry points; all
// other docs live under docs/. Add to this list only deliberately.
const ALLOWED_ROOT_DOCS = new Set(["README.md", "AI_INSTRUCTIONS.md", "SECURITY.md"]);
for (const file of trackedFiles) {
  if (!file.includes("/") && file.endsWith(".md") && !ALLOWED_ROOT_DOCS.has(file)) {
    failures.push(
      `${file} is a root-level Markdown doc — docs belong under docs/, or add it to ALLOWED_ROOT_DOCS in scripts/check-repo-hygiene.mjs`
    );
  }
}

// Structures removed on purpose during cleanup — reintroducing them silently
// would resurrect the MDX pipeline and pre-consolidation doc sprawl.
const REMOVED_STRUCTURES = [
  [/^content\//, "the old content/ MDX directory was removed — put content in app/ TSX pages"],
  [/\.mdx$/, "MDX support was removed — use ordinary TSX pages instead"],
];

for (const file of trackedFiles) {
  for (const [pattern, why] of REMOVED_STRUCTURES) {
    if (pattern.test(file)) failures.push(`${file}: ${why}`);
  }
}
if (existsSync(path.join(ROOT, "content"))) {
  failures.push("content/ directory exists — the MDX pipeline was removed; put content in app/ TSX pages");
}

// ------------------------------------------------------------------------------

if (failures.length) {
  console.error("Repository hygiene check failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error(`\n${failures.length} problem(s).`);
  process.exit(1);
}
console.log(
  `Hygiene check passed: ${trackedFiles.length} tracked files clean, ` +
    `${IGNORE_PROBES.length} gitignore probes covered, ${REQUIRED_PATHS.length} required paths present.`
);
