import { test, expect } from "./fixtures";

/**
 * Upstream defect coverage — vercel/next.js E789 (PR #97568, unmerged at
 * next@16.4.6): a POST carrying `Next-Action` + `RSC: 1` headers against an
 * app with zero server actions made the app-page runtime throw
 * `InvariantError: Expected RSC response, got text/plain` and answer 500
 * instead of serving the action handler's own deliberate error. Internet
 * scanner traffic hits this shape in production (POST /index.rsc), and each
 * hit was a server-side Sentry event.
 *
 * `patches/next+16.4.6+002.action-not-found-rsc-404.patch` plus
 * `patches/next+16.4.6+003.preserve-action-status.patch` mirror the
 * upstream fix: serve the `x-nextjs-action-not-found` early return instead
 * of asserting on the content type, while preserving whatever status the
 * action handler set — 400 for a malformed action ID, 409 for a
 * well-formed ID that names no action. When Next.js ships the real fix the
 * patches can be dropped — these tests must keep passing either way.
 */

// These IDs name no server action in the app, so they are unrecognized
// and take the not-found path. The status comes from
// getUnrecognizedActionStatusCode: 400 when the ID cannot be a server
// reference (wrong length), 409 when it is well-formed but unknown.
const MALFORMED_ACTION_ID = "0000000000000000000000000000000000000000"; // 40 chars
const WELL_FORMED_ACTION_ID =
  "000000000000000000000000000000000000000000"; // 42 chars

test("RSC action probe returns the handler status, not the E789 500", async ({
  request,
}) => {
  // `/index.rsc` is the prerendered RSC path Vercel routes to `/`; it is the
  // exact shape the production Sentry event carried.
  const indexRsc = await request.post("/index.rsc", {
    headers: { "Next-Action": MALFORMED_ACTION_ID, RSC: "1" },
  });
  expect(indexRsc.status()).toBe(400);
  expect(indexRsc.headers()["x-nextjs-action-not-found"]).toBe("1");

  // A well-formed ID that names no action is 409, not a generic 404.
  const wellFormed = await request.post("/index.rsc", {
    headers: { "Next-Action": WELL_FORMED_ACTION_ID, RSC: "1" },
  });
  expect(wellFormed.status()).toBe(409);
  expect(wellFormed.headers()["x-nextjs-action-not-found"]).toBe("1");

  // Same shape through the page URL; Next first 307s to the ?_rsc
  // cache-buster URL, so follow redirects and land on the handler status.
  const viaPage = await request.post("/", {
    headers: { "Next-Action": MALFORMED_ACTION_ID, RSC: "1" },
  });
  expect(viaPage.status()).toBe(400);
  expect(viaPage.headers()["x-nextjs-action-not-found"]).toBe("1");
});

test("ordinary action-not-found and RSC navigation still behave", async ({
  request,
}) => {
  // POST without the RSC header returned the handler status even before the
  // patch — pinned so the two variants can't diverge again.
  const plain = await request.post("/", {
    headers: { "Next-Action": MALFORMED_ACTION_ID },
  });
  expect(plain.status()).toBe(400);
  expect(plain.headers()["x-nextjs-action-not-found"]).toBe("1");

  const plainWellFormed = await request.post("/", {
    headers: { "Next-Action": WELL_FORMED_ACTION_ID },
  });
  expect(plainWellFormed.status()).toBe(409);
  expect(plainWellFormed.headers()["x-nextjs-action-not-found"]).toBe("1");

  // Client-side navigations must still get real flight payloads.
  const rsc = await request.get("/", { headers: { RSC: "1" } });
  expect(rsc.status()).toBe(200);
  expect(rsc.headers()["content-type"]).toContain("text/x-component");
  // Status + content-type alone can't prove the payload is flight data —
  // require at least one `<id>:<value>` flight row in the body.
  const body = await rsc.text();
  expect(body).toMatch(/^[0-9a-z]+:[\["{]/m);
});
