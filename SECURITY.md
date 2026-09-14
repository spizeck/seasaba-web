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
  `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts` and
  verified by the test suites (see `docs/TESTING.md`).
- Third-party scripts are limited to the hosts allow-listed in the CSP
  (Checkfront, GTM/GA, Microsoft Clarity, Cookiebot, Vercel).
- Dependencies are updated via Dependabot (weekly, grouped minor/patch) and
  `npm audit`; CodeQL analysis runs on PRs.
- Cookie/consent management is documented in
  `docs/COOKIEBOT_CONSENT_SETUP.md`.
