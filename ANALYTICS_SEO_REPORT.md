# Analytics & SEO Implementation Report

## Implemented Tools

- **Vercel Analytics** — `@vercel/analytics/next` in `app/layout.tsx` (existing).
- **Google Analytics 4** — loaded via `AnalyticsLoader` when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
- **Google Tag Manager** — loaded via `AnalyticsLoader` when `NEXT_PUBLIC_GTM_ID` is set; includes `<noscript>` iframe fallback. If GTM is configured, GA4 is not loaded separately to avoid double counting (configure GA4 inside GTM).
- **Unified event utility** — `lib/analytics.ts` dispatches `book_now_click`, `checkfront_click`, `contact_form_submit`, `email_click`, `phone_click`, `whatsapp_click`, `directions_click`, `ferry_link_click`, `social_click`, and `pdf_download` to Vercel, GA4, and the GTM dataLayer.
- **Reusable tracking components** — `TrackedInternalButton`, `TrackedOutboundButton`, `TrackedOutboundLink`, and `TrackedContactLink` simplify future instrumentation.

## Tracked Events

| Event | Where it's fired | Parameters |
|-------|------------------|------------|
| `book_now_click` | Header, BookingCTA, homepage Hero, homepage final CTA, diving page CTAs, courses page CTAs, dive-sites CTA, contact "Plan Your Trip" button | `button_text`, `link_destination`, `page_path`, `page_title`, `referrer` |
| `checkfront_click` | BookingWidget fallback links, sample MDX (fallback) | `link_destination`, `button_text`, `page_path`, `page_title`, `referrer` |
| `contact_form_submit` | ContactForm email/WhatsApp submit handlers | `method`, `inquiry_type`, `page_path`, `page_title`, `referrer` |
| `email_click` | Footer, contact page, privacy page | `link_destination`, `button_text`, `page_path`, `page_title`, `referrer` |
| `phone_click` | Footer, contact page | `link_destination`, `button_text`, `page_path`, `page_title`, `referrer` |
| `whatsapp_click` | Footer, contact page | `link_destination`, `button_text`, `page_path`, `page_title`, `referrer` |
| `directions_click` | FindSeaSaba map card, LocationPin | `link_destination`, `button_text`, `page_path`, `page_title`, `referrer` |
| `ferry_link_click` | Plan-your-trip ferry links, local partners (Makana Ferry) | `link_destination`, `button_text`, `page_path`, `page_title`, `referrer` |
| `social_click` | Footer social links, partner website links, Google Reviews link | `link_destination`, `button_text`, `partner_name` (where applicable), `page_path`, `page_title`, `referrer` |
| `pdf_download` | Dive-log PDF export | `page_path`, `page_title`, `referrer` |

## Required Environment Variables

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # optional; loads GA4
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX                # optional; loads GTM (preferred for Google Ads)
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

1. **Create a GTM container** and add `NEXT_PUBLIC_GTM_ID` to Vercel.
2. **Configure GA4 inside GTM** (rather than loading GA4 separately) so conversion tags can be layered on top of the same dataLayer events.
3. **Map the existing events to Google Ads conversions** in GTM:
   - `book_now_click` → "Book Diving" lead click conversion.
   - `checkfront_click` → "Booking Initiated" conversion (closest proxy for checkout start).
   - `contact_form_submit` → "Contact Lead" conversion.
   - `phone_click`, `whatsapp_click`, `email_click` → "Contact Lead" conversion.
4. **Add Google Ads conversion tag** in GTM after the Ads account is created and the conversion IDs are known.
5. **Enable enhanced conversion** (if collecting email/phone on the site) for better attribution.
6. **Verify events in GTM Preview / Tag Assistant** before launching paid campaigns.
