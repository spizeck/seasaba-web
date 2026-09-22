# Operational Facts — Source of Truth

This site communicates real operational facts (schedules, requirements,
ratios, contact details). Those facts must not drift between pages. The rule:
**centralize facts, not prose.** Typed data lives in TypeScript; each page
keeps its own wording and context.

## Where facts live

| Source | Owns |
| --- | --- |
| `data/operations.ts` | `OPERATIONS` (founding year, recreational guide ratio, nitrox blend, harbor, refresher thresholds, junior-diver private-guide guidance, conservation fees), `DIVE_PRODUCTS` and `CRUISE_PRODUCTS` (slugs, Checkfront ids, schedules, `diveSlots`, requirements, nitrox policy, capacity), `BOOKABLE_PRODUCTS` (combined `/book?item=` registry), `CHECKFRONT_EXTRA_ITEMS`, `CHECKFRONT_ALL_ITEM_IDS`, `INQUIRY_TYPES` (`/contact?interest=` routing plus per-inquiry `fields`/`partyLabel` driving the contact form's progressive contextual fields), `resolveBookingItem` (`/book?item=` validation) |
| `lib/constants.ts` | `SITE_*`, `BOOKING_URL`, `CONTACT` (phone/WhatsApp/email/address), `SOCIAL_LINKS`, `OG_IMAGE`, `NAV_ITEMS` |
| `lib/contact.ts` | Contact-form field limits and the inquiry email builders (subject, structured body, `mailto:` URI). The form opens the visitor's own email app addressed to `CONTACT.email` — server-side sending was removed because a common `From` address collapsed all visitors into one Respond.io contact. Direct Respond.io ingestion is deferred pending a plan upgrade; see issue #104. WhatsApp stays a client-side handoff |
| `lib/respond-io.ts` + `components/respond-io-widget.tsx` | Website Chat channel — the native Respond.io launcher (channel `451154`, public widget cId via `NEXT_PUBLIC_RESPOND_IO_CID`) injected after window load. Widget appearance, pre-chat fields, popup message and workflow routing are Respond.io dashboard settings, not website code. Per-visitor identity is handled inside the widget's own iframe. Launcher position: dashboard "Vertical/Horizontal Spacing" (single value for all viewports — effective offset is 25px + the setting). `app/globals.css` additionally translates the closed launcher `translate(36px, 36px)` — the ~57px visible bubble sits ~5px inside the 90x90 iframe's corner, so the vendor offset left ~53-54px of visible clearance vs Cookiebot's ~10-11px; the shift lands the bubble ~17-18px from the right/bottom edges. On the homepage the closed launcher (and greeting popup, same iframe) is hidden while the `[data-hero]` hero region is in view — `respond-io-widget.tsx` toggles `data-hero-in-view` on `<html>` via IntersectionObserver and `app/globals.css` hides `iframe[state="widgetClose"]`; an open conversation (`widgetOpen`) is never hidden, and other routes show the launcher normally |
| `lib/anchors.ts` | Route section ids shared by pages and `data/redirects.ts` |
| `app/(en)/(content)/terms/page.tsx` | Cancellation, reschedule, refund, weather, and charter policy — the canonical legal terms |
| Checkfront | Live availability, bookable inventory, transactional pricing. The site intentionally shows no prices; `/book` links into Checkfront |

## Updating a fact

- **A product's time, requirement, or capacity:** edit its entry in
  `DIVE_PRODUCTS`. Pages and `ExperienceSelector` pick it up automatically.
- **Contact details:** edit `CONTACT` in `lib/constants.ts`. Everything —
  footer, contact page, contact delivery, privacy page, structured data —
  derives from it.
- **A new `/contact?interest=` link:** the slug must exist in
  `INQUIRY_TYPES`, or the form silently ignores it. `tests/unit/operations.test.ts`
  scans the source tree and fails on unknown slugs.
- **A new Checkfront item:** add it to `DIVE_PRODUCTS` or `CRUISE_PRODUCTS`
  (with a `/book?item=` slug) or `CHECKFRONT_EXTRA_ITEMS`, and update
  `CHECKFRONT_ALL_ITEM_IDS` in `data/operations.ts`. `/book?item=` values
  that match neither are rejected by `resolveBookingItem` — the widget shows
  the full inventory with a notice rather than handing a bogus id to
  Checkfront.

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
- **Shared dive-day slots** — `DIVE_PRODUCTS.*.diveSlots` records which of
  the day's three dives each product covers: Advanced = Dives 1–2, Classic =
  Dives 2–3, Afternoon = Dive 3. Advanced and Classic therefore share Dive 2,
  and Classic and the afternoon dive share Dive 3 (owner-confirmed). The
  `/diving` mixed-experience section relies on this overlap.
- **Refresher guidance** — `OPERATIONS.refresher`: recommended after more
  than 1 year out of the water, generally required past roughly 3 years
  (owner-confirmed). The decision is always Sea Saba's — experience,
  comfort, conditions, and the planned dives factor in, and a private guide
  can be the alternative. Guidance, not an agency rule; don't present the
  thresholds as immutable.
- **Junior divers** — `OPERATIONS.juniorPrivateGuideRecommendedUnderAge`:
  Sea Saba particularly recommends a private guide for families diving with
  children under 12 (owner-confirmed). It is a recommendation, not a
  universal requirement — junior divers dive within the depth, supervision,
  and other limits of their certification. There is deliberately no
  Sea Saba-wide minimum age or depth rule.
- **Conservation fees** — `OPERATIONS.conservationFees` (owner-confirmed
  amounts): $3/diver/dive Saba Marine Park fee + $1/diver/dive hyperbaric
  chamber contribution, presented to divers as a combined $4 per dive;
  snorkeling is $3 per person. These are externally set charges — update the
  values here if the park or chamber fund changes them rather than editing
  page copy. Do not describe the whole $4 as a Marine Park fee.

## Checkfront boundary

The website owns explanatory copy: eligibility, schedules, inclusions,
descriptions. Checkfront owns live availability, actual bookable inventory,
and prices at checkout. Do not scrape or sync Checkfront; the item ids in
`data/operations.ts` are a hand-maintained lookup for deep links only.

Owner-confirmed non-dive inventory (in `CRUISE_PRODUCTS`):

| Product | Slug | Checkfront item |
| --- | --- | --- |
| Shared Sunset Cruise | `sunset-cruise` | `247` |
| Private Sunset Cruise | `private-sunset-cruise` | `328` |
