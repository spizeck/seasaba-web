# Sentry error monitoring (#129)

Baseline error monitoring for the Sea Saba website, reporting to the
`sea-saba-web` Sentry project. This document is the operational reference:
what is captured, when it is active, how privacy is enforced, and how to
verify the integration in production.

## What Sentry is for here

- Uncaught **browser** errors (React render errors, event handlers, async
  failures) via the browser SDK in `instrumentation-client.ts`.
- Uncaught **server/Node.js** errors — Server Components, route handlers,
  server actions — via `sentry.server.config.ts` plus the framework hook
  `onRequestError` in `instrumentation.ts`.
- React errors that escape the locale root layouts via `app/global-error.tsx`.

Explicitly **not** enabled: performance tracing, Session Replay, profiling,
user feedback, logs/metrics, release tracking, source maps. Those are not
omitted by accident — see "Deferred work" below.

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
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel Production only | No — a DSN only permits event ingestion | Browser + server event destination. Set **only** in the Production env so Preview inherits nothing. This is the **only** env var #129 requires. |
| `SENTRY_ORG` | optional | No — identifier | Org slug for the build plugin; needed when #130 adds release/source-map upload. |
| `VERCEL_ENV` / `NEXT_PUBLIC_VERCEL_ENV` | platform-supplied | No | Deployment context; no manual setup on Vercel. |

`SENTRY_AUTH_TOKEN`, release identity and source-map upload are #130 scope
and are intentionally not referenced anywhere yet.

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

What events *may* contain: route/path information, stack traces, browser/OS
context, the `production` environment tag, and SDK diagnostics. That is the
useful minimum for debugging a marketing site.

## CSP

`connect-src` gains exactly one origin: the `https:` origin parsed out of
`NEXT_PUBLIC_SENTRY_DSN` at config load (`next.config.ts`). No DSN → no
Sentry origin at all. No `*.sentry.io` wildcard is used anywhere. Unit tests
pin both behaviors.

## Production verification — completed 2026-09-23

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
  **unsymbolicated** (source maps are #130).

**For #130:** both events already carried the release identity
`d26e83a760ab2fd6c503a8e10da2333b46649f65` — the deployment's Git SHA,
auto-populated by the SDK (no explicit release config exists yet). #130
should inspect how that SHA is populated before adding explicit release
configuration. Sentry reported `js_no_source`/missing source for both
stacks: browser frames referenced a production `_next/static/...` chunk,
server frames a production `_next/server/...` chunk — exactly what
source-map upload in #130 is for.

## Dependency licensing note — `@sentry/cli` (reviewed 2026-09-23)

`@sentry/nextjs@10.74.0` pulls in `@sentry/cli@2.58.6` (plus eight optional
platform-binary packages, same version) as a **regular transitive dependency**
of `@sentry/bundler-plugin-core` / `@sentry/bundler-plugins`, which power
`withSentryConfig`. It is not separately removable: the bundler plugins declare
it as a normal dependency, so the supported SDK ships it. In this repository
it is never invoked — source-map upload and release management are disabled
(#130 scope) and no `SENTRY_AUTH_TOKEN` is configured.

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
scanner config. Re-review if the CLI ever gets invoked for release/source-map
work in #130 (still covered — same usage class) or if the licensing model
changes upstream.

## Deferred work

- **#130** — release identity, Git SHA association, `SENTRY_AUTH_TOKEN`,
  source-map upload and production symbolication.
- **#131** — alert policies, triage runbook, ownership/escalation tuning.
