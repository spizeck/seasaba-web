// Regression tests for the font-delivery wiring audited in #112 and fixed
// in #115. These assert the two invariants whose absence caused the bugs:
//
//   1. The next/font CSS variables must be defined on <html> — the theme
//      variable chain (--font-sans → --default-font-family →
//      var(--font-open-sans)) resolves on :root, so a variable scoped to
//      <body> is invisible to it and the page silently falls back to the
//      system font stack.
//   2. The heading stack must lead with the loaded webfont and must not
//      name fonts that are neither loaded nor intentionally reachable.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

const read = (rel: string) =>
  readFileSync(path.join(process.cwd(), rel), "utf8");

const layout = read("app/layout.tsx");
const globals = read("app/globals.css");

it("defines both next/font variables on <html>, not <body>", () => {
  const htmlTag = layout.match(/<html[^>]*>/)?.[0] ?? "";
  const bodyTag = layout.match(/<body[^>]*>/)?.[0] ?? "";
  expect(htmlTag).toContain("openSans.variable");
  expect(htmlTag).toContain("jost.variable");
  expect(bodyTag).not.toContain("openSans.variable");
  expect(bodyTag).not.toContain("jost.variable");
});

it("leads the heading stack with the loaded Jost variable", () => {
  const heading = globals.match(/--font-heading:\s*([^;]+);/)?.[1] ?? "";
  expect(heading.trim().startsWith("var(--font-jost)")).toBe(true);
});

it("does not name unreachable or misleading fonts in the heading stack", () => {
  const heading = globals.match(/--font-heading:\s*([^;]+);/)?.[1] ?? "";
  // Poppins was never loaded; AppleGothic/CenturyGothic are local-only names
  // that render unrelated faces — see TYPOGRAPHY_AUDIT.md §3.2.
  expect(heading).not.toMatch(/Poppins/);
  expect(heading).not.toMatch(/AppleGothic/);
  expect(heading).not.toMatch(/CenturyGothic/);
});

it("keeps the body stack on the loaded Open Sans variable", () => {
  const sans = globals.match(/--font-sans:\s*([^;]+);/)?.[1] ?? "";
  expect(sans).toContain("var(--font-open-sans)");
});

it("configures Jost through next/font/google", () => {
  expect(layout).toMatch(/Jost\s*\(\s*\{[^}]*variable:\s*"--font-jost"/);
  expect(layout).toMatch(/import\s*\{[^}]*Jost[^}]*\}\s*from\s*"next\/font\/google"/);
});
