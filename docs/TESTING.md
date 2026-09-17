# Website regression testing

## Scope and audit — 8 September 2026

Target: **seasaba.com**, repository `spizeck/seasaba-web`, audited from `359e884` on `master`. This is the public website, not the business application at seasaba.app. No yacht feature or redesign is included.

| Area | Verified implementation / baseline |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript, Tailwind 4, npm lockfile; Vercel-oriented deployment |
| Scripts | Previously only dev, build, start, lint; no automated unit/integration/browser runner |
| CI | Dependabot configuration existed; no test workflow |
| Authentication | No login/logout, session store, protected routes, middleware, roles or permission checks implemented in this website |
| Server surface | `/book` and `/contact` use async search parameters/metadata; no API route handlers or server actions |
| Data | Browser Firebase SDK reads `dives`, `sites`, `species`, `boats` anonymously; joins, normalizes and groups results for public display |
| Booking | Checkfront owns availability, checkout, payments and confirmation. Website maps experience query parameters to inventory and supplies a direct fallback link |
| Contact | `POST /api/contact` validates server-side and delivers the inquiry by email via Resend (`website@mail.seasaba.com` → `info@seasaba.com`, Reply-To = visitor); WhatsApp remains a handoff alternative. Submissions are not stored |
| Dive log | Recent-date filtering, site/boat/guide/species filters, pagination, unit conversion, in-memory selections, PDF downloads |
| SEO | Canonicals, query-page noindex, sitemap, robots and legacy Wix 301 redirects |
| Existing diagnostic | `scripts/test-public-firestore-read.mjs` reads a configured Firebase project; it is not a deterministic test suite and is deliberately excluded from CI |

The implementation, rather than older planning documents, defines the test scope. In particular, Firestore rules are **not versioned in this repository**, and older reviews setup documentation does not describe an active reviews data module.

## Test pyramid

Prefer focused unit cases for business rules, component/data integration cases for user behavior, and a smaller set of browser flows for the deployed framework. Avoid snapshots of markup and styling.

| Layer | Tool / location | Protection |
| --- | --- | --- |
| Unit | Vitest, `tests/unit` | Measurement/date conversion; reference normalization and legacy guide formats; grouping identities, maximum sighting counts and input immutability; analytics URL sanitization/domain classification; metadata, sitemap and redirect contracts; contact submission validation, email construction and the `/api/contact` route (Resend mocked) |
| Integration | Vitest + React Testing Library, `tests/integration` | Real component interactions; required fields, invalid-email recovery, course prefill, contact submission success/failure/retry and idempotency keys, WhatsApp handoff; Checkfront inventory mapping/success/script error/timeout/render failure; Firestore join, empty data, permission-denied and service failures; dive filters, ordering, pagination, selection and export; real jsPDF generation with download boundary replaced |
| Browser | Playwright, `tests/e2e` | Production build, anonymous access to 13 pages, headings/title/description/canonical, 404, security headers, sitemap/robots (including `/diving/first-dive` exclusion), every legacy redirect and destination anchor (including the `/diving/first-dive` permanent redirect), booking success/fallback, no-JavaScript booking fallback, course inquiry validation and WhatsApp handoff, mobile menu navigation |
| Post-deploy smoke | Playwright, `tests/production` | The deployed `https://www.seasaba.com` after a production deployment: critical-route availability and page identity, key navigation paths, booking/contact boundaries, security headers, canonical host redirects, first-party error monitoring. Read-only; see "Production smoke testing" below |
| Performance budgets | Lighthouse, `scripts/perf-baseline.mjs` + `perf/budgets.json` | Lab budgets on the local test build: LCP/CLS/FCP/TBT/TTFB, JS/image/total bytes per route. Vendors blocked so the gate measures only what we ship. See "Performance measurement and budgets" below |

The browser scenarios run in desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. These are emulations, not physical-device certification. The desktop profile intentionally skips the mobile-only menu case. Retries are disabled so failures remain visible.

## Local commands

Use **Node 24 LTS** and npm. From the repository root:

```sh
npm ci
npx playwright install chromium webkit
npm run check
npm test
npm run test:watch
npm run test:unit
npm run test:integration
npm run test:coverage
npm run lint
npm run typecheck
npm run build:test
npm run test:e2e
npm run test:smoke
npm run test:perf
```

`test:e2e` and `test:smoke` start and stop the production server on port 3100; run `build:test` first, and rebuild after application changes. `test:perf` starts its own server on port 3101 and needs `build:test` first too. They refuse to reuse another running server. `npm run test:ci` runs the repo-hygiene checks, lint, type checks, coverage, the test build and all browser projects in order. Install browsers locally with `npx playwright install chromium webkit` beforehand (on Linux add `--with-deps` or install the OS libraries separately; on Windows/macOS the download alone is sufficient). CI uses the official Playwright Docker container, which has browsers and system dependencies pre-installed. `test:perf` additionally needs a Chrome/Chromium binary — a system Chrome, `CHROME_PATH`, or the Playwright Chromium install are discovered automatically.

`build:test` writes a normal `.next` build with an explicit **demo Firebase project** and empty analytics IDs. Do not deploy that test build. Use the normal deployment build with the deployment environment for releases. No production credentials or service accounts are needed for automated tests. The existing Google font build requires network access.

## Fixtures and external boundaries

- `tests/fixtures/dives.ts` creates fresh fictional data, including multiple guide reports and unresolved IDs. Date-dependent component tests freeze the clock.
- Unit/component setup replaces Firebase app initialization and external analytics. Data integration tests mock only Firestore collection reads; the join/normalization code stays real.
- Dive-log component tests replace the data fetch and PDF boundary, exercising real filtering, grouping, rendering and selection. Separate PDF tests use the real jsPDF engine, verify output content/page count, and suppress file download.
- Browser interception blocks all non-local network requests. The Checkfront happy-path case supplies a small script double for the vendor interface. Real Next.js routing, rendering, hydration, CSS and browser interaction still run.
- Contact tests capture generated URLs. They do not send email/WhatsApp messages. The jsdom email case emits its expected “navigation to another Document” diagnostic because jsdom cannot launch a mail client; the test checks the generated recipient, subject and body.
- Tests do not create reservations, charge cards, write Firestore data, or invoke the live Firestore diagnostic.

## Firestore diagnostic script

`node scripts/test-public-firestore-read.mjs` verifies that the deployed Firestore rules allow anonymous reads of `dives`, `sites`, `species` and `boats` on a **real** Firebase project. It is a plain Node script — it does **not** load `.env.local`, so the unprefixed `FIREBASE_*` variables (see `.env.example`) must be exported into the shell first:

```sh
# bash / zsh
set -a; . ./.env.local; set +a
node scripts/test-public-firestore-read.mjs
```

```powershell
# PowerShell — export only the unprefixed FIREBASE_* names
Get-Content .env.local | Where-Object { $_ -match '^FIREBASE_\w+=' } | ForEach-Object {
  $name, $value = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($name, $value)
}
node scripts/test-public-firestore-read.mjs
```

Run it only with real values exported: with placeholders it still exits 0 and can misleadingly print `read allowed (0 docs)` because the SDK falls back to offline mode. It is intentionally excluded from CI — it is a live-environment check, not a deterministic test.

## Accessibility regression testing

`tests/e2e/accessibility.spec.ts` runs automated axe-core scans (via `@axe-core/playwright`, full default ruleset — WCAG 2.x A/AA + best practices) plus behavioral keyboard and reduced-motion checks. It runs inside the normal `npm run test:e2e` suite — no separate command — and a new axe violation fails the `Critical website tests` CI gate.

**Pages scanned (desktop Chromium):** homepage, `/diving`, `/courses`, `/plan-your-trip`, `/contact`, `/book`, `/book?item=classic` (item-banner state), `/dive-sites`, `/about`, `/dive-log`. Representative mobile-viewport scans (`/`, `/contact`, `/book`, mobile nav open) run on mobile Chromium.

**Interactive states scanned:** mobile navigation open (after the open transition completes), contact form with validation errors displayed, dive-site dialog open, and the booking "unavailable" fallback.

**Keyboard coverage:** skip-to-content first tab stop and reading-position handoff; desktop primary-nav traversal with visible-focus assertions; mobile menu open/close/Escape plus proof that closed-menu links are unreachable (inert); dive-site dialog focus trap, Escape close, and focus restoration to the trigger; contact form completed and submitted by keyboard alone.

**Reduced motion:** the `/about` team carousel must not autoplay under `prefers-reduced-motion: reduce` emulation, and must still advance without it (fake clock, no sleeps).

**Browser strategy:** axe checks DOM and computed styles, so findings depend on viewport rather than engine — full scans on desktop Chromium, mobile-layout scans on mobile Chromium, no mobile-WebKit duplication. WebKit does differ on Tab behavior (Safari's default skips links); the mobile-menu keyboard test handles that explicitly.

**Exceptions:** no axe rules are disabled globally. If a rule is ever a false positive, scope `.exclude()`/`.withRules()` to the exact selector and document why inline — never weaken the whole scan. A new violation means a real regression or a new defect: fix the markup/styles rather than excluding it. Automated axe does not prove full WCAG conformance; manual checks still apply.

## Coverage and results

Coverage reports: `coverage/index.html`, `coverage/lcov.info`, `coverage/coverage-summary.json`. Browser reports: `playwright-report/index.html`; failures retain screenshots and traces under `test-results/`.

The coverage denominator explicitly includes seven critical implementation modules: analytics, metadata, Firestore dive logic, PDF export, contact form, booking widget and dive-log client. It is **not whole-website coverage**. Marketing copy, styling and static page markup are primarily protected by browser smoke tests. Global minimums: 85% statements/lines, 80% functions, 75% branches. Raise these deliberately as coverage grows; do not lower them to hide a failure.

Validation on Windows/Node 24: 72 unit/integration tests passed; selected-module coverage was 95.42% lines, 93.73% statements, 91.23% functions and 84.50% branches. Production build, TypeScript and ESLint passed. Compatible `fast-uri` and `qs` transitive patches removed the two install-time audit findings (zero reported vulnerabilities after update).

The complete `npm run test:ci` command passed locally: 62 browser checks passed across the three profiles, with one intentional desktop skip for the mobile-only menu scenario. GitHub-hosted Linux execution remains to be confirmed when the workflow runs there.

## Repository hygiene checks

`npm run check` runs three fast, offline, deterministic guards against documentation and repo-structure drift. They run first in the `Critical website tests` CI job and inside `npm run test:ci`, and take under a second.

| Command | Script | Enforces |
| --- | --- | --- |
| `npm run check:docs` | `scripts/check-doc-links.mjs` | Relative links in tracked Markdown resolve; README still links the canonical docs (`CANONICAL_README_LINKS`); backticked repo paths in docs resolve. |
| `npm run check:env` | `scripts/check-env-vars.mjs` | Every `process.env.*` read in code is documented in `.env.example`, and every name in `.env.example` is still referenced — catches dead variables; also rejects real-looking secrets in `.env.example`. |
| `npm run check:hygiene` | `scripts/check-repo-hygiene.mjs` | No generated/local artifacts are tracked (`git ls-files` denylist); `.gitignore` still covers them (`git check-ignore` probes); required files/dirs exist; root `*.md` stays limited to README/AI_INSTRUCTIONS/SECURITY; removed structures (MDX/`content/`) stay gone. |

Intentional limits and exclusions:

- **Anchors are not validated** — `#fragment` parts of links are ignored; anchor validity is renderer-dependent.
- **External links are never fetched** — this is not an internet link checker.
- **Backticked path scope** — only inline-code tokens starting with `app/`, `components/`, `lib/`, `scripts/`, `tests/`, `docs/`, `data/`, `perf/`, `public/` or `.github/` are resolved (repo-root-relative; a leading `./` resolves against the containing file). `docs/historical/` is exempt because it deliberately documents files that no longer exist. Generated-output paths (`coverage/`, `playwright-report/`, …) and site routes (`/diving/…`) are out of scope by design.
- **Env allowlists** — `TOOLING_ALLOWLIST` in `check-env-vars.mjs` covers platform/tooling vars read from the environment but never documented (`CI`, `CHROME_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `SMOKE_BASE_URL`, `NEXT_TELEMETRY_DISABLED`, `NODE_ENV`). `EXAMPLE_ALLOWLIST` exempts a documented-but-unreferenced name — currently empty; add one only with a justification comment.
- **Env scan scope** — only code under `app/`, `components/`, `lib/`, `tests/`, `scripts/`, `perf/`, `data/`, `public/` plus root `*.config.*`/`middleware` files is scanned (`SCAN_DIR_RE`/`ROOT_CONFIG_RE`); a new source root must be added there. `scripts/check-*.mjs` is excluded — those meta-checks document env semantics (they literally contain `process.env.NAME` in comments), so scanning them makes the checker flag its own documentation.
- **Tracked-files basis** — checks run against `git ls-files`, i.e. the committed tree; untracked scratch files are ignored.
- **Deliberate additions** — a new canonical doc, a new root Markdown file, or a new diagnostic env var will fail until the matching allowlist/required list in the scripts is updated; the failure message names the list to edit.

Failures name the file/reference and the fix. These checks complement — not replace — human judgment on prose quality; they only assert structure that has already regressed once.

## CI and merge gate

`.github/workflows/tests.yml` runs on every PR, pushes to `master`, and manual dispatch. The job runs inside the official Playwright Docker container (`mcr.microsoft.com/playwright:v1.63.0-noble`), which ships with Chromium, WebKit, and all system dependencies pre-installed. This eliminates the slow `npx playwright install --with-deps` step that previously downloaded browsers and ran `apt-get` on every run. The container image tag must match the Playwright version in `package-lock.json`; bump both together. The workflow uses read-only repository permissions, Node 24, reproducible `npm ci`, coverage thresholds, production build and all browser projects. A failure stops the job; there are no optional critical-test steps. Reports are uploaded even after failure and retained for 14 days.

**Required GitHub setting:** add the status check **`Critical website tests`** to the ruleset/branch protection for `master`, require PRs and require branches to be up to date. Retain existing repository protections. A workflow file alone cannot enforce merge blocking; this setting must be enabled in GitHub after the check first runs. No branch-protection change is claimed by this patch.

## Production smoke testing (post-deployment)

`tests/production/` (config `playwright.production.config.ts`, command `npm run test:smoke:prod`) verifies the **deployed** website — "did the site we actually shipped remain usable for customers?" It complements the hermetic pre-merge suite rather than duplicating it: intentionally small, fast (~15s), read-only and Chromium-only. The two suites are strictly separated — the local suite's `baseURL` is hardcoded to `127.0.0.1:3100` and refuses to reuse a running server, and the production suite contains only read-only tests, so neither can be misused against the other environment.

### What it verifies

- **Critical routes** `/`, `/diving`, `/courses`, `/plan-your-trip`, `/contact`, `/book`, `/dive-sites`: HTTP 200, exactly one visible `main h1` carrying the expected page-identity text, title, meta description, canonical URL, visible primary navigation, and no Next.js/server error surface. The h1 strings are deliberate deployment invariants (they prove the right page deployed), not copy policing.
- **Critical navigation:** home → Diving via primary nav, header Book Now → `/book`, courses → try-scuba contact inquiry. Internal links only; no external handoff is followed.
- **Booking boundary:** `/book` renders and exposes the guaranteed fallback link to `https://seasaba.checkfront.com/reserve/`. The vendor widget script is blocked (see Analytics below), so this is deterministic and emits no Checkfront tracking. Checkfront availability itself is vendor-owned and out of scope — the invariant that protects customers is that the booking page always offers a working direct path.
- **Contact boundary:** the form renders and every control is usable; submitting the empty form exercises client-side validation while a `window.open` stub in the test browser proves nothing was opened or sent.
- **Deployment metadata:** required security headers, `robots.txt`, `sitemap.xml`, apex→www and http→https canonical redirects, a representative legacy Wix 301, and a genuine 404.
- **First-party health:** every page run fails on any uncaught exception, console error, or failed/≥400 first-party request. Exemptions are limited to the tracker hosts this fixture blocks itself (`ERR_BLOCKED_BY_CLIENT`) and the `/_vercel/` analytics endpoint it aborts. Unlike the local suite, real Firestore reads are allowed — a Firestore failure in production is signal, not noise.

### What it deliberately does not do

- Never creates a booking, sends a contact inquiry, opens a WhatsApp/email handoff, writes to Firestore, or mutates any production service.
- Never asserts on third-party availability beyond Firestore content reads (and Checkfront is blocked entirely, not consulted).
- No browser/device matrix — that coverage belongs to the local suite.
- Does not follow external links or measure performance/marketing copy.

### Triggers

`.github/workflows/production-smoke.yml` runs on:

- **`deployment_status`** where `state == success` and `deployment.environment == "Production"` — Vercel's Git integration creates a GitHub Deployment per build and posts this event after a production deployment is ready, making this true post-deployment verification. Preview deployments and non-success statuses are ignored.
- **`workflow_dispatch`** with an optional `base_url` input for on-demand verification.
- **Daily cron** (`15 12 * * *`) as a safety net for host-level, TLS, DNS or content regressions unrelated to deployments.

The target is `https://www.seasaba.com` — the canonical customer host — not the immutable `*.vercel.app` deployment URL, so each run also validates domain aliasing and TLS. Note the check verifies "what is live now"; a pathological propagation race could in theory test the previous deployment, which the daily schedule and any subsequent deployment's run would still catch.

### Manual/local execution

```sh
npm run test:smoke:prod                                              # against https://www.seasaba.com
SMOKE_BASE_URL=https://example.com npm run test:smoke:prod           # POSIX shells
$env:SMOKE_BASE_URL="https://example.com"; npm run test:smoke:prod   # PowerShell
```

The config refuses plain-HTTP targets except `localhost`/`127.0.0.1`, which exists for failure-path validation against a locally built server (`npm run build:test` + `next start --port 3100`). Caveat for local runs: `build:test` uses a demo Firebase project, so Firestore-backed pages log real SDK console errors there — expected locally; use a normal build with real env to fully validate locally.

### Analytics and third-party policy

Smoke traffic emits **zero** analytics, consent or conversion events: the fixture aborts tag loaders and trackers (GTM — which also carries Cookiebot, GA4, Google Ads, Clarity and Meta — plus the first-party `/_vercel/` Vercel Analytics endpoints and the Checkfront widget script) before any request leaves the browser. This requires no application opt-out code and changes nothing for real visitors. Firestore reads still occur, equivalent to any anonymous page view.

### Artifacts and failure response

Reports land in `playwright-report-production/`; failure screenshots/traces in `test-results-production/`; CI uploads both for 14 days. A failure means the live site regressed (or a genuinely external dependency like Firestore is down). Response: read the run log for the named route/assertion, download artifacts, verify manually in a browser, roll back in the Vercel dashboard if the deploy is bad, then re-run via `workflow_dispatch`. There is no automatic rollback.

### Failure-path validation

Validated by running the suite with a deliberately wrong expected h1: the run failed on `critical route / renders its expected page` showing the expected vs. received heading. Assertion failures name the route and invariant; monitor failures name the URL and error.

## Performance measurement and budgets

`npm run test:perf` runs `scripts/perf-baseline.mjs`: it starts a local `next start` server on port 3101, launches Lighthouse (mobile, simulated throttling) against six representative routes — `/`, `/diving`, `/dive-sites`, `/plan-your-trip`, `/book`, `/dive-log` — takes the median of 3 runs per route, and asserts `perf/budgets.json`. Reports (JSON + HTML) land in `perf-report/<out>/`; `summary.json` holds the medians. This is a **lab** metric — reproducible, deterministic, not real-user data. Field data comes from Vercel Speed Insights / Web Analytics already loaded in production (they report field CWV in the Vercel dashboard; treat those dashboards, not Lighthouse, as ground truth for real visitors).

Key flags: `--target=https://www.seasaba.com` measures the live site with all vendors loaded (real third-party cost — this is how the Checkfront/GTM numbers below were produced); `--profile=desktop` switches to the Lighthouse desktop preset; `--runs=N` changes repetition; `--no-assert` collects without judging.

**Third-party policy for budgets:** against local targets the runner blocks analytics/tag vendors, Cookiebot, Vercel insights, Checkfront and Firestore, so the CI gate measures only first-party code we control — a vendor outage or a heavier GTM container can't flake the gate. Blocking is per-request, scoped to the local measurement only; production and user traffic are unaffected. Run with `--target=` to see the true end-to-end cost including vendors.

**Baseline (lab, mobile, simulated throttling, test build, vendors blocked — post-optimization):** LCP 2.8–3.6s, FCP ~0.95s, CLS 0, TBT 25–535ms (highly variable), TTFB <20ms; per-route JS 189–345KB, images 21–249KB, total 303–583KB. Desktop profile: scores 98–100. Same pages on **production with vendors** (lab, mobile): LCP up to 18.4s on `/book`, TBT 1.0–4.8s, JS up to ~1.9MB — the gap between these two rows is almost entirely third-party cost, dominated by the Checkfront droplet (which loads its own GTM + gtag inside the widget) on `/book` and GTM/Firestore main-thread work elsewhere.

**Budgets** (`perf/budgets.json`): `error` entries fail the run and gate the `Performance budgets` job in CI; `warn` entries print a warning without failing — treat warnings as "investigate", errors as "must fix". Errors sit ~25–60% above the observed baseline (LCP error 4.5s ≈ the CWV "poor" boundary; JS error 400KB ≈ 2× observed). TBT is warn-only — it swings 10× run-to-run under simulated throttling on shared CPUs. Route overrides exist where a dependency legitimately costs more (`/dive-log`: Firebase SDK → 400KB warn / 600KB error JS).

**CI:** the `Performance budgets` job in `tests.yml` builds the test build and runs the budget check in the Playwright container (bundled Chromium, `--no-sandbox` via the CI env). Artifacts (`perf-report/`) upload for 14 days. The production smoke suite additionally asserts a generous <3s TTFB on `/` — a catastrophic-regression tripwire, not a lab budget.

**Responding to a regression:** a budget failure means the diff added weight or latency. Read the named route/metric, open `perf-report/.../summary.json` for before/after medians, and check the offending route's `lhr.json` (LCP phase breakdown, network-request detail, third-party entity table). Fix by removing weight/latency — not by widening budgets; only raise a budget when a deliberate, documented change makes the old one wrong (e.g. a required new dependency).

**Known limitations:** lab numbers are simulated-throttling estimates — absolute ms vary across machines, relative deltas and byte counts are stable. INP cannot be measured in lab; TBT is its proxy. Field INP/LCP/CLS require real traffic (Vercel Speed Insights). `/book` and `/contact` are dynamic routes — TTFB on them varies with render work.

## Fixes found while testing

- Connected dive-log filter labels to unique select IDs, improving screen-reader labeling and user-focused test queries.
- Restored the hiking section anchor so `/hiking-on-saba` lands on the existing hiking content.
- Stabilized contact-form validation layout: error messages reserve space with `min-h-5` and `invisible` instead of being conditionally removed from the DOM, preventing the submit button from shifting when blur clears a validation error during a mouse click.

## Remaining gaps and gate before yacht development

1. Run this workflow successfully on GitHub and make `Critical website tests` required before merging further features.
2. Obtain the actual deployed Firestore rules and the intended public-data contract from the data-owning project. Add emulator tests for allowed anonymous reads, denied anonymous writes and non-public collections. Mocked permission errors prove UI behavior, **not deployed authorization**. Browser SDK reads receive full documents; omitting fields during normalization does not protect those fields at the database boundary.
3. Check a staging Checkfront account for real availability, redirects, pricing, checkout, payments and confirmation. Those are vendor-owned and not validated by script doubles. No real reservation was made by this suite.
4. Verify configured Cookiebot/GTM behavior in a consent-enabled staging deployment and test the WhatsApp app handoff on physical iOS/Android devices. External consent services and OS apps are isolated from CI. The contact form's server-side email path (`/api/contact` → Resend) needs one manual post-deploy verification: submit a real inquiry on the production site and confirm delivery to `info@seasaba.com` with the visitor address as Reply-To.
5. PDF tests validate generation, contents and pagination, but not visual layout for exceptionally long site/guide names, dense sightings, logo success, or export failure UX. Review representative exports before expanding their scope.
6. Add a seeded Firestore emulator-backed browser dive-log flow when rules are available. Current data and UI integration tests cover the flow in-process; browser smoke proves the route renders but does not prove live data availability.
7. Before implementing yachts, specify their visitor journeys and data ownership. Add acceptance scenarios for the proposed behavior while keeping these current flows green. Add authentication/session/API tests only if those capabilities are actually introduced.

Contact recovery reserves space for validation errors (`min-h-5` with `invisible`) so correcting an invalid address does not shift the submit button during a mouse click. The browser recovery tests cover both tabbed submission and direct mouse correction without Tab or artificial waits, verifying exactly one handoff fires across all three browser projects.

Future regression fixes should add a failing behavior test at the lowest useful layer first. Keep full customer journeys in Playwright and boundary/error combinations in Vitest. Do not substitute broad snapshots for behavior assertions.

Tooling approach follows the [Next.js testing guide](https://nextjs.org/docs/app/guides/testing) and [Vitest setup guide](https://nextjs.org/docs/app/guides/testing/vitest).
