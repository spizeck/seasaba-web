# Analytics & SEO Implementation Report

## Dependency Audit Cleanup

- Removed unused `firebase-admin` dependency, which eliminated 8 moderate severity `uuid` vulnerabilities (via transitive `gaxios`, `google-gax`, and `teeny-request` packages).
- Kept `firebase` client SDK because the dive-log feature uses `lib/firebase.ts` and `lib/firestore/dive-log.ts`.
- `npm audit` now reports **0 vulnerabilities**.

## Implemented Tools

- **Vercel Analytics** — `@vercel/analytics/next` in `app/layout.tsx`, operating independently.
- **Google Tag Manager** — loaded via `AnalyticsLoader` only when `NEXT_PUBLIC_GTM_ID` is set; includes the `<noscript>` iframe fallback.
- **Google Analytics 4** — configured and loaded exclusively inside GTM. The application does not load GA4 or call `window.gtag()` directly.
- **Unified event utility** — `lib/analytics.ts` pushes each business event once to the GTM data layer and separately sends it to Vercel Analytics.
- **Reusable tracking components** — `TrackedInternalButton`, `TrackedOutboundButton`, `TrackedOutboundLink`, and `TrackedContactLink` simplify future instrumentation.

## Tracked Events

| Event | Where it's fired | Parameters |
|-------|------------------|------------|
| `book_now_click` | Actual Sea Saba booking CTAs | Page parameters, link parameters, `button_name`, `button_location`, `booking_item`, and legacy aliases |
| `checkfront_click` | BookingWidget fallback/direct links | Page parameters, link parameters, `button_name`, `button_location`, `booking_item`, and legacy aliases |
| `contact_click` | Internal course and partner contact CTAs | Page parameters, link parameters, `button_location`, and legacy aliases |
| `contact_form_submit` | ContactForm email/WhatsApp handlers | Page parameters, `method`, `inquiry_type`, `button_location` |
| `email_click` | Footer, contact form/page, privacy page | Page parameters, link parameters, and legacy aliases |
| `phone_click` | Footer and contact page | Page parameters, link parameters, and legacy aliases |
| `whatsapp_click` | Footer and contact form/page | Page parameters, sanitized link parameters, and legacy aliases |
| `directions_click` | FindSeaSaba map card/tooltip and LocationPin | Page parameters, link parameters, and legacy aliases |
| `ferry_link_click` | Plan-your-trip and local partner ferry links | Page parameters, link parameters, and legacy aliases |
| `social_click` | Social, partner, accommodation, and outbound resource links | Page parameters, link parameters, `partner_name` where applicable, and legacy aliases |
| `pdf_download` | Dive-log PDF export | Page parameters, `dive_count`, `unit_system` |

## Required Environment Variables

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_SITE_URL=https://www.seasaba.com
```

See `.env.example` for the full list (Firebase, site URL, etc.).

## Sitemap Inclusions

`app/sitemap.ts` includes all public, indexable routes:

- `/`
- `/diving`
- `/diving/first-dive`
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

## Indexing Exclusions

- `robots.ts` allows all crawlers and references `/sitemap.xml`.
- `createMetadata()` in `lib/metadata.ts` sets `noindex` for:
  - Any page with a truthy `noIndex` option.
  - Any page with search params (`/book?item=...`, `/contact?interest=...`). The canonical URL for those pages remains the clean URL (without params).

There are no admin/private pages in the current site to exclude.

## SEO Issues Found & Fixes

| Issue | Status | Notes |
|-------|--------|-------|
| Missing `"use client"` on `Footer` and `BookingCTA` | Fixed | Adding `onClick` handlers to these components caused RSC serialization errors; both are now client components. |
| `Button` (`ui/button.tsx`) passed `onClick` to `Slot.Root` from a server context | Fixed | Added `"use client"` to `ui/button.tsx` so interactive buttons can be used inside tracked client components. |
| `lib/analytics.ts` uses browser APIs without a client boundary | Fixed | Added `"use client"` to the analytics utility. |
| `find-sea-saba.tsx` had unused `setTooltipOpen` state | Fixed | Removed the unused state and simplified tooltip behavior to CSS hover. |
| Unused `Link`/`Button` imports on contact/courses pages | Fixed | Removed after replacing those CTAs with tracked components. |
| Parameterized pages (`/book?item=...`, `/contact?interest=...`) are noindexed | By design | Prevents duplicate canonical content from search params. If you want those deep links indexed, adjust `createMetadata()` to only noindex when `noIndex: true`. |
| `content/sample.mdx` contains an untracked Checkfront link | Noted | This is placeholder MDX; convert it to a real content page and replace the raw `<a>` with a tracked component or add the link to MDX components. |
| No newsletter signup form found | Noted | `newsletter_signup` event is defined in `AnalyticsEvent` but not wired; add it if a newsletter signup is introduced later. |

## Google Ads Follow-up Items

1. **Map the existing events to GA4 inside GTM:** preserve each custom event and map `checkfront_click` to an additional `begin_checkout` event and `contact_form_submit` to an additional `generate_lead` event.
2. **Mark primary GA4 Key Events:** use `begin_checkout` and `generate_lead`; do not also import their source custom events as primary conversions.
3. **Mark secondary GA4 Key Events:** `book_now_click`, `phone_click`, `whatsapp_click`, and `email_click`.
4. **Configure Checkfront's native Google Ads integration** before launching ads; completed purchase tracking remains a separate project.
5. **Verify event counts and parameters** in GTM Preview / Tag Assistant and GA4 DebugView before launching paid campaigns.
