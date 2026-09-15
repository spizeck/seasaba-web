# Security Policy

## Scope

This repository contains the public Sea Saba marketing website
(`https://www.seasaba.com`) — a Next.js static/server-rendered site with no
user accounts, authentication, or stored personal data. The only live data
is anonymous read-only access to public Firestore collections (dive log).
Booking and payments are handled entirely by Checkfront, a separate vendor
system.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately rather than in a public
issue:

- Use GitHub's **"Report a vulnerability"** flow on this repository's
  Security tab, if enabled; otherwise
- Email **info@seasaba.com** with the subject "Security — seasaba-web".

Include steps to reproduce and the affected route or configuration. We will
acknowledge reports as soon as practical and follow up once resolved or
declined.

## Security-relevant implementation

- HTTP security headers (CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`) are
  set in `next.config.ts` and verified by the test suites (see
  `docs/TESTING.md`).
- Third-party scripts are limited to the hosts allow-listed in the CSP
  (Checkfront, GTM/GA, Microsoft Clarity, Cookiebot, Vercel).
- Dependencies are updated via Dependabot (weekly, grouped minor/patch) and
  `npm audit`. GitHub code scanning (CodeQL default setup, configured in
  repository settings — not a committed workflow) analyzes PRs and the
  default branch weekly.
- Cookie/consent management is documented in
  `docs/COOKIEBOT_CONSENT_SETUP.md`.

## Content Security Policy

The CSP lives in `next.config.ts` as a directive map with per-origin comments;
every allowed origin exists because an observed request or a confirmed
integration requires it. Per-origin rationale is maintained inline in that
file — it is the canonical reference.

Deliberate allowances:

- `script-src 'unsafe-inline'` — Next.js renders inline hydration/flight
  scripts and `next/script` initializers on every page. Removing it requires
  nonce-based rendering, which forces per-request dynamic rendering and loses
  static generation; rejected for now. See "Nonce evaluation" below.
- `script-src 'unsafe-eval'` — present only when `NODE_ENV !== "production"`
  (Next.js dev tooling evaluates modules). The production policy omits it;
  the unit tests and the e2e/production smoke suites assert that.
- `img-src https:` — tracking-pixel beacons are injected by GTM tags whose
  hosts change with container configuration; image loads are low-risk and a
  fixed allowlist would silently break measurement.
- Google-family hosts (`google-analytics`, `googleadservices`, `doubleclick`,
  `google.com`) — the tag set is configured in the external GTM container
  (`GTM-5PFMJFN`), not this repo. Treat additions/removals there as the
  source of truth.
- `vercel.live` — only ever loaded by the Vercel Live toolbar on preview
  deployments; never requested on production.

Deliberately absent:

- `upgrade-insecure-requests` — upgrades subresource requests even on the
  local `http` test server under WebKit, breaking the e2e suite; production
  is already HSTS-enforced.
- `Permissions-Policy` entries for `autoplay`, `fullscreen`, and
  `picture-in-picture` — the YouTube dive-site embeds delegate these via the
  iframe `allow` attribute.
- `Cross-Origin-Embedder-Policy` / `Cross-Origin-Resource-Policy` — COEP
  would break every third-party embed; CORP gains little on a site whose
  assets are not consumed cross-origin.
- `report-uri`/`report-to` — no reporting endpoint exists; adding one
  requires a collection sink decision (follow-up, not a scanner reflex).

Nonce evaluation: a per-request CSP nonce would let us drop `'unsafe-inline'`,
but on this deployment it requires middleware to stamp every response —
forcing dynamic rendering, bypassing the static cache, and adding a moving
part to every page. Hash-based policies are unmaintainable because GTM
injects scripts whose contents change without a code deploy. Revisit only if
the site moves to fully dynamic rendering for other reasons.

Testing a CSP change: `npm run build:test && npm run test:e2e` exercises the
production header set locally; `node scripts/csp-observe.mjs [url]` captures
real third-party hosts and CSP violations against any deployment (use the
Vercel preview URL — GTM tags only load where `NEXT_PUBLIC_GTM_ID` is set).
A blocked request shows a console error naming the directive; confirm which
feature requested it before allowlisting — the fix may be removing the
feature's stray request rather than widening the policy.
