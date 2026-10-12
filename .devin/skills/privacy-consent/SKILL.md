---
name: privacy-consent
description: Privacy and consent engineering — Klaro CMP, Google Consent Mode v2, consent-aware analytics, data minimization, privacy-by-design, retention, and sensitive account data. Use when touching analytics/tracking, cookies, consent UI, user data collection, third-party embeds, or anything that processes personal data. Jurisdiction-specific legal requirements must be verified, never assumed.
---

# Privacy and consent

How this ecosystem handles tracking, consent, and personal data.
**The repository's own consent implementation and legal/compliance
guidance are authoritative** — this skill encodes the engineering
boundary, not legal advice.

## Consent architecture (the house pattern)

The canonical stack — self-hosted **Klaro CMP** + **Google Consent
Mode v2** + GTM/GA4 — exists as a proven implementation
(`consent-analytics` module in app-foundations, extracted from
production). Where a repo uses it, preserve these invariants:

- **Deny by default.** The `consent` `default` command is pushed onto
  `dataLayer` by the same inline script that pushes `gtm.start` — one
  script, impossible to race. No Google tag may evaluate before
  consent state exists.
- **Self-hosted CMP.** Klaro is an npm dependency loaded from the
  app's own bundle — no hosted consent service, no vendor IDs, no
  remote assets.
- **Versioned consent storage.** The consent cookie embeds a policy
  version (`app-consent-v<N>`); bumping it re-asks every visitor
  instead of carrying consent forward under an outdated policy.
- **Privileged surfaces are analytics-free by construction** — the
  transport refuses events on excluded prefixes (e.g. `/admin*`),
  bootstrap never loads the container there, and a client-side
  navigation into an excluded path is forced into a clean reload.
- **The application owns page views** — the GTM Google tag is
  configured `send_page_view=false`; duplicate page views are
  impossible by construction.
- **Analytics only where they belong** — production-only gating means
  preview deployments and local dev never load tracking.

## Data minimization

- Collect what the feature needs; justify anything more. Do not wire
  a third-party script "just in case" — each one is a consent surface
  and a CSP surface.
- Analytics and tag-manager configuration carries no PII:
  `sendDefaultPii: false`-style posture, no emails/IDs/names in event
  params unless deliberately designed and disclosed.
- Sensitive routes (token-bearing links, auth flows, admin,
  confidential submissions) get `noindex`, no-store where
  appropriate, and stay out of every analytics, error-reporting, and
  search surface.
- CSP origins are feature-gated — a third-party origin enters the
  policy only when the feature's env var is configured.

## Privacy by design

- New features that touch personal data state their data flow in the
  PR: what is collected, where it goes, who can see it, how long it
  lives.
- Confidential/sensitive channels (tips, health, financial, minors)
  are architecturally isolated — never routed through generic
  contact forms, analytics, email queues, or search indexes.
- Audit trails for privileged access to personal data are durable
  domain records, not operational logs.
- **Retention**: data has a lifecycle. Deletion paths and retention
  limits are designed, not emergent — if a feature stores personal
  data, say how it comes out.
- Account-sensitive data (credentials, recovery tokens, payment
  instruments) follows the strictest handling: server-only, never
  logged, never in URLs.

## Consent-aware engineering checklist

- [ ] New trackers/pixels/embeds registered in the consent registry
      with a declared purpose — not hardcoded around the CMP.
- [ ] Consent `default` still precedes any tag execution (deny-first
      ordering intact).
- [ ] Privileged/admin/excluded paths still carry zero analytics.
- [ ] Withdrawal actually stops the tracking it claims to stop.
- [ ] No PII in event params, URLs, logs, or error reports.
- [ ] Preview/dev environments still tracking-free.

## Legal boundary

**Jurisdiction-specific obligations are verification tasks, not
assumptions.** GDPR/ePrivacy, CCPA/CPRA, Dutch Caribbean rules, and
sector-specific duties differ; whether a given flow requires consent,
notice, DPO review, or a DPA is a question for the owner/legal, not
for the agent to decide. Flag the question in the PR rather than
guessing — and never present an implementation as "compliant" on the
agent's own authority.
