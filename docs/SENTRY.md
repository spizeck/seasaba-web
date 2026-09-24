# Sentry error monitoring (#129) + releases & source maps (#130)

Error monitoring for the Sea Saba website, reporting to the `sea-saba-web`
Sentry project. This document is the operational reference: what is captured,
when it is active, how releases and source maps work, how privacy is
enforced, and how to verify the integration in production.

## What Sentry is for here

- Uncaught **browser** errors (React render errors, event handlers, async
  failures) via the browser SDK in `instrumentation-client.ts`.
- Uncaught **server/Node.js** errors — Server Components, route handlers,
  server actions — via `sentry.server.config.ts` plus the framework hook
  `onRequestError` in `instrumentation.ts`.
- React errors that escape the locale root layouts via `app/global-error.tsx`.
- **Readable stack traces**: production builds upload browser and server
  source maps under the release the deploy is tagged with (#130), so events
  resolve to original repository source instead of `_next/static` /
  `_next/server` chunks.

Explicitly **not** enabled: performance tracing, Session Replay, profiling,
user feedback, logs/metrics. Those are not omitted by accident — the init
files are pinned by unit tests (`tests/unit/sentry.test.ts`).

## Activation — production only

One centralized decision lives in `lib/sentry.ts`:

```
isSentryActive() ===
  sentryDeploymentEnv() === "production"  &&  NEXT_PUBLIC_SENTRY_DSN is set
```

- `sentryDeploymentEnv()` reads `NEXT_PUBLIC_VERCEL_ENV` (browser-inlined by
  Vercel's system env-var auto-exposure) with `VERCEL_ENV` as the server-side
  fallback.
- `NODE_ENV` is deliberately **not** part of the decision: Vercel Preview
  deployments run production-mode Next.js builds, so `NODE_ENV=production`
  cannot distinguish Preview from Production.
- Both SDKs always call `Sentry.init(...)` but pass `enabled: isSentryActive()`.
  Outside a real Vercel Production deployment the client exists but drops
  every event — Preview, local dev, unit/E2E/CI cannot emit Sentry traffic.
- A missing/blank DSN fails closed the same way.

If Vercel's "Automatically expose System Environment Variables" option were
ever disabled, `NEXT_PUBLIC_VERCEL_ENV` would stop reaching the browser and
browser capture would silently deactivate (fail closed). The server side
uses `VERCEL_ENV`, which Vercel always sets, and would keep working.

## Environment variables

| Variable | Scope | Secret? | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel Production only | No — a DSN only permits event ingestion | Browser + server event destination. Set **only** in the Production env so Preview inherits nothing. |
| `SENTRY_AUTH_TOKEN` | Vercel Production only | **Yes — build-time secret** | Authenticates release creation + source-map upload during `next build`. Never `NEXT_PUBLIC_*`; never needed locally. Use an internal-integration or org auth token with `org:read` + `project:releases` scopes. |
| `SENTRY_ORG` | Vercel Production only | No — identifier | Org slug for the build plugin. Not needed if the token is org-scoped (`sntrys_…`). |
| `SENTRY_PROJECT` | not required | No | The project slug is pinned in code — `project: "sea-saba-web"` in `next.config.ts` — so no env var is needed. |
| `VERCEL_ENV` / `NEXT_PUBLIC_VERCEL_ENV` | platform-supplied | No | Deployment context; no manual setup on Vercel. |
| `VERCEL_GIT_COMMIT_SHA` | platform-supplied | No | The release identity (below); no manual setup. |

All four `SENTRY_*`/`NEXT_PUBLIC_SENTRY_*` variables belong to the **Vercel
Production environment only** — do not set them on Preview, or PR builds
would create releases and upload maps.

## Release strategy — deployed Git SHA (no manual versioning)

Releases use the **Vercel/Git commit SHA**, auto-detected by the SDK — there
is intentionally no explicit `release.name` config:

1. During `next build`, `withSentryConfig` resolves the release name from
   `SENTRY_RELEASE` → CI commit env vars (on Vercel: `VERCEL_GIT_COMMIT_SHA`)
   → `git rev-parse HEAD`, then injects it into `nextConfig.env` as
   `_sentryRelease`, which Next inlines into **both** the client and server
   bundles.
2. Both SDK inits read `process.env._sentryRelease` → events carry the SHA.
3. The post-compile upload step creates the Sentry release and uploads
   source maps under that same name, and on Vercel also associates commits
   (`setCommits`) and records a `vercel-production` deploy.

So `event.release` == uploaded source-map release == deployed Vercel commit
== Git SHA. Verified on #129's deploys (`d26e83a…`, `08da3607…`). Do not add
human version numbers.

## Source maps (#130)

- **Mechanism**: `@sentry/nextjs@10.74.0` + Turbopack uses Next's
  `compiler.runAfterProductionCompile` hook (Next ≥ 15.4.1). After the build
  the SDK creates the release, relies on Turbopack **native debug IDs**
  (`turbopack.debugIds: true`, auto-set on Next ≥ 16), then uploads
  `.next/server/**` + `.next/static/chunks/**` (+ `static/immutable/chunks`)
  via `sentry-cli`'s debug-id artifact-bundle protocol.
- **Coverage**: browser maps are generated via `productionBrowserSourceMaps`
  (auto-set by the SDK for Turbopack); server maps are emitted by Turbopack
  production builds by default. Both upload under the release above.
- **Production-only**: `lib/sentry-build.ts` enables upload + release
  creation only when `VERCEL_ENV === "production"` during the build.
  Preview/local/test/CI builds run the same code path fully disabled — no
  maps generated, no releases created, no token required.
- **Public exposure**: `sourcemaps.deleteSourcemapsAfterUpload: true`
  deletes `.next/static/**/*.map` after upload **and** strips the
  `//# sourceMappingURL=` comments, so `/_next/static/…/*.map` is never
  publicly fetchable and browsers don't even request it. Server maps stay
  inside `.next/server/` — never a public path — where they also serve
  Next's own runtime stack formatting.
- **Failure behavior**: `errorHandler` in `lib/sentry-build.ts` rethrows —
  the plugin's default only *logs* upload errors, which would silently ship
  an unsymbolicated deploy. Ours fails the build instead. Additionally, a
  production build missing `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` (non-`sntrys_`
  tokens), or a resolvable release SHA **fails at config load** before
  compiling. Tradeoff, deliberately accepted: a Sentry outage can delay a
  deploy until retry — it can never take the live site down, because a
  failed Vercel build leaves the previous deployment serving.
- **Turbopack patch**: the `patch-package` patch for `asset-prefix.js`
  (#162) modifies a client runtime file; Turbopack compiles the patched
  source and its source map reflects the patch. Nothing extra needed — a
  unit test asserts the patch is applied to `node_modules` after install.

## Build-time prerequisites (enforced)

On `VERCEL_ENV=production` builds, `assertSentryProductionBuildConfig`
throws before compilation unless all of these hold:

- `SENTRY_AUTH_TOKEN` set (non-empty)
- `SENTRY_ORG` set, unless the token is org-scoped (`sntrys_…`)
- a release identity is resolvable (`VERCEL_GIT_COMMIT_SHA`,
  `SENTRY_RELEASE`, or `git rev-parse HEAD`)

## Privacy posture

The site handles customer inquiries, booking hand-offs (Checkfront),
WhatsApp links and Respond.io chat. Sentry must not become a customer-data
collection system. Three layers enforce that:

1. **Init options** (browser + server): `sendDefaultPii: false` and a
   `dataCollection` block that disables `userInfo`, `cookies`, request and
   response `httpHeaders`, all `httpBodies`, and `urlQueryParams`.
2. **Centralized sanitizer** — `sanitizeSentryEvent` in `lib/sentry.ts` runs
   as `beforeSend` on both SDKs for every event regardless of source: it
   strips query strings and fragments from request URLs, breadcrumb URLs and
   stack-frame URLs, and deletes `request.data` (bodies), `request.cookies`,
   `request.headers`, `request.query_string` and `event.user`.
3. **No first-party data attached**: nothing in the app adds Sentry context,
   tags with customer values, or form state.

Source maps do not change this posture: they reveal *code structure* (already
shipped publicly in minified form), never runtime data. Auth token and upload
traffic stay inside the build — nothing secret reaches the browser bundle.

## CSP

`connect-src` gains exactly one origin: the `https:` origin parsed out of
`NEXT_PUBLIC_SENTRY_DSN` at config load (`next.config.ts`). No DSN → no
Sentry origin at all. No `*.sentry.io` wildcard is used anywhere. Unit tests
pin both behaviors.

## Token rotation

1. Sentry → Settings → Auth Tokens (or the internal integration) → create a
   replacement token with `org:read` + `project:releases`.
2. Vercel → project → Settings → Environment Variables → update
   `SENTRY_AUTH_TOKEN` (Production scope only).
3. Trigger a production redeploy; confirm the build log shows the release
   creation + "Successfully uploaded source maps to Sentry".
4. Revoke the old token in Sentry.

## Recovery

- **Failed upload / invalid token**: the production build fails — the live
  site keeps the previous deployment. Check the Vercel build log for the
  `[sentry] release/source-map upload failed` line; fix the token/org and
  redeploy. Transient Sentry outage → just redeploy once it recovers.
- **Missing release**: if events show a SHA with no matching release in
  Sentry, the build's upload step didn't run for that commit (check the
  build log). Redeploy that commit, or upload manually with
  `sentry-cli releases …` using the same SHA.
- **Unsymbolicated event**: confirm `event.release` matches a Sentry release
  whose artifacts were uploaded (Releases → SHA → Source Maps). If the
  release exists but frames stay minified, check `js_no_source` vs missing
  debug IDs — the build log shows which artifacts were uploaded.
- **Source map accidentally public**: fetch
  `https://www.seasaba.com/_next/static/chunks/<name>.js.map` — must 404.
  If a map is reachable, verify `deleteSourcemapsAfterUpload` wasn't
  overridden and the deploy was a production build (Preview/local don't
  generate maps at all).

## Production verification — #129 completed 2026-09-23

Initial production verification ran against the first production deploy
carrying #129 via the temporary `/sentry-check` page (removed once
verification succeeded — it was never a permanent surface):

- **Browser capture** verified: controlled exception tagged
  `source: sentry-check`, `surface: browser` arrived in `sea-saba-web` with
  `environment: production`.
- **Server capture** verified: controlled exception tagged
  `source: sentry-check`, `surface: server` arrived separately
  (`platform: node`, Node 24, Vercel server environment).
- **Production-only operation** verified: no events from Preview or other
  environments.
- **Sanitization** manually inspected on both events: no unexpected customer
  PII, no query strings/cookies/request bodies/user fields.
- Tracing remained unsampled; both stacks were intentionally
  **unsymbolicated** until #130 — Sentry reported `js_no_source` for the
  `_next/static/...` browser chunk and `_next/server/...` server chunk.

## Post-merge verification — #130

After the first production deploy carrying this change:

1. **Build log**: Vercel production build log shows release creation and
   "Successfully uploaded source maps to Sentry" under the deploy SHA; no
   `[sentry] release/source-map upload failed`.
2. **Release**: Sentry → Releases shows the deploy SHA; it has uploaded
   source-map artifacts (debug-id bundles) covering both
   `_next/static/chunks/…` and `_next/server/…`.
3. **Symbolication**: any new production event (or a recurrence of the
   #161 `TypeError: WeakMap keys must be objects or non-registered symbols`)
   must show original `app/`/`components/`/`lib/` source frames for both
   browser and server stacks — that is what makes the WeakMap error
   attributable to Sentry internals, Next/Turbopack, Web Vitals, app code,
   or a third-party library.
4. **No public maps**: `curl -I https://www.seasaba.com/_next/static/chunks/<chunk>.js.map`
   → 404 for every emitted chunk; the deployed `.js` files contain no
   `sourceMappingURL` comment.
5. **No secret leakage**: grep the deployed client chunks for the token —
   `SENTRY_AUTH_TOKEN` must appear nowhere in `/_next/static/` output.
6. **Preview stays dark**: a PR preview build creates no release, uploads
   nothing, and emits no events.

If an existing real error (e.g. the WeakMap recurrence) provides coverage of
steps 1–3, no temporary diagnostic route is needed. Only if production stays
clean should a minimal throw-on-demand check be added temporarily and removed
immediately after — same pattern as #129's `/sentry-check`.

## Dependency licensing note — `@sentry/cli` (reviewed 2026-09-23, activated by #130)

`@sentry/nextjs@10.74.0` pulls in `@sentry/cli@2.58.6` (plus eight optional
platform-binary packages, same version) as a **regular transitive dependency**
of `@sentry/bundler-plugin-core` / `@sentry/bundler-plugins`, which power
`withSentryConfig`. As of #130 it is invoked at build time for its intended
purpose — release creation and source-map upload inside production `next
build` runs only.

License: **FSL-1.1-MIT** (Functional Source License v1.1, MIT future license),
per the `LICENSE` shipped in the package and `getsentry/sentry-cli`. It grants
use, copy, modification and redistribution for any purpose other than a
"Competing Use" (offering the software itself, or substantially similar
functionality, as a commercial product/service), and converts to plain MIT two
years after each release. Sentry explains the model at
`https://open.sentry.io/licensing/` and in its "Introducing the Functional
Source License" blog post.

Our use — Sentry's own build tooling inside the vendor-supported SDK
integration, on a commercial marketing site — is a Permitted Purpose: Sea Saba
does not sell, redistribute, or host the CLI or anything like it. Trivy flags
`FSL-1.1-MIT` only because its license database does not classify it; the
license was manually reviewed and accepted here rather than suppressed in
scanner config. The #130 activation does not change the usage class — no
re-review needed unless `@sentry/cli` changes version or licensing upstream.

## Deferred work

- **#131** — alert policies, triage runbook, ownership/escalation tuning.
