import { test, expect, waitForHydration } from "./fixtures";

// Regression for vercel/next.js#91448 (production Sentry Issue #161).
//
// Turbopack's runtime `registerChunk` awaits `Promise.all(otherChunks)` before
// instantiating the entry module that calls `getAssetPrefix()` →
// `document.currentScript`. When a sibling chunk's registration resolves that
// await outside script evaluation — which engines like Pale Moon do natively,
// and which production hits on the upstream issue report on mainstream
// Safari/Chrome/Edge/Firefox — `document.currentScript` is `null` and Next
// throws "Expected document.currentScript to be a <script> element" before
// hydration, leaving the page painted but completely non-interactive.
//
// This spec reproduces that condition deterministically: it rewrites one of
// the chunks the runtime awaits so its `TURBOPACK.push` fires from a
// setTimeout task (still eagerly capturing `document.currentScript`, exactly
// like the real push does) instead of synchronously during script evaluation.
// With the patched `getAssetPrefix` (patches/next+16.3.5.patch, the upstream
// PR #91452 fallback), bootstrap recovers via the last `/_next/` script and
// hydration completes; unpatched, the invariant throws and this test fails on
// both the hydration wait and the fixture's pageerror teardown.
test("hydration survives a task-boundary chunk registration (#161)", async ({ page, request }) => {
  // Discover the Turbopack runtime chunk and the sibling chunks it awaits.
  // Filenames are build-hashed, so they cannot be hardcoded.
  const html = await (await request.get("/")).text();
  const runtimeSrc = html.match(/src="([^"]*turbopack-[^"]*\.js)"/)?.[1];
  expect(runtimeSrc, "homepage must reference a turbopack runtime chunk").toBeTruthy();
  const runtimeBody = await (await request.get(runtimeSrc as string)).text();
  const awaited = new Set(
    [...runtimeBody.matchAll(/otherChunks:\[([^\]]*)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/"([^"]+)"/g)].map((n) => n[1])
    )
  );
  expect(awaited.size, "runtime chunk must await sibling chunks").toBeGreaterThan(0);
  const deferredChunk = [...awaited].pop() as string;

  let deferredUrl: string | null = null;
  await page.route(/\/_next\/static\/.*\.js$/, async (route) => {
    const url = route.request().url();
    if (deferredUrl || !url.endsWith(`/${deferredChunk}`)) return route.continue();
    const response = await route.fetch();
    const body = await response.text();
    const marker = "(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push([";
    const csExpr = '"object"==typeof document?document.currentScript:void 0,';
    const csAt = body.indexOf(csExpr);
    const closeAt = body.lastIndexOf("])");
    if (!body.startsWith(marker) || csAt <= 0 || closeAt <= csAt) {
      return route.fulfill({ response, body });
    }
    const rest = body.slice(csAt + csExpr.length, closeAt);
    deferredUrl = url;
    return route.fulfill({
      response,
      body:
        ";var __d161=[document.currentScript," +
        rest +
        "];setTimeout(function(){(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(__d161)},50);",
    });
  });

  await page.goto("/", { waitUntil: "load" });
  expect(deferredUrl, "the deferred sibling chunk was never requested").toBeTruthy();

  // The assertion that matters: React actually attaches. Without the
  // getAssetPrefix fallback, the bootstrap invariant fires first and this
  // waits forever; the fixture teardown also fails on the pageerror.
  await waitForHydration(page);
});
