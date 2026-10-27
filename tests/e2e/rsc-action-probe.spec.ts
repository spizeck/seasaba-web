import { test, expect } from "./fixtures";

/**
 * Upstream defect coverage — vercel/next.js E789 (PR #97568, unmerged at
 * next@16.3.8): a POST carrying `Next-Action` + `RSC: 1` headers against an
 * app with zero server actions made the app-page runtime throw
 * `InvariantError: Expected RSC response, got text/plain` and answer 500
 * instead of serving the action handler's own deliberate 404. Internet
 * scanner traffic hits this shape in production (POST /index.rsc), and each
 * hit was a server-side Sentry event.
 *
 * `patches/next+16.3.8.patch` mirrors the upstream fix: serve the
 * `x-nextjs-action-not-found` 404 instead of asserting on the content type.
 * When Next.js ships the real fix the patch can be dropped — these tests
 * must keep passing either way.
 */

// Synthetic reference ID — this app defines no server actions, so any
// Next-Action value is unrecognized and takes the not-found path.
const BOGUS_ACTION_ID = "0000000000000000000000000000000000000000";

test("RSC action probe returns 404, not the E789 500", async ({ request }) => {
  // `/index.rsc` is the prerendered RSC path Vercel routes to `/`; it is the
  // exact shape the production Sentry event carried.
  const indexRsc = await request.post("/index.rsc", {
    headers: { "Next-Action": BOGUS_ACTION_ID, RSC: "1" },
  });
  expect(indexRsc.status()).toBe(404);
  expect(indexRsc.headers()["x-nextjs-action-not-found"]).toBe("1");

  // Same shape through the page URL; Next first 307s to the ?_rsc
  // cache-buster URL, so follow redirects and land on the 404.
  const viaPage = await request.post("/", {
    headers: { "Next-Action": BOGUS_ACTION_ID, RSC: "1" },
  });
  expect(viaPage.status()).toBe(404);
  expect(viaPage.headers()["x-nextjs-action-not-found"]).toBe("1");
});

test("ordinary action-not-found and RSC navigation still behave", async ({ request }) => {
  // POST without the RSC header took the correct 404 path even before the
  // patch — pinned so the two variants can't diverge again.
  const plain = await request.post("/", {
    headers: { "Next-Action": BOGUS_ACTION_ID },
    maxRedirects: 0,
  });
  expect(plain.status()).not.toBe(500);

  // Client-side navigations must still get real flight payloads.
  const rsc = await request.get("/", { headers: { RSC: "1" } });
  expect(rsc.status()).toBe(200);
  expect(rsc.headers()["content-type"]).toContain("text/x-component");
});
