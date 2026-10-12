---
name: production-readiness
description: Production readiness doctrine — CI gates, environment separation, secrets management, Sentry/monitoring posture, error handling, deployment validation, and rollback. Use when changing CI/CD, deployment config, environment variables, monitoring/error reporting, or preparing a release. Never deploy or modify production infrastructure without explicit approval.
---

# Production readiness

What "safe to ship" means in this ecosystem. **Each repository's CI,
deployment docs, and environment setup are authoritative** — this is
the standard they are held to, not a replacement.

## CI gates

- The core pipeline on every PR and push to `main`: **`npm ci` →
  format check → lint → typecheck → tests → production build**.
  Browser smoke tests run against the built output (`next start`),
  never `next dev` — dev-server evaluation differs from production
  evaluation.
- **CI runs with zero secrets.** `next build` evaluates no service
  clients (lazy initialization). If a build needs an env value, fix
  the code — never add dummy or real secrets to CI.
- Workflow hygiene: `contents: read` permissions, checkouts with
  `persist-credentials: false`, actions pinned to full commit SHAs,
  concurrency cancellation on superseded runs.
- Separately deployable units (app, Functions, rules, database) are
  separate jobs with their own lockfiles — a Functions failure must
  not hide inside an app job.
- Playwright sets `forbidOnly` on CI; tests are deterministic
  (`retries: 0` default — retries turn broken suites into silence).

## Environments and secrets

- Local → preview → production are **separate resources**: separate
  databases/branches, separate credentials, separate provider
  accounts/sandboxes where they exist.
- `.env*` is gitignored; committed examples carry names and comments
  only. Nothing reads `process.env` at module load; env parsing is
  validated and lazy per concern.
- Secrets never appear in `NEXT_PUBLIC_*`, logs, error surfaces, docs,
  tests, or CI. A leak means rotation, not a shrug — report it
  immediately.
- Test-mode-only deployments reject live-mode keys at startup where
  the boundary exists (e.g. `sk_live_*` refused).

## Error handling and observability

- Structured single-line logs with explicit `level` and `outcome`
  (`success` / `expected_failure` / `operational_failure` /
  `unexpected_failure`). Expected authorization denials and framework
  control-flow throws are not failures.
- **Safe-by-construction logging**: forbidden-field lists plus
  value-level redaction (secrets, tokens, PII, request bodies);
  errors summarized to name/code — raw messages and stacks routinely
  carry sensitive data.
- One funnel for unexpected failures (e.g. `onRequestError` → Sentry)
  — nothing in the funnel may throw.
- Sentry posture: optional and off without a DSN, lazy init,
  `sendDefaultPii: false`, no traces/replay/profiles by default, CSP
  connect-src derived from the DSN origin only.
- Durable **audit logs are domain code** (who changed what), separate
  from operational logs — observability tooling is not an audit trail.
- A `/api/health`-style liveness surface that exposes no configuration
  internals.

## Deployment validation and rollback

- Know the deploy mechanism before changing it (git-push → Vercel is
  the common pattern; Firebase rules/Functions have their own paths).
- Pre-deploy: the full check gate is green on the exact commit being
  shipped; migrations planned per `database-safety`; env changes
  staged in the target environment before code depends on them.
- Post-deploy validation is part of "done": health endpoint, a real
  render of the changed surface, Sentry quiet.
- Rollback is a documented path (revert PR / prior deployment restore),
  not improvisation under pressure — state it for risky changes
  before shipping.
- Preview deployments exist for review; they are not production and
  must never share production data or live credentials.

## Hard boundary

**Never deploy, modify production infrastructure, rotate credentials,
run migrations, or change environment configuration autonomously** —
these require explicit human authorization. Preparing and verifying
the change is agent work; executing it against production is not.
