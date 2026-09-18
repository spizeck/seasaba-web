# Analytics & SEO Reference

> **Status: Canonical reference** for the analytics/consent architecture and
> SEO mechanics — validated against the codebase on 2026-09-14. The
> "Dependency Audit Cleanup" and "SEO Issues Found & Fixes" sections are a
> completed-work log retained for history; the "Google Ads Follow-up Items"
> are open dashboard tasks, not code work.

## Dependency Audit Cleanup (historical)

- Removed unused `firebase-admin` dependency, which eliminated 8 moderate severity `uuid` vulnerabilities (via transitive `gaxios`, `google-gax`, and `teeny-request` packages).
- Kept `firebase` client SDK because the dive-log feature uses `lib/firebase.ts` and `lib/firestore/dive-log.ts`.
- `npm audit` reported **0 vulnerabilities** at that time; the current count changes with every advisory release — see `SECURITY.md` for the ongoing process.

## Implemented Tools

- **Vercel Analytics** — `@vercel/analytics/next` in `app/layout.tsx`, operating independently.
- **Google Tag Manager** — loaded via `AnalyticsLoader` only when `NEXT_PUBLIC_GTM_ID` is set; includes the `<noscript>` iframe fallback.
- **Google Analytics 4** — configured and loaded exclusively inside GTM. The application does not load GA4 or call `window.gtag()` directly.
- **Unified event utility** — `lib/analytics.ts` pushes each business event once to the GTM data layer and separately sends it to Vercel Analytics.
- **Reusable tracking components** — `TrackedInternalButton`, `TrackedOutboundButton`, `TrackedOutboundLink`, and `TrackedContactLink` simplify future instrumentation.
- **Respond.io Website Chat** — native vendor widget loaded by `components/respond-io-widget.tsx` when `NEXT_PUBLIC_RESPOND_IO_CID` is set. Its `chat:opened` / `chat:sent` events feed the `chat_open` / `chat_conversation_started` analytics events; no names, emails, message text, or Respond.io IDs are ever sent to analytics.

"Page parameters" below means `page_location` (origin + pathname only), `page_path`, `page_title`, and `page_referrer`/`referrer` (origin + pathname only). Query strings and fragments are stripped centrally in `trackEvent` so landing or referrer URLs cannot forward visitor data (emails, names, booking references) embedded in parameters.

## Tracked Events

| Event | Where it's fired | Parameters |
|-------|------------------|------------|
| `book_now_click` | Actual Sea Saba booking CTAs | Page parameters, link parameters, `button_name`, `button_location`, `booking_item`, and legacy aliases |
| `checkfront_click` | BookingWidget fallback/direct links | Page parameters, link parameters, `button_name`, `button_location`, `booking_item`, and legacy aliases |
| `contact_click` | Internal course/partner contact CTAs, plan-your-trip inquiries, and BookingWidget recovery links | Page parameters, link parameters, `button_location`, and legacy aliases |
| `contact_form_submit` | ContactForm — WhatsApp handoff only (`method: "whatsapp"`). The email path is a `mailto:` client handoff tracked as `email_click`, not a confirmed submission | Page parameters, `method`, `inquiry_type`, `button_location` |
| `contact_form_error` | Defined but currently unwired — it fired when the (removed) server send was rejected; returns with the Respond.io integration (#104) | Page parameters, `method`, `inquiry_type`, `button_location` |
| `email_click` | Footer, contact page, privacy page `mailto:` links, and the contact form's email handoff (`button_location: "contact_form"`, `method`, `inquiry_type`) | Page parameters, link parameters, and legacy aliases |
| `phone_click` | Footer and contact page | Page parameters, link parameters, and legacy aliases |
| `whatsapp_click` | Footer and contact form/page | Page parameters, sanitized link parameters, and legacy aliases |
| `directions_click` | FindSeaSaba map card/tooltip | Page parameters, link parameters, and legacy aliases |
| `ferry_link_click` | Plan-your-trip and local partner ferry links | Page parameters, link parameters, and legacy aliases |
| `social_click` | Social, partner, accommodation, and outbound resource links | Page parameters, link parameters, `partner_name` where applicable, and legacy aliases |
| `pdf_download` | Dive-log PDF export | Page parameters, `dive_count`, `unit_system` |
| `chat_open` | Respond.io Website Chat `chat:opened` event (visitor intentionally opened the native widget) | Page parameters only — no widget or contact data |
| `chat_conversation_started` | First Respond.io `chat:sent` event per page session (first visitor message; `chat:sent` exists in the shipped widget API but is undocumented — it fires per message, so only the first is counted) | Page parameters only — no widget or contact data |

## Environment Variables

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_RESPOND_IO_CID=<public widget cId>
```

`NEXT_PUBLIC_GTM_ID` is **optional**: when unset, `AnalyticsLoader` renders
nothing and no GTM/GA4/ads/Clarity/Meta tags load — the recommended state for
local development so browsing never pollutes analytics. Set the real
container ID only in deployed environments (Vercel).

`NEXT_PUBLIC_RESPOND_IO_CID` is likewise **optional**: when unset the chat
widget loads nothing. It is a public widget identifier (visible in page
source wherever the widget is embedded), not a credential — but leaving it
empty locally keeps development free of third-party calls.

There is no `NEXT_PUBLIC_SITE_URL` — the canonical site URL is the `SITE_URL`
constant in `lib/constants.ts`, used by metadata, sitemap, robots and JSON-LD.

See `.env.example` for the full variable inventory (Firebase, Cookiebot CBID,
diagnostic-only variables) and what each one does.

## Sitemap Inclusions

`app/sitemap.ts` includes all public, indexable routes:

- `/`
- `/diving`
- `/dive-sites`
- `/plan-your-trip`
- `/courses`
- `/about`
- `/contact`
- `/partners`
- `/dive-log`
- `/book`
- `/terms`
- `/privacy`

`/cookie-policy` (added later, for the Cookiebot consent work) is indexable
but not currently listed in `app/sitemap.ts`; it is reachable via the footer
and `/privacy`. Add it to the sitemap if it should be a crawlable landing
page.

## Indexing Exclusions

- `robots.ts` allows all crawlers and references `/sitemap.xml`.
- `createMetadata()` in `lib/metadata.ts` sets `noindex` for:
  - Any page with a truthy `noIndex` option.
  - Any page with search params (`/book?item=...`, `/contact?interest=...`). The canonical URL for those pages remains the clean URL (without params).

There are no admin/private pages in the current site to exclude.

## SEO Issues Found & Fixes (historical log)

| Issue | Status | Notes |
|-------|--------|-------|
| Missing `"use client"` on `Footer` and `BookingCTA` | Fixed | Adding `onClick` handlers to these components caused RSC serialization errors; both are now client components. |
| `Button` (`ui/button.tsx`) passed `onClick` to `Slot.Root` from a server context | Fixed | Added `"use client"` to `ui/button.tsx` so interactive buttons can be used inside tracked client components. |
| `lib/analytics.ts` uses browser APIs without a client boundary | Fixed | Added `"use client"` to the analytics utility. |
| `find-sea-saba.tsx` had unused `setTooltipOpen` state | Fixed | Removed the unused state and simplified tooltip behavior to CSS hover. |
| Unused `Link`/`Button` imports on contact/courses pages | Fixed | Removed after replacing those CTAs with tracked components. |
| Parameterized pages (`/book?item=...`, `/contact?interest=...`) are noindexed | By design | Prevents duplicate canonical content from search params. If you want those deep links indexed, adjust `createMetadata()` to only noindex when `noIndex: true`. |
| `content/sample.mdx` removed | Resolved | The placeholder MDX page and MDX pipeline have been deleted; `/diving/first-dive` 301-redirects to `/diving`. |
| No newsletter signup form found | Noted | `newsletter_signup` event is defined in `AnalyticsEvent` but not wired; add it if a newsletter signup is introduced later. |

## Google Ads Follow-up Items

1. **Map the existing events to GA4 inside GTM:** preserve each custom event and map `checkfront_click` to an additional `begin_checkout` event and `contact_form_submit` to an additional `generate_lead` event. Note `contact_form_submit` currently fires for WhatsApp handoffs only; the contact-form email handoff is an `email_click` with `button_location: "contact_form"` — map that parameter variant to `generate_lead` as well if email inquiries should count as leads.
2. **Mark primary GA4 Key Events:** use `begin_checkout` and `generate_lead`; do not also import their source custom events as primary conversions.
3. **Mark secondary GA4 Key Events:** `book_now_click`, `phone_click`, `whatsapp_click`, and `email_click`.
4. **Configure Checkfront's native Google Ads integration** before launching ads; completed purchase tracking remains a separate project.
5. **Verify event counts and parameters** in GTM Preview / Tag Assistant and GA4 DebugView before launching paid campaigns.
