# Multilingual Site & International SEO Audit

> **Status: Audit and recommendation** — no localized routes are implemented.
> Audited against `master` @ `9cc8ab2` (post-#108 SEO/discoverability work).
> Decision record for whether, which, and how Sea Saba should localize.

## Recommendation in brief

**Proceed with Dutch only, as a small staged pilot — after the owner confirms
two data points.** Dutch nationals are ~48% of Saba's air visitors (CBS), but
Netherlands English proficiency is the highest in the world (EF EPI), so Dutch
localization is a conversion/welcome improvement, not an access fix. French and
Spanish should be deferred: French visitors are a steady ~4–5% and Spanish
nationality shares are in the low single digits. See the evidence table below —
the honest answer to "is multilingual worth doing now" is *probably, for Dutch
only, and only if the pilot stays small*.

## 1. Current architecture — what localization touches

| Area | Today | Locale impact |
|---|---|---|
| Routes | `app/(content)/*` pages, `app/book`, `app/page.tsx`; English copy is **inline JSX**, not key-based | Largest cost: page prose must move into per-locale content modules, or localized pages must duplicate the JSX structure. Shared layout/components stay common. |
| `app/layout.tsx` | `<html lang="en">` hardcoded; `og:locale: "en_US"` | `lang` must become dynamic per locale; `og:locale` per page. |
| `lib/metadata.ts` (`createMetadata`) | canonical + OG + Twitter + conditional `noindex` | Add `alternates.languages` (hreflang) + `x-default`; canonical stays self-referential per locale. Central helper makes this a one-place change. |
| `app/sitemap.ts` | route table, no `lastModified` (#108) | Emit each canonical route × locale with `alternates.languages`. English unprefixed stays in the table as today. |
| `app/robots.ts` | wildcard allow + sitemap | No change needed. |
| Structured data | `LocalBusiness` (`@id` `/#business`), `BreadcrumbList` from visible breadcrumbs, `Course` ItemList, `FAQPage` — all generated from data | Add `inLanguage` where emitted per locale; entity `@id` unchanged (same business). BreadcrumbList automatically follows the visible trail. |
| `lib/anchors.ts` | canonical fragment ids (`#where-to-stay`, …) used by nav, tests, redirects | **Keep English anchor ids on localized pages.** Fragments are addresses, not prose — translating them breaks existing links and doubles the test matrix for zero gain. Localized nav labels still point at the same ids. |
| `data/redirects.ts` | legacy English path redirects | Keep as-is; legacy URLs stay English. No locale-prefixed redirects needed. |
| Nav/footer | `NAV_ITEMS` + footer links in `lib/constants.ts` | Small shared-UI dictionary for labels; `Book Now` CTA links to `/book` (stays English — Checkfront is English-only). |
| Contact form | client component, WhatsApp/mailto handoff | Localize labels/validation copy; the handoff message itself can stay English (staff read English). |
| Booking | Checkfront embed (`seasaba.checkfront.com`) | Third-party, English-configured. Wrap with localized intro copy; document the widget stays English. **Owner check:** Checkfront account language options. |
| Chat | Respond.io widget | Vendor widget, English strings. Out of scope. |
| Consent | **Cookiebot** (via GTM container `GTM-5PFMJFN`), banner pinned to English | Cookiebot supports auto language detection — a dashboard setting, not code. NB: the issue mentions Klaro; the site actually uses Cookiebot. |
| Analytics | Vercel Analytics + GTM/GA4 | Locale is derivable from `page_path`; no PII. See §10. |
| `public/llms.txt` | canonical-route map | Keep pointing at canonical English pages; add a one-line "also available in Dutch" note if/when `/nl` ships. Do not duplicate per-language llms files. |
| CSP/headers | `next.config.ts` | No change — locale paths are same-origin. |

## 2. Language opportunity — evidence

**Hard evidence (CBS — Statistics Netherlands, inbound air tourism to Saba):**

- Saba receives ~5.7k air tourists/year (2023) — a small absolute market.
- Nationality shares (2022–23): **Dutch ~48%** (of which ~20 pts are
  Dutch-passport holders *resident in Aruba/Curaçao/St Maarten*, ~28 pts
  European Netherlands), **US ~26%**, Canadian ~5–6%, **French ~4–5%**,
  German ~1–2%, Colombian ~2–3%, Dominican ~2%, British ~1–3%.
- Note: visitors arriving by ferry/yacht from St Maarten are not in these
  figures — the gateway mix is more Francophone-adjacent than air arrivals
  suggest (Saint-Martin's north side is French).

**Reasonable inference:**

- Saba is a Dutch special municipality; the only practical gateway is St.
  Maarten (Winair/ferry). Dutch is the obvious second language by market share.
- Netherlands EF English Proficiency Index: #1 worldwide. A Dutch page is a
  service/conversion nicety, not an access requirement — the same argument
  weakens the *urgency* but also means Dutch visitors who prefer Dutch
  self-select and convert better.
- Caribbean-resident Dutch-passport holders (the ~20 pts above) skew
  English/Papiamento speakers — Dutch pages serve them less than European Dutch.
- French: small steady share, but Air France feeds SXM and French Antilles
  travelers exist; French speakers' English proficiency is meaningfully lower
  than Dutch speakers', so per-visitor value is higher even at lower volume.
- Spanish: Puerto Rico is ~300 km away and Latin American residents of the
  islands exist, but Spanish-nationality/LatAm tourist share to Saba is minimal
  in CBS data.

**Unknown — owner must check before implementation:**

- GA4: sessions by browser language and by country (esp. NL, FR/BE, ES/LatAm).
- GSC: impressions/queries in Dutch/French/Spanish (e.g. "duiken Saba").
- Booking records: nationality/language mix of actual guests (air-arrival
  nationality is a proxy, not a customer list).
- Checkfront: does the account support a Dutch booking flow?
- Crew review capacity: the About page already lists crew speaking Dutch,
  French, and Spanish — in-house review exists for all three, but who owns
  ongoing review?

## 3. Language priority

| Language | Market evidence | Search/SEO value | Review capacity | Verdict |
|---|---|---|---|---|
| **Dutch** | ~48% of air arrivals (incl. ~20 pts Caribbean-resident Dutch) | Real NL search demand for "duiken Saba" likely; Saba is NL territory | Crew listed as Dutch-speaking | **Phase 1** — pilot, small page set |
| **French** | ~4–5% steady; French Antilles adjacency via SXM | Modest; FR speakers benefit more per capita (lower EN proficiency) | One crew member lists French | **Phase 2** — revisit after Dutch pilot data |
| **Spanish** | Low single digits (Colombian ~2–3%, Dominican ~2%) | Low | One crew member lists Spanish | **Defer** — no evidence of demand |

Do not build all three at once. Each language multiplies the freshness burden
in §9 forever.

## 4. Phase 1 page set (Dutch)

| Page | Phase | Rationale |
|---|---|---|
| `/` (home) | 1 | First impression; sets language-switcher visibility |
| `/diving` | 1 | Core product, certification requirements |
| `/plan-your-trip` | 1 | Travel planning is where NL guests gain most; includes FAQ |
| `/contact` | 1 | Conversion path; form labels localized |
| `/courses` | 1 | SDI/TDI course catalog — decision content |
| `/book` | 1 | Localized intro/copy only; Checkfront widget stays English |
| `/dive-sites` | 2 | Large detailed content; names stay English anyway |
| `/visiting-yachts` | 2 | Niche, English-dominant audience (international yachties) |
| `/about`, `/partners`, `/dive-log` | English initially | Low conversion value / dynamic data |
| `/terms`, `/privacy`, `/cookie-policy` | English + disclaimer banner | Legal/contractual: English version must remain authoritative; a translated summary needs legal review — not worth Phase 1 risk |

Phase 1 = ~6 routes. That is deliberately the smallest set that answers
"what is Sea Saba, can I dive, how do I get there, how do I book."

## 5. URL and routing architecture

**Recommended: move all routes under `app/[locale]/`; middleware rewrites
unprefixed URLs to `/en/*` internally, so English keeps every existing
public URL while `/nl/*` (later `/fr`, `/es`) get prefixes.**

Why this shape: in App Router only the *root* layout renders `<html>`.
Keeping English at `app/(content)` and adding a sibling `app/[locale]`
subtree would leave no static way to set `<html lang>` on localized pages
(the root layout can't see `[locale]` params; reading a middleware header
via `headers()` would force dynamic rendering site-wide). The documented
pattern is:

- All pages live under `app/[locale]/` — `app/[locale]/layout.tsx` becomes
  the root layout and renders `<html lang={locale}>` correctly, statically.
- `generateStaticParams` returns `["en", "nl"]` (later `fr`, `es`) —
  constrained, so unknown prefixes still 404.
- `middleware.ts` **rewrites** (not redirects) `/`, `/diving`, … →
  `/en`, `/en/diving`, … External URLs are unchanged: English stays
  unprefixed and canonical; Dutch URLs are `/nl/...`.
- next.config `redirects()` run before middleware and stay English-only —
  no change to `data/redirects.ts`.
- Localized pages reuse the same components and data; page prose comes
  from `content/<locale>/<page>.tsx` modules that export a React tree —
  not giant string-key JSON (see §7).
- **No forced browser-language redirects.** Optional: a one-time dismissible
  suggestion ("Deze pagina is ook in het Nederlands beschikbaar") — never an
  automatic redirect. Crawlers and users must be able to stay on a chosen
  locale.
- Language switcher: header/footer control listing language names in their
  own language ("Nederlands", "Français", "Español") — no flag-only icons.
  Persist choice in a `NEXT_LOCALE`-style cookie; switcher links to the
  *same* path under the other locale.
- Anchors unchanged (`/nl/plan-your-trip#where-to-stay`). Query params
  (`/book?item=…`) preserved across locales; `/nl/book?item=…` inherits the
  existing `noindex`-on-params rule.

## 6. International SEO

- `createMetadata` gains a `locale`/`languages` option:
  `alternates.canonical` = self URL, `alternates.languages` = all locales +
  `x-default` pointing at the English unprefixed URL.
- `og:locale` per page (`nl_NL`, `fr_FR`, `es_ES`); keep `en_US` on English.
- `sitemap.ts`: extend the route table with `alternates.languages` per entry
  for localized routes only — don't emit alternates for English-only pages.
- `html lang` correct per locale (see §5).
- JSON-LD: add `inLanguage` on `BreadcrumbList`/`FAQPage`/`Course` blocks on
  localized pages; the business entity keeps one `@id` — do not create
  per-locale duplicate entities.
- Localized titles/descriptions are **written, not machine-translated** —
  this is the SERP-facing copy.
- `/llms.txt`: stays one file pointing at canonical (English) URLs; add a
  single line noting the Dutch version exists once `/nl` ships. Do not
  create `llms.nl.txt` — no ecosystem support.
- Post-launch: verify each locale in GSC, monitor hreflang coverage report.

## 7. Translation storage

Copy today is inline JSX, not message keys — so a classic
`messages/nl.json` i18n library covers only the shared UI shell (nav,
footer, form labels ~50 strings). For page prose:

- **Per-locale content modules**: `content/nl/plan-your-trip.tsx` exports
  the same section components as the English page but with Dutch copy.
  Pages stay typed React, diff-friendly, reviewable in a PR — and cannot
  drift structurally because they compose the same primitives.
- **Shared UI dictionary**: `content/nl/ui.ts` — typed `satisfies
  typeof enUi` so missing keys fail typecheck.
- **Data files** (`operations.ts`, `partners.ts`): product names,
  dive-site names, prices stay English/proper nouns; only description
  fields get optional `nl` siblings if needed — prefer per-locale modules
  over polluting source data.
- No runtime i18n library needed for Phase 1 — static per-locale pages are
  simpler and fully SSG. Re-evaluate if/when a third language lands.
- **No client-side auto-translate widget** as the primary solution.

## 8. Translation quality standard

| Content class | Standard |
|---|---|
| Marketing copy (home, about, intros) | Machine/AI draft + native review |
| Operational guidance (getting here, packing, yacht clearance) | Native review mandatory — wrong ferry/mooring instructions have real cost |
| Safety-critical (certification requirements, Marine Park rules, medical/fitness-to-dive, emergency info) | Native review mandatory; reviewer must know scuba vocabulary (Nitrox, "2-tank dive", SDI/TDI agency names are *not* translated) |
| Contractual/legal (terms, cancellation, liability) | English remains authoritative; any translation carries a "translation provided for convenience" note and legal review — keep English-only in Phase 1 |

Glossary lives at `content/<locale>/GLOSSARY.md` (agency names, "Nitrox",
"Saba Marine Park", "2-tank dive", mooring terminology) so reviewers stay
consistent.

## 9. Freshness — keeping translations honest

Lightweight, sized for this team:

- Each `content/<locale>/<page>.tsx` records `export const sourceHash =
  "<sha1 of the English source file>"` and `export const lastReviewed =
  "YYYY-MM-DD"`.
- A `scripts/check-translations.mjs` CI step (added to `npm run check`)
  hashes the English source and **warns** (non-blocking for PRs that only
  touch English? — decide: blocking is safer, warning fits team size;
  recommendation: warn in CI output + `# stale` marker in the PR diff) when
  a translation's recorded hash no longer matches.
- A translator updates the module + bumps `sourceHash`/`lastReviewed` when
  reviewing. No platform, no SaaS.
- Fallback: untranslated routes don't exist under `/nl` at all — the
  switcher omits them and links the English URL. Never serve English prose
  inside a `lang="nl"` page silently.
- Dev-only console warning when a locale module's hash is stale.

## 10. Analytics & measurement

- Locale is implicit in `page_path` (`/nl/…`) — no new PII, consent model
  unchanged (Cookiebot governs GTM as today; enable Cookiebot's
  language-detection in the dashboard).
- Measure: sessions & landing pages under `/nl`, `contact_form_submit` /
  `whatsapp_click` / `email_click` and `checkfront_click` events split by
  `/nl` vs English paths, GSC impressions/clicks for Dutch queries.
- Success bar for "keep Dutch": measurable share of NL-geo sessions using
  `/nl` and a non-trivial conversion share — reviewed ~6 months after launch.
  If `/nl` sees no traction, remove it rather than let it rot.

## 11. Accessibility & UX requirements

- `lang` correct on every localized document; if a localized page embeds an
  English-only third-party widget, wrap it and mark the widget region
  `lang="en"`.
- Switcher is a real link list (crawlable, keyboard-accessible), labeled in
  the *target* language, with an accessible name ("Choose language / Kies
  taal") — never flag icons alone.
- Choice persists via cookie; never re-prompt after dismissal.
- Mixed-language UI (English-only footer links on a Dutch page) must be
  deliberate and marked, not accidental.

## 12. Complexity & major risks

**Overall: medium.** Routing + metadata plumbing is a day-or-two sized
foundation; the real cost is translation production and *permanent*
freshness overhead per language.

- Stale translations are the dominant long-term risk (mitigation: §9).
- Checkfront/Respond.io remain English — the booking moment is
  partially untranslated regardless.
- Legal pages must stay English-authoritative (Netherlands legal context
  makes Dutch translation tempting, but a mistranslated liability clause is
  worse than none).
- Anchor/redirect/deep-link surface: minimized by keeping English ids and
  not translating URLs' path segments — `/nl/plan-your-trip`, not
  `/nl/plan-je-reis` (translated slugs double the redirect/test matrix and
  complicate switcher mapping for no measurable benefit).
- Route explosion: constrained `[locale]` + phased pages keeps it bounded.

## 13. Follow-up issues

Created from this audit (independently reviewable, in dependency order):

1. **Localization foundation** — `[locale]` subtree, locale config,
   `lang`/`hreflang`/canonical plumbing, language switcher, `x-default`.
2. **Dutch Phase 1 pages** — the §4 page set + shared UI dictionary +
   glossary.
3. **Translation freshness check** — `sourceHash`/`lastReviewed` +
   `check-translations.mjs` wired into `npm run check`.
4. **i18n SEO pass** — sitemap alternates, JSON-LD `inLanguage`,
   localized OG/metadata, GSC verification notes. (Can fold into #1 if the
   implementer prefers; split because it's separately reviewable.)

Deferred without issues: French (revisit with `/nl` data), Spanish.

## 14. Owner decisions needed before implementation

1. Confirm demand: GA4 language/geo report + GSC Dutch queries (§2
   "unknowns").
2. Confirm a named Dutch reviewer and ongoing review bandwidth.
3. Checkfront account language support; whether a Dutch booking flow is
   configurable.
4. Cookiebot: enable auto language detection (dashboard).
5. Approve keeping legal pages English-only with a convenience note.

## Sources

- CBS inbound tourism by nationality: https://www.cbs.nl/en-gb/figures/detail/83191ENG
- CBS Caribbean Netherlands in Numbers 2024: https://longreads.cbs.nl/the-caribbean-netherlands-in-numbers-2024/how-many-tourists-arrived-by-air/
- Statista Saba arrivals by nationality 2022 (CBS-derived): https://www.statista.com/statistics/977226/inbound-tourism-by-air-to-saba-by-nationality/
- Next.js App Router i18n routing guide: https://nextjs.org/docs/app/guides/internationalization
- Google hreflang guidance: https://developers.google.com/search/docs/specialty/international/localized-versions
- Cookiebot banner languages: https://support.cookiebot.com/hc/en-us/articles/360003784394
