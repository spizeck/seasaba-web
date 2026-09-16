# Operational Facts — Source of Truth

This site communicates real operational facts (schedules, requirements,
ratios, contact details). Those facts must not drift between pages. The rule:
**centralize facts, not prose.** Typed data lives in TypeScript; each page
keeps its own wording and context.

## Where facts live

| Source | Owns |
| --- | --- |
| `data/operations.ts` | `OPERATIONS` (founding year, recreational guide ratio, nitrox blend, harbor), `DIVE_PRODUCTS` (slugs, Checkfront ids, schedules, requirements, nitrox policy, capacity), `CHECKFRONT_EXTRA_ITEMS`, `INQUIRY_TYPES` (`/contact?interest=` routing) |
| `lib/constants.ts` | `SITE_*`, `BOOKING_URL`, `CONTACT` (phone/WhatsApp/email/address), `SOCIAL_LINKS`, `OG_IMAGE`, `NAV_ITEMS` |
| `lib/anchors.ts` | Route section ids shared by pages and `data/redirects.ts` |
| `app/(content)/terms/page.tsx` | Cancellation, reschedule, refund, weather, and charter policy — the canonical legal terms |
| Checkfront | Live availability, bookable inventory, transactional pricing. The site intentionally shows no prices; `/book` links into Checkfront |

## Updating a fact

- **A product's time, requirement, or capacity:** edit its entry in
  `DIVE_PRODUCTS`. Pages and `ExperienceSelector` pick it up automatically.
- **Contact details:** edit `CONTACT` in `lib/constants.ts`. Everything —
  footer, contact page, form handoffs, privacy page, structured data —
  derives from it.
- **A new `/contact?interest=` link:** the slug must exist in
  `INQUIRY_TYPES`, or the form silently ignores it. `tests/unit/operations.test.ts`
  scans the source tree and fails on unknown slugs.
- **A new Checkfront item:** add it to `DIVE_PRODUCTS` (with a `/book?item=`
  slug) or `CHECKFRONT_EXTRA_ITEMS`, and update `ALL_ITEM_IDS` in
  `components/booking-widget.tsx`.

## Intentionally page-specific

- Marketing copy, descriptions, FAQ phrasing, and course/safety explanations.
- Per-dive depth chips on `/diving` (single location — wording varies by card).
- Try Scuba session times in `ExperienceSelector` (a course schedule, not a
  bookable boat product; its afternoon dive shares the Afternoon product's times).
- Course ratios (`2:1` Try Scuba, `3:1` Open Water, `1:1`/`2:1` typical
  classes) — context-specific, not one universal ratio.
- Terms/policy prose on `/terms`. Marketing pages link to it rather than
  duplicating policy rules.
- Biographical and historical details (e.g. an individual's certification
  year in `about-page-client.tsx`) even when the year matches the founding year.

## Business-owner approval required

Anything in `DIVE_PRODUCTS`, `OPERATIONS`, `CONTACT`, or the Terms page is a
real business claim. Changing a schedule, requirement, ratio, fee, or policy
wording needs owner sign-off — the code change is one line, the decision is not.

### Owner-confirmed rules

- **Classic / Afternoon certification rule** — Scuba Diver-certified guests
  may book either product with no logged-dive minimum, but they are not
  autonomous Open Water-level divers: they require a private guide. This is
  deliberately **not** a `DIVE_PRODUCTS.requirement` value — a single
  requirement string would imply Scuba Diver divers can join the normal
  guided group autonomously. The diving page carries the wording
  "Scuba Diver minimum — private guide required" as page copy.
- **`OPERATIONS.maxRecreationalDiversPerGuide`** applies to recreational
  guided dives only (owner-confirmed). Course ratios on `/courses` are
  separate, course-specific facts.
- **Dive computers are required** for diving with Sea Saba; rental computers
  are available (owner-confirmed — `/plan-your-trip` wording reflects this).
- **Taxi pickup times** — `DIVE_PRODUCTS.*.schedule.taxiPickup` is the time
  pickups BEGIN, not a guaranteed per-guest pickup time. Guests must be
  ready by that time; actual taxi arrival varies with the route and pickup
  order. UI must never present these as exact arrival times (the
  `ExperienceSelector` timeline labels them "Be ready for taxi pickup").

## Checkfront boundary

The website owns explanatory copy: eligibility, schedules, inclusions,
descriptions. Checkfront owns live availability, actual bookable inventory,
and prices at checkout. Do not scrape or sync Checkfront; the item ids in
`data/operations.ts` are a hand-maintained lookup for deep links only.
