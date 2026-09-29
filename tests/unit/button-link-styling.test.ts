import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { buttonVariants } from "@/components/ui/button";

// Issue #186: Tailwind Typography's `prose` underlines every anchor inside
// content pages. Anchors rendered as buttons must never pick that up — the
// filled/outline affordance is already a stronger interaction cue — while
// ordinary text links keep it.

it("every button variant suppresses the text-link underline", () => {
  for (const variant of [
    "default",
    "destructive",
    "outline",
    "secondary",
    "ghost",
    "link",
  ] as const) {
    expect(buttonVariants({ variant }), variant).toContain("no-underline");
  }
});

const globalsCss = readFileSync("app/globals.css", "utf8");

it("prose never underlines anchors rendered into the button slot", () => {
  const rule = globalsCss.match(
    /\.prose\s+a\[data-slot="button"\]\s*{([^}]+)}/
  );
  expect(rule).not.toBeNull();
  expect(rule![1]).toContain("text-decoration: none");
  // The guard must be scoped to the button slot — ordinary prose links keep
  // their underline, and prose's blanket `a` rule stays untouched.
  expect(globalsCss).not.toMatch(/\.prose\s+a\s*{/);
});
