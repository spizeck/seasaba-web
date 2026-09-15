// Documentation reference checks — deterministic, offline, fast.
//
//   1. Relative links/images in tracked Markdown resolve to real files/dirs.
//      External URLs (any scheme), pure #anchors and link titles are ignored;
//      #fragments on file links are stripped (anchor validity is renderer-
//      dependent and intentionally not checked).
//   2. README.md links to every canonical doc — protects the docs index
//      against accidental unlinking or deletion.
//   3. Backticked repo paths in non-historical docs exist. Narrowly scoped:
//      only inline-code tokens starting with a known source-tree prefix, in
//      prose (fenced code blocks excluded), and docs/historical/ is exempt
//      because it deliberately documents files that no longer exist.
//
// Exit 1 with a named file + reference per failure.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Docs every reader is expected to reach from the README index. Deleting or
// unlinking one is a regression this repo has already fixed once (#68/#70).
const CANONICAL_README_LINKS = [
  "docs/TESTING.md",
  "docs/ANALYTICS_SEO.md",
  "docs/COOKIEBOT_CONSENT_SETUP.md",
  "docs/design/THEME_UX_GUIDE.md",
  "docs/design/IMAGE_STANDARD.md",
  "docs/design/Sea_Saba_Logo_Spec_DEC_21.pdf",
  "docs/historical/",
  "AI_INSTRUCTIONS.md",
  "SECURITY.md",
];

// Backticked tokens starting with these prefixes are treated as repo-path
// references and must resolve (check 3). Paths like `coverage/index.html` or
// `/diving/first-dive` (generated output, site routes) are out of scope.
const REPO_PATH_PREFIXES = [
  "app/", "components/", "lib/", "scripts/", "tests/", "docs/",
  "data/", "perf/", "public/", ".github/",
];

const failures = [];

const trackedMarkdown = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .map((l) => l.trim())
  .filter((f) => f.endsWith(".md"));

const stripFenced = (text) => text.replace(/```[\s\S]*?(```|$)/g, "");
const stripInlineCode = (text) => text.replace(/`[^`\n]*`/g, "");
const isExternal = (target) => /^[a-z][a-z0-9+.-]*:/i.test(target);

function decodePath(target) {
  try {
    return decodeURIComponent(target);
  } catch {
    return target; // e.g. a literal '%' in a path — compare as-is
  }
}

// --- Check 1: relative Markdown links resolve -------------------------------

const readmeLinkTargets = new Set();
const LINK_RE = /!?\[[^\]]*\]\(\s*<?([^>\s)]+)>?/g;

for (const file of trackedMarkdown) {
  const prose = stripInlineCode(stripFenced(readFileSync(path.join(ROOT, file), "utf8")));
  for (const match of prose.matchAll(LINK_RE)) {
    const raw = match[1];
    if (isExternal(raw) || raw.startsWith("#")) continue;
    const target = decodePath(raw.split("#")[0].split("?")[0]);
    if (!target) continue;
    if (file === "README.md") readmeLinkTargets.add(target);
    const resolved = path.resolve(ROOT, path.dirname(file), target);
    if (!existsSync(resolved)) {
      failures.push(`${file} links to ${raw}, but that file/directory does not exist`);
    }
  }
}

// --- Check 2: README still links the canonical docs -------------------------

for (const required of CANONICAL_README_LINKS) {
  if (!readmeLinkTargets.has(required)) {
    failures.push(
      `README.md no longer links to ${required} — restore the link in the documentation index (or update CANONICAL_README_LINKS in scripts/check-doc-links.mjs if the doc was deliberately retired)`
    );
  }
}

// --- Check 3: backticked repo-path references resolve -----------------------

const BACKTICK_PATH_RE = /`([A-Za-z0-9_./()@-]+)`/g;
const isRepoPath = (token) =>
  REPO_PATH_PREFIXES.some((p) => token.startsWith(p)) || token.startsWith("./");

for (const file of trackedMarkdown) {
  // Historical docs intentionally describe files that no longer exist.
  if (file.startsWith("docs/historical/")) continue;
  const prose = stripFenced(readFileSync(path.join(ROOT, file), "utf8"));
  for (const match of prose.matchAll(BACKTICK_PATH_RE)) {
    const token = match[1];
    if (!isRepoPath(token)) continue;
    if (token.includes("...") || token.includes("*")) continue; // globs/elisions
    // Convention: `dir/...` tokens are repo-root-relative; `./x` is relative to
    // the file itself.
    const resolved = token.startsWith("./")
      ? path.resolve(ROOT, path.dirname(file), token)
      : path.resolve(ROOT, token);
    if (!existsSync(resolved)) {
      failures.push(`${file} references \`${token}\`, but that path does not exist`);
    }
  }
}

// ----------------------------------------------------------------------------

if (failures.length) {
  console.error("Documentation reference check failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error(`\n${failures.length} problem(s). Fix the reference or the file it points to.`);
  process.exit(1);
}
console.log(
  `Documentation check passed: ${trackedMarkdown.length} Markdown files, ` +
    `links resolve, ${CANONICAL_README_LINKS.length} canonical docs linked from README.`
);
