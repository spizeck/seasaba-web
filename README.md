# Sea Saba — Professional Scuba Diving Website

A fast, SEO-first, destination-led marketing website for Sea Saba, a professional scuba diving operation on the island of Saba in the Dutch Caribbean. Production site: https://www.seasaba.com (deployed on Vercel from `master`).

## Documentation index

| Doc | Contents |
|---|---|
| [docs/TESTING.md](docs/TESTING.md) | Test pyramid, commands, CI gates, accessibility and production smoke suites, performance budgets |
| [docs/ANALYTICS_SEO.md](docs/ANALYTICS_SEO.md) | Analytics/GTM/consent architecture, tracked events, sitemap and indexing rules |
| [docs/COOKIEBOT_CONSENT_SETUP.md](docs/COOKIEBOT_CONSENT_SETUP.md) | Cookiebot CMP + GTM consent-mode runbook |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Source of truth for operational facts (schedules, requirements, contact, Checkfront boundary) |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) | Dependabot update policy, dependency groups, and the major-version migration workflow |
| [docs/design/THEME_UX_GUIDE.md](docs/design/THEME_UX_GUIDE.md) | Brand colors, typography, spacing, imagery and UX rules |
| [docs/design/IMAGE_STANDARD.md](docs/design/IMAGE_STANDARD.md) | Image categories, ratios, naming and the `PageHero`/`FeatureImage` components |
| [docs/design/Sea_Saba_Logo_Spec_DEC_21.pdf](docs/design/Sea_Saba_Logo_Spec_DEC_21.pdf) | Official logo specification (brand asset) |
| [docs/historical/](docs/historical/) | Completed-work records: Wix migration report, original IA plan, early homepage spec, unimplemented reviews setup |
| [AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md) | Guardrails for AI coding agents |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |

## Automated tests

See [the testing guide](docs/TESTING.md) for the audit, coverage, fixtures, CI and required merge check. With Node 24, run `npm ci`, `npx playwright install chromium webkit`, then `npm run test:ci`. For fast feedback, use `npm test` or `npm run test:watch`.

This project is a migration from Wix to a custom Next.js stack.

The website is intentionally designed as a **premium, destination-first marketing site**, not a generic dive shop catalog.  
The homepage is a **positioning + routing page**, while inner pages carry the SEO-rich informational depth.

---

## Core Strategy

The site should communicate:

- Why dive **Saba**
- Why choose **Sea Saba**
- What experiences are available
- How to take the next step

### Strategic Principles
- **Destination-first** — sell Saba as a unique diving destination
- **Experience-led** — emphasize boat diving, signature sites, and trip planning
- **Trust-first** — calm, professional, safety-forward
- **SEO-first** — semantic, indexable, stable content architecture
- **Conversion-ready** — clear routing and strong Checkfront booking paths

This is **not** intended to be a retail-heavy or generic dive shop template.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Content:** TSX pages for marketing / informational / dive site content
- **Dynamic Data:** Firestore (dives, boats, sites, species — public read-only)
- **Booking:** Checkfront (deep links, embedded widgets)
- **Analytics:** Vercel Analytics, Google Analytics 4 (optional), Google Tag Manager (optional)
- **PDF Export:** jsPDF (premium card-style dive log export)
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

- **Node.js 24** — pinned in `.nvmrc`. Version managers that read `.nvmrc`
  (nvm on macOS/Linux, fnm everywhere) pick it up automatically
  (`nvm use` / `fnm use`). **nvm-windows ignores `.nvmrc`** — run
  `nvm install 24` once, then `nvm use <installed-24.x>` in each new shell.
- **npm** — ships with Node. No global CLIs are required; Playwright,
  Lighthouse and all other tooling are project dependencies run via
  `npm run` / `npx`.
- **Playwright browsers** — only for the browser test suites, not for
  `npm run dev`: `npx playwright install chromium webkit` (~370 MB download).
- **Chrome/Chromium** — only for `npm run test:perf`: a system Chrome,
  `CHROME_PATH`, or the Playwright Chromium install are all discovered
  automatically.

### Setup

```bash
npm ci                      # reproducible install from package-lock.json
cp .env.example .env.local  # placeholders are fine — see below
npm run dev                 # http://localhost:3000
```

Use `npm ci`, not `npm install`: CI and every documented test command assume
the exact lockfile dependency set. `npm install` may silently rewrite
`package-lock.json`.

`.env.local` can stay entirely placeholder: the site starts, every page
renders, and no analytics tags load. The only features that need real values
are live `/dive-log` data (Firebase) and the `/cookie-policy` declaration
widget (Cookiebot CBID). `.env.example` documents what each variable does and
which are optional. Do not use production credentials locally — a personal
Firebase project is enough for dive-log work.

### What runs without credentials

- The dev server, `npm run build`, lint, typecheck, unit/integration tests,
  coverage, browser E2E and performance budgets all work with placeholder
  env vars — the test build injects a demo Firebase project itself.
- `/dive-log` renders its "unable to load" state when Firestore is
  unreachable; no other page depends on Firebase.
- `/book` loads the real Checkfront widget from `seasaba.checkfront.com`
  (read-only browsing is safe — do not complete a real booking). If the
  vendor script is unreachable the page falls back to a direct booking link.
- GTM/GA4/ads/Clarity/Meta load only when `NEXT_PUBLIC_GTM_ID` is set, so
  local browsing sends no analytics. Vercel Analytics only reports from
  Vercel deployments; its `/_vercel/*` calls simply 404 on localhost.

### Troubleshooting

- **`EBADENGINE` warnings or strange install/test failures** — check
  `node -v`; it must be 24.x. On Windows, `npm` from
  `C:\Program Files\nodejs` pins its own bundled Node regardless of your
  version manager — make sure the manager's shim precedes it on PATH
  (`where node`).
- **nvm-windows didn't switch versions** — it does not read `.nvmrc`; run
  `nvm install 24` and `nvm use <installed-24.x>` explicitly.
- **Playwright "browser not found"** — run
  `npx playwright install chromium webkit`. On Linux also install the OS
  libraries (`npx playwright install --with-deps chromium webkit`); CI uses
  the official Playwright container which already has them.
- **`test:perf` can't find Chrome** — install Chrome, set `CHROME_PATH`, or
  rely on the Playwright Chromium from the step above.
- **Port already in use** — dev uses 3000; `test:e2e`/`test:smoke` start
  their own server on 3100 and `test:perf` on 3101, and they refuse to reuse
  a running server. Stop other `next` processes first.
- **`/dive-log` shows an error state** — expected without real Firebase
  `NEXT_PUBLIC_*` values; everything else is unaffected.
- **`test-public-firestore-read.mjs` prints "read allowed (0 docs)"** — it
  does not load `.env.local`; export the unprefixed `FIREBASE_*` variables
  first (see `docs/TESTING.md`).
- **`test:smoke:prod` hits the live site** — it is a read-only post-deploy
  check against https://www.seasaba.com, not a local test. On PowerShell set
  the target with `$env:SMOKE_BASE_URL="https://..."` (POSIX `VAR=value`
  syntax does not work there).
- **Windows shells** — snippets assume POSIX (`cp`, `export`,
  `VAR=value cmd`). In PowerShell use `Copy-Item` and `$env:VAR="..."`;
  cmd.exe has neither `cp` nor `export`.
- **Stale `.next` output** — after switching branches, delete `.next` and
  rebuild (`npm run build:test` for tests, `npm run build` for parity).

---

## Layout Rules (Critical)

There are exactly **two** layouts in this project:

### 1. Homepage Layout
- Static hero image at top
- Minimal copy
- Destination positioning + routing
- Strong but restrained CTA hierarchy
- No video backgrounds (the former video section was removed for performance in September 2026; see `docs/design/THEME_UX_GUIDE.md` if video is ever reintroduced)

### 2. Standard Content Layout
- Used for all non-home pages
- No video backgrounds
- Text-first, SEO-focused
- Breadcrumbs encouraged
- Semantic, content-rich, stable

Do not introduce additional layouts unless explicitly requested.

---

## Homepage Rules (Critical)

The homepage (`app/page.tsx`) currently follows this structure:

1. **Hero (Static Image)**
2. **Why Saba** — supporting static destination section
3. **The Dives That Made Saba Famous** — dive-area showcase with CTAs
4. **Plan Your Trip** — static routing sections
5. **Final CTA**

### Homepage Intent
The homepage should answer:

1. Why dive Saba?
2. Why Sea Saba?
3. What can I choose?
4. Where do I go next?

### Important Notes
- The homepage is **not** a content dump
- The homepage is **not** the primary SEO text page for every topic
- Detailed content belongs on inner pages
- Motion is minimal and only used on the homepage

---

## Project Structure

```text
app/
├── layout.tsx                     # Root layout (header, footer, fonts, SEO, JSON-LD)
├── page.tsx                       # Homepage (destination-first layout)
├── not-found.tsx                  # Custom 404 page
├── robots.ts                      # robots.txt
├── sitemap.ts                     # sitemap.xml
├── book/page.tsx                  # Booking page (Checkfront widget + fallback)
├── (content)/                     # Standard content layout group
│   ├── layout.tsx                 # Content layout (breadcrumbs, prose, SEO-first)
│   ├── about/
│   ├── contact/
│   ├── cookie-policy/
│   ├── courses/
│   ├── dive-log/
│   ├── dive-sites/
│   ├── diving/
│   ├── partners/
│   ├── plan-your-trip/
│   ├── privacy/
│   └── terms/
components:
├── ui/                            # shadcn/ui components
├── header.tsx                     # Sticky header
├── footer.tsx                     # Site footer
├── footer-wrapper.tsx             # Footer wrapper
├── hero.tsx                       # Homepage hero
├── breadcrumbs.tsx                # Breadcrumb navigation
├── booking-cta.tsx                # Reusable booking call-to-action
├── booking-widget.tsx             # Checkfront embedded widget
├── dive-log-client.tsx            # Interactive dive log UI
├── find-sea-saba.tsx              # Map / location component
└── structured-data.tsx            # JSON-LD LocalBusiness structured data
lib/
├── metadata.ts                    # SEO metadata helpers
├── constants.ts                   # Site-wide constants (URLs, nav items)
├── analytics.ts                   # Shared event tracking (GTM data layer + Vercel Analytics)
├── firebase.ts                    # Firebase client SDK setup
├── firestore/
│   └── dive-log.ts                # Firestore dive log fetching and normalization
├── dive-log-export.ts             # Premium PDF export for selected dives
└── ...
public/
└── images/                        # Site images; optimized assets live in images/optimized/
```

Tests live under `tests/` (unit, integration, e2e, production smoke) — see `docs/TESTING.md`.

---

## Status

The site is launched: all core pages, Checkfront booking integration, the
Firestore dive log, the legacy Wix redirect map, SEO metadata, analytics and
consent plumbing are live, with a full test/CI gate and post-deployment
production smoke suite (`docs/TESTING.md`). For the migration record see
`docs/historical/MIGRATION_REPORT.md`.

## Production Deployment

The site is deployed on **Vercel** from the `master` branch.

### Required Environment Variables

Set these in the Vercel project (Production + Preview). For local development
copy `.env.example` to `.env.local` — every value there may stay a
placeholder.

**Critical:** the browser-side Firebase SDK requires the public variables to use the `NEXT_PUBLIC_` prefix:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_COOKIEBOT_CBID
```

The canonical site URL is **not** an environment variable — it is the
`SITE_URL` constant in `lib/constants.ts` (used by metadata, sitemap, robots
and structured data). If the domain ever changes, update that constant.

### External settings not in source control

These operational settings live outside the repository and must already exist
(or be configured by an admin) — they cannot be inferred from the code:

- **Vercel project** linked to this repo, deploying `master` to
  `https://www.seasaba.com` (production domain alias + TLS managed there),
  with the env vars above configured and a Node version compatible with 24.
- **GitHub repository settings:** branch ruleset/protection on `master`
  requiring the `Critical website tests` check (see `docs/TESTING.md`), and
  CodeQL default setup for code scanning (see `SECURITY.md`).
- **Firebase console:** the production Firebase project and its public-read
  Firestore rules for `dives`/`sites`/`species`/`boats` (rules are not
  versioned here).
- **GTM container** (`GTM-5PFMJFN`) and **Cookiebot account/domain group** —
  all tag and consent configuration lives in those dashboards; see
  `docs/COOKIEBOT_CONSENT_SETUP.md`.
- **Checkfront account** (`seasaba.checkfront.com`) — booking inventory,
  checkout and its own GTM integration are vendor-managed.

### Firestore Security Rules

Public read access is required for the collections used by the live site:

```
match /dives/{docId} { allow read: if true; }
match /boats/{docId} { allow read: if true; }
match /sites/{docId} { allow read: if true; }
match /species/{docId} { allow read: if true; }
```

These rules are managed in the Firebase Console — they are not versioned in
this repository.

### Deployment Steps

1. Ensure environment variables are set in Vercel (Production + Preview)
2. Merge changes to `master`
3. Vercel builds and deploys automatically
4. Verify `/dive-log` loads dives and `/sitemap.xml` is valid

### Post-Launch Monitoring

- Check Vercel Analytics for Core Web Vitals
- Monitor Search Console for crawl errors and 301 redirect coverage
- Keep 301 redirects in `data/redirects.ts` populated from the old Wix site
- Verify GA4 / GTM events fire in Google Tag Assistant or browser DevTools Network tab

---

## Analytics & Conversion Tracking

- **Vercel Analytics:** enabled independently through `@vercel/analytics/next`.
- **Google Tag Manager:** loaded via `AnalyticsLoader` only when `NEXT_PUBLIC_GTM_ID` is set; GA4 and marketing tags live inside GTM, not in the app.
- **Consent:** Cookiebot CMP is deployed through GTM; see `docs/COOKIEBOT_CONSENT_SETUP.md`.

Business events go through the `trackEvent`/`trackLinkClick`/`trackBookingClick`
helpers in `lib/analytics.ts` (booking clicks, contact handoffs, directions,
social/partner links, PDF export). The canonical event list, parameter
contract, and indexing rules are documented in
[docs/ANALYTICS_SEO.md](docs/ANALYTICS_SEO.md).

---

## Design Principles

- **Clarity over flash** — text-first, SEO-focused content pages
- **Trust over hype** — calm, professional, conservation-minded tone
- **Speed over spectacle** — static generation, minimal JS, optimized assets
- **Motion is minimal** — only on homepage, degrades gracefully on mobile
- **Destination over catalog** — sell Saba and the Sea Saba experience first
- **Understated sophistication** — premium without being flashy

---

## Booking Rules

- Checkfront is the system of record
- Use:
  - Deep links
  - Embedded widgets
  - Optional availability previews
- Do **not** move checkout logic into the website
- The website must still convert even if widgets fail

---

## Content Rules

### TSX pages are used for:
- Core marketing pages
- Diving overview pages
- Dive site pages
- Trip planning content
- FAQs and informational content

### Firestore is preferred for:
- Testimonials
- Reviews
- Staff profiles
- Dynamic operational / timely data

---

## Visual Rules

- Homepage hero uses a **static full-bleed image**
- No full-image color filter overlay by default
- Text readability should come from:
  - image selection
  - typography
  - subtle local gradient behind text only
  - light text-shadow
- Inner pages should remain calm, stable, and text-first

---

## Design North Star

The site should feel like:

**Premium expedition diving on a special island.**

And the brand message should feel like:

**Experienced. Deliberate. Professional.**
