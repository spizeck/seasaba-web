// Environment-variable drift check — keeps .env.example honest.
//
// Compares the names defined in .env.example with the variables actually
// referenced by tracked code/scripts/workflows, in both directions:
//
//   referenced-but-undocumented : process.env.NAME in code, absent from
//                                 .env.example and not allowlisted → the
//                                 example file must describe it.
//   documented-but-unreferenced : a name in .env.example that no code or
//                                 workflow reads → stale (the
//                                 NEXT_PUBLIC_SITE_URL regression class).
//
// Platform/tooling variables are read from the environment but do not belong
// in .env.example — they live in TOOLING_ALLOWLIST. A name documented in
// .env.example but deliberately not referenced anywhere (none today) can be
// exempted via EXAMPLE_ALLOWLIST.
//
// The check also rejects obvious real secrets committed to .env.example.
//
// Exit 1 with a named variable + reason per failure.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Read from the environment by tooling/CI — legitimate, but not app config.
const TOOLING_ALLOWLIST = new Set([
  "CI",
  "CHROME_PATH",
  "PLAYWRIGHT_BROWSERS_PATH",
  "SMOKE_BASE_URL",
  "NEXT_TELEMETRY_DISABLED",
  "NODE_ENV",
]);

// Names allowed in .env.example without a code reference (e.g. a variable the
// deployment platform consumes but app code never reads). Empty on purpose —
// add a name here only with a comment justifying it.
const EXAMPLE_ALLOWLIST = new Set([]);

// Files whose env references count as "the variable is actually used".
// Markdown is excluded on purpose: a variable that only appears in docs but
// no code is exactly the stale-documentation bug this check exists to catch.
const CODE_EXTENSIONS = /\.(ts|tsx|mts|mjs|js|jsx)$/;
const WORKFLOW_EXTENSIONS = /\.(yml|yaml)$/;

// Explicit scan scope: directories and root config files that legitimately
// consume environment variables. New source roots must be added here.
const SCAN_DIR_RE = /^(app|components|lib|tests|scripts|perf|data|public)\//;
const ROOT_CONFIG_RE = /^[^/]+\.config\.[cm]?[jt]s$|^middleware\.[jt]s$/;

// The check-*.mjs scripts are repo meta-checks, not env consumers. They
// legitimately contain `process.env.NAME` in explanatory comments (like the
// header above) — scanning them makes the checker flag its own
// documentation, which is what broke CI on #71.
const META_CHECK_RE = /^scripts\/check-.*\.mjs$/;

function inScanScope(file) {
  if (META_CHECK_RE.test(file)) return false;
  return SCAN_DIR_RE.test(file) || ROOT_CONFIG_RE.test(file);
}

const ENV_READ_RE =
  /process\.env\.([A-Z_][A-Z0-9_]*)|process\.env\[["']([A-Z_][A-Z0-9_]*)["']\]/g;
const ENV_KEY_RE = /^([A-Z_][A-Z0-9_]*)\s*=/;

// Obvious secret shapes that must never land in .env.example — it is a
// committed template of placeholders, not a credential store.
const SECRET_RE = /-----BEGIN|AIza[0-9A-Za-z_-]{20,}|service_account|private_key/i;

const failures = [];

const trackedFiles = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

// --- Collect names defined in .env.example -----------------------------------

const examplePath = path.join(ROOT, ".env.example");
const exampleText = readFileSync(examplePath, "utf8");
const exampleNames = new Set();
for (const line of exampleText.split("\n")) {
  const m = line.match(ENV_KEY_RE);
  if (m) exampleNames.add(m[1]);
}

// --- Collect names referenced by code/scripts --------------------------------

const referenced = new Set();
const referencedBy = new Map();
const codeFiles = trackedFiles.filter(
  (f) => CODE_EXTENSIONS.test(f) && inScanScope(f)
);
const workflowFiles = trackedFiles.filter(
  (f) => f.startsWith(".github/") && WORKFLOW_EXTENSIONS.test(f)
);

for (const file of codeFiles) {
  const text = readFileSync(path.join(ROOT, file), "utf8");
  for (const match of text.matchAll(ENV_READ_RE)) {
    const name = match[1] ?? match[2];
    referenced.add(name);
    if (!referencedBy.has(name)) referencedBy.set(name, file);
  }
}

// Workflows set env vars without process.env syntax; a documented variable is
// "referenced" if its name appears in a workflow (e.g. SMOKE_BASE_URL).
const workflowText = workflowFiles
  .map((f) => readFileSync(path.join(ROOT, f), "utf8"))
  .join("\n");
for (const name of exampleNames) {
  if (new RegExp(`\\b${name}\\b`).test(workflowText)) referenced.add(name);
}

// --- Regression guards --------------------------------------------------------
//
// #71 follow-up: on CI this checker flagged `process.env.NAME` inside its own
// header comment, because the scanned set included the check scripts. Guard
// against scope regressions permanently, and prove the read pattern still
// detects an ordinary consumer reference.

if (codeFiles.some((f) => META_CHECK_RE.test(f))) {
  failures.push(
    "env scan scope includes scripts/check-*.mjs — meta-checks document env semantics and must stay out of scope (see META_CHECK_RE)"
  );
}

const SELF_TEST_FIXTURE = "const v = process.env.SELF_TEST_ENV_VAR;";
if (
  ![...SELF_TEST_FIXTURE.matchAll(ENV_READ_RE)].some(
    (m) => m[1] === "SELF_TEST_ENV_VAR"
  )
) {
  failures.push(
    "ENV_READ_RE no longer detects a plain process.env.NAME read — fix the pattern before trusting this check"
  );
}

// --- Drift, both directions ---------------------------------------------------

for (const name of referenced) {
  if (exampleNames.has(name) || TOOLING_ALLOWLIST.has(name)) continue;
  failures.push(
    `${name} is read in ${referencedBy.get(name)} but missing from .env.example — document it there, or add it to TOOLING_ALLOWLIST in scripts/check-env-vars.mjs if the platform supplies it`
  );
}

for (const name of exampleNames) {
  if (referenced.has(name) || EXAMPLE_ALLOWLIST.has(name)) continue;
  failures.push(
    `${name} is defined in .env.example but nothing in code or workflows reads it — remove it from .env.example or add it to EXAMPLE_ALLOWLIST in scripts/check-env-vars.mjs`
  );
}

// --- Placeholder-only policy ---------------------------------------------------

for (const [i, line] of exampleText.split("\n").entries()) {
  if (!ENV_KEY_RE.test(line)) continue;
  if (SECRET_RE.test(line)) {
    failures.push(
      `.env.example:${i + 1} looks like it contains a real credential — keep placeholders only`
    );
  }
}

// ------------------------------------------------------------------------------

if (failures.length) {
  console.error("Environment-variable drift check failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error(`\n${failures.length} problem(s).`);
  process.exit(1);
}
console.log(
  `Env check passed: ${exampleNames.size} variables documented, ${referenced.size} referenced; ` +
    `${TOOLING_ALLOWLIST.size} tooling vars allowlisted.`
);
