# Website regression testing

## Scope and audit — 8 September 2026

Target: **seasaba.com**, repository `spizeck/seasaba-web`, audited from `359e884` on `master`. This is the public website, not the business application at seasaba.app. No yacht feature or redesign is included.

| Area | Verified implementation / baseline |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript, Tailwind 4, MDX support, npm lockfile; Vercel-oriented deployment |
| Scripts | Previously only dev, build, start, lint; no automated unit/integration/browser runner |
| CI | Dependabot configuration existed; no test workflow |
| Authentication | No login/logout, session store, protected routes, middleware, roles or permission checks implemented in this website |
| Server surface | `/book` and `/contact` use async search parameters/metadata; no API route handlers or server actions |
| Data | Browser Firebase SDK reads `dives`, `sites`, `species`, `boats` anonymously; joins, normalizes and groups results for public display |
| Booking | Checkfront owns availability, checkout, payments and confirmation. Website maps experience query parameters to inventory and supplies a direct fallback link |
| Contact | Client validation generates mailto or WhatsApp handoffs; the website does not send/store messages |
| Dive log | Recent-date filtering, site/boat/guide/species filters, pagination, unit conversion, in-memory selections, PDF downloads |
| SEO | Canonicals, query-page noindex, sitemap, robots and legacy Wix 301 redirects |
| Existing diagnostic | `scripts/test-public-firestore-read.mjs` reads a configured Firebase project; it is not a deterministic test suite and is deliberately excluded from CI |

The implementation, rather than older planning documents, defines the test scope. In particular, Firestore rules are **not versioned in this repository**, and older reviews setup documentation does not describe an active reviews data module.

## Test pyramid

Prefer focused unit cases for business rules, component/data integration cases for user behavior, and a smaller set of browser flows for the deployed framework. Avoid snapshots of markup and styling.

| Layer | Tool / location | Protection |
| --- | --- | --- |
| Unit | Vitest, `tests/unit` | Measurement/date conversion; reference normalization and legacy guide formats; grouping identities, maximum sighting counts and input immutability; analytics URL sanitization/domain classification; metadata, sitemap and redirect contracts |
| Integration | Vitest + React Testing Library, `tests/integration` | Real component interactions; required fields, invalid-email recovery, course prefill, encoded email/WhatsApp handoffs; Checkfront inventory mapping/success/script error/timeout/render failure; Firestore join, empty data, permission-denied and service failures; dive filters, ordering, pagination, selection and export; real jsPDF generation with download boundary replaced |
| Browser | Playwright, `tests/e2e` | Production build, anonymous access to 14 pages, headings/title/description/canonical, 404, security headers, sitemap/robots, every legacy redirect and destination anchor, booking success/fallback, no-JavaScript booking fallback, course inquiry validation and WhatsApp handoff, mobile menu navigation |

The browser scenarios run in desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. These are emulations, not physical-device certification. The desktop profile intentionally skips the mobile-only menu case. Retries are disabled so failures remain visible.

## Local commands

Use **Node 24 LTS** and npm. From the repository root:

```sh
npm ci
npx playwright install chromium webkit
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
```

`test:e2e` and `test:smoke` start and stop the production server on port 3100; run `build:test` first, and rebuild after application changes. They refuse to reuse another running server. `npm run test:ci` runs lint, type checks, coverage, the test build and all browser projects in order. Install browsers beforehand; Linux CI uses `npx playwright install --with-deps chromium webkit`.

`build:test` writes a normal `.next` build with an explicit **demo Firebase project** and empty analytics IDs. Do not deploy that test build. Use the normal deployment build with the deployment environment for releases. No production credentials or service accounts are needed for automated tests. The existing Google font build requires network access.

## Fixtures and external boundaries

- `tests/fixtures/dives.ts` creates fresh fictional data, including multiple guide reports and unresolved IDs. Date-dependent component tests freeze the clock.
- Unit/component setup replaces Firebase app initialization and external analytics. Data integration tests mock only Firestore collection reads; the join/normalization code stays real.
- Dive-log component tests replace the data fetch and PDF boundary, exercising real filtering, grouping, rendering and selection. Separate PDF tests use the real jsPDF engine, verify output content/page count, and suppress file download.
- Browser interception blocks all non-local network requests. The Checkfront happy-path case supplies a small script double for the vendor interface. Real Next.js routing, rendering, hydration, CSS and browser interaction still run.
- Contact tests capture generated URLs. They do not send email/WhatsApp messages. The jsdom email case emits its expected “navigation to another Document” diagnostic because jsdom cannot launch a mail client; the test checks the generated recipient, subject and body.
- Tests do not create reservations, charge cards, write Firestore data, or invoke the live Firestore diagnostic.

## Coverage and results

Coverage reports: `coverage/index.html`, `coverage/lcov.info`, `coverage/coverage-summary.json`. Browser reports: `playwright-report/index.html`; failures retain screenshots and traces under `test-results/`.

The coverage denominator explicitly includes seven critical implementation modules: analytics, metadata, Firestore dive logic, PDF export, contact form, booking widget and dive-log client. It is **not whole-website coverage**. Marketing copy, styling and static page markup are primarily protected by browser smoke tests. Global minimums: 85% statements/lines, 80% functions, 75% branches. Raise these deliberately as coverage grows; do not lower them to hide a failure.

Validation on Windows/Node 24: 72 unit/integration tests passed; selected-module coverage was 95.42% lines, 93.73% statements, 91.23% functions and 84.50% branches. Production build, TypeScript and ESLint passed. Compatible `fast-uri` and `qs` transitive patches removed the two install-time audit findings (zero reported vulnerabilities after update).

The complete `npm run test:ci` command passed locally: 65 browser checks passed across the three profiles, with one intentional desktop skip for the mobile-only menu scenario. GitHub-hosted Linux execution remains to be confirmed when the workflow runs there.

## CI and merge gate

`.github/workflows/tests.yml` runs on every PR, pushes to `master`, and manual dispatch. It uses read-only repository permissions, Node 24, reproducible `npm ci`, coverage thresholds, production build and all browser projects. A failure stops the job; there are no optional critical-test steps. Reports are uploaded even after failure and retained for 14 days.

**Required GitHub setting:** add the status check **`Critical website tests`** to the ruleset/branch protection for `master`, require PRs and require branches to be up to date. Retain existing repository protections. A workflow file alone cannot enforce merge blocking; this setting must be enabled in GitHub after the check first runs. No branch-protection change is claimed by this patch.

## Fixes found while testing

- Connected dive-log filter labels to unique select IDs, improving screen-reader labeling and user-focused test queries.
- Restored the hiking section anchor so `/hiking-on-saba` lands on the existing hiking content.

## Remaining gaps and gate before yacht development

1. Run this workflow successfully on GitHub and make `Critical website tests` required before merging further features.
2. Obtain the actual deployed Firestore rules and the intended public-data contract from the data-owning project. Add emulator tests for allowed anonymous reads, denied anonymous writes and non-public collections. Mocked permission errors prove UI behavior, **not deployed authorization**. Browser SDK reads receive full documents; omitting fields during normalization does not protect those fields at the database boundary.
3. Check a staging Checkfront account for real availability, redirects, pricing, checkout, payments and confirmation. Those are vendor-owned and not validated by script doubles. No real reservation was made by this suite.
4. Verify configured Cookiebot/GTM behavior in a consent-enabled staging deployment and test email/WhatsApp app handoff on physical iOS/Android devices. External consent services and OS apps are isolated from CI.
5. PDF tests validate generation, contents and pagination, but not visual layout for exceptionally long site/guide names, dense sightings, logo success, or export failure UX. Review representative exports before expanding their scope.
6. Add a seeded Firestore emulator-backed browser dive-log flow when rules are available. Current data and UI integration tests cover the flow in-process; browser smoke proves the route renders but does not prove live data availability.
7. Before implementing yachts, specify their visitor journeys and data ownership. Add acceptance scenarios for the proposed behavior while keeping these current flows green. Add authentication/session/API tests only if those capabilities are actually introduced.

Contact recovery currently clears error text on blur, which can shift the submit button during a mouse click after correcting an invalid address. The browser recovery test tabs out of the field before submitting; direct mouse correction deserves a follow-up UX regression fix.

Future regression fixes should add a failing behavior test at the lowest useful layer first. Keep full customer journeys in Playwright and boundary/error combinations in Vitest. Do not substitute broad snapshots for behavior assertions.

Tooling approach follows the [Next.js testing guide](https://nextjs.org/docs/app/guides/testing) and [Vitest setup guide](https://nextjs.org/docs/app/guides/testing/vitest).
