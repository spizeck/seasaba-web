# Dutch Phase 1 — Human Review Checklist (#151)

All six Dutch modules are **drafts**. None are approved, none are
production-published (`PUBLISHED_ROUTES.nl` is empty), and the language
switcher, sitemap, and hreflang do not advertise them. To preview locally:
`npm run dev` → `http://localhost:3000/nl`, `/nl/diving`, etc. Production
builds 404 every `/nl/*` route until a route is approved and listed.

## What to check on every page

- [ ] Natural, fluent Dutch — not word-for-word English
- [ ] Tone matches Sea Saba: friendly, competent, practical, informal ("je")
- [ ] Certification names untranslated (SDI, TDI, Open Water, Divemaster…)
- [ ] Operational numbers unchanged: depths, times, ratios, fees, psi/bar
- [ ] Anchor links still work (section nav on /nl/diving and /nl/plan-your-trip)
- [ ] Internal links go to `/nl/...` where a Dutch page exists; English-only
      destinations are marked "(Engels)"

## Per-page focus

### `/nl` — home (`content/nl/home.tsx`)
- Hero/section copy tone
- The `ExperienceSelector`, `FindSeaSaba`, `InsuranceCTAs` widgets render
  Dutch chrome — check them in place

### `/nl/diving` — `content/nl/diving.tsx`
**Safety-critical — needs a diver reviewer:**
- [ ] "Minimaal Scuba Diver — privégids vereist" (private-guide requirement)
- [ ] "Gratis Nitrox (verplicht op duik 1)" on the Advanced trip
- [ ] Depths: ~70 ft / 21 m, ~110 ft / 33 m, ~30 m / 100 ft
- [ ] Refresher guidance ("nuldecompressiegrens", year thresholds from
      `OPERATIONS.refresher`)
- [ ] Live drop / live pickup / driftduik explanation
- [ ] Marine Park rules: no gloves → "Geen handschoenen", no collecting, no
      feeding, no anchoring
- [ ] Flying/hiking after diving: Winair altitude claims, "Beklim Mt. Scenery
      niet na het duiken" and the reasoning
- [ ] Technical diving: equipment requirements list, oxygen fills to 100%,
      booster to 3.000 psi, "eigen levensondersteunende uitrusting"
- [ ] Emergency preparedness: DAN-certified chamber claims
- [ ] Conservation fees: $ amounts come from `OPERATIONS.conservationFees`

### `/nl/plan-your-trip` — `content/nl/plan-your-trip.tsx`
- [ ] Season/month translations and whale-season months
- [ ] Water-temperature/visibility numbers (metric added in parentheses)
- [ ] Travel-disruption wording vs. the English cancellation/terms link
- [ ] HotelPills modal stays **English** (partner copy — intentional)
- [ ] "The Road That Couldn't Be Built" kept as English nickname — okay?

### `/nl/courses` — `content/nl/courses.tsx`
**Safety-critical:**
- [ ] All certification names, prerequisites, minimum ages
- [ ] Course durations/prices if stated
- [ ] "Try Scuba" naming and description

### `/nl/contact` — `content/nl/contact.tsx` + `components/contact-form.tsx`
- [ ] Form labels, placeholders, helper text, validation messages
- [ ] Inquiry-type dropdown labels (values stay English internally — correct)
- [ ] Confirmation/error copy
- [ ] Mailto/WhatsApp handoff still works; try `?interest=book-diving`,
      `?interest=tdi-technical`, `?interest=saba-lace`

### `/nl/book` — `content/nl/book.tsx`
- [ ] Supporting copy only; the Checkfront widget stays **English**
      (intentional — no Dutch Checkfront configuration exists)
- [ ] The transition sentence into the English widget reads naturally
- [ ] Multi-day discount wording

## Intentionally left in English

| Where | What | Why |
|---|---|---|
| /nl/book | Checkfront widget | Third-party; no Dutch configuration exists |
| /nl/plan-your-trip | HotelPills hotel names/descriptions | Partner-supplied copy |
| Footer | Terms, Privacy, Cookie Policy links | Legal pages stay English-only; not translated |
| All nl pages | `/visiting-yachts`, `/partners`, `/dive-sites`, `/terms` links | No Dutch versions exist; marked "(Engels)" where linked |
| /nl/diving | Multideco link | Third-party tool name |
| JSON-LD/FAQ structured data | translated questions | Mirrors visible copy — verify it should stay Dutch |

## Wording uncertainties for the reviewer

- "trimvest" chosen for BCD (standard NL scuba term) — confirm preference vs. "BCD"
- "duikstek" for dive site (informal, standard among NL divers)
- "bijzondere gemeente" for Special Municipality (official term)
- "nevelwoud" for cloud forest
- "nuldecompressiegrens" for no-decompression limit
- "privégids" for private guide
- Christmas winds left in English (established Saba term)
- "sunsetcruise" as one word — matches NL compound convention

## Approval process

Do **not** mark a module approved in this PR. After review, a follow-up PR
per approved route should: update `review` metadata (status, reviewedBy,
reviewedAt) and add the path to `PUBLISHED_ROUTES.nl`. No code change is
needed in the page wrappers — `canServeNlRoute` serves published routes
automatically.
