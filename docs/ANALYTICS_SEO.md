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

- **Vercel Analytics** — `@vercel/analytics/next` in `app/(en)/layout.tsx`, operating independently.
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
| `donation_click` | `/donate` recipient "Donate directly" CTAs — outbound links to each organization's own donation page | Page parameters, link parameters, and legacy aliases |
| `donation_request_started` | `/donate` "Request Support" form — first field focus | Page parameters and `button_location` only — **never** names, emails, request contents, amounts, or any field values |
| `donation_request_submitted` | `/donate` "Request Support" form — a completed form continuing to the visitor's email app or WhatsApp (`method` distinguishes them). A handoff, not a confirmed send | Page parameters, `method`, `button_location` only — **never** request details |
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

`app/sitemap.ts` lists every canonical public route — `/`, `/diving`,
`/dive-sites`, `/book`, `/plan-your-trip`, `/courses`, `/dive-log`,
`/visiting-yachts`, `/about`, `/contact`, `/partners`, `/donate`, `/terms`,
`/privacy`, `/cookie-policy` — driven by the `SITEMAP_ROUTES` table. It deliberately
omits `lastModified`: no trustworthy content-modification date exists, and a
build-time timestamp is a fake freshness signal crawlers discount. Add new
public pages to the table; `tests/unit/seo.test.ts` guards the list.

## Discoverability (SEO & AI crawlers)

Canonical host is `https://www.seasaba.com` (`SITE_URL` in
`lib/constants.ts`). The apex domain and `http:` both 308-redirect to the
canonical https+www origin; trailing slashes 308 to the clean path; legacy
Wix URLs 301 in a single hop via `data/redirects.ts`.

**Crawler policy.** `app/robots.ts` emits `User-agent: * / Allow: /` plus the
sitemap reference. The wildcard intentionally permits the major AI
user-agents — this is a marketing site and AI-search visibility is desirable:

| Agent | Purpose | Status |
|-------|---------|--------|
| Googlebot / Bingbot | Search indexing | allowed |
| OAI-SearchBot | ChatGPT search surfacing ([docs](https://developers.openai.com/api/docs/bots)) | allowed |
| GPTBot | OpenAI model training | allowed |
| ChatGPT-User | user-triggered fetch (may not obey robots) | allowed |
| ClaudeBot / Claude-SearchBot / Claude-User | Anthropic training / search / user fetch ([docs](https://support.claude.com/en/articles/8896518)) | allowed |
| Google-Extended | Gemini training control — a product token, not a crawler; does not affect Search ([docs](https://blog.google/innovation-and-ai/products/an-update-on-web-publisher-controls/)) | allowed |

There are no per-crawler rules because the wildcard already expresses the
intended policy; add explicit `Disallow` blocks only if the business decides
to opt out of AI training or AI-search surfacing.

**`/llms.txt`** (`public/llms.txt`) is a concise markdown index of the
canonical pages for LLM agents. Caveat: it is a community proposal, not a
standard — no major crawler is documented to fetch it proactively, and
Google does not use it for Search/AI Overviews. It exists because agents
pointed at a site (e.g., docs-browsing assistants) do consume it, and the
cost is one small file listing stable routes. No `/llms-full.txt` — full
content duplication is not maintainable and the HTML is already
server-rendered.

**Structured data.** One `LocalBusiness`/`SportsActivityLocation` JSON-LD
entity (`@id: <site>/#business`) sits in the root layout — the single Sea
Saba entity declaration. Content pages add: `BreadcrumbList` (emitted inside
`components/breadcrumbs.tsx` so schema mirrors the visible crumbs),
`Course` `ItemList` on `/courses` (derived from the `COURSES` table), and
`FAQPage` on `/plan-your-trip` (derived from the `FAQS` array — Google's FAQ
rich result is now limited to government/health sites, but the markup is
accurate machine-readable content for AI retrieval). Deliberately not added:
per-dive-site schema (content is section-level, not per-site pages),
`AggregateRating`/`Review` (no on-site review corpus), and `WebSite`
sitelinks searchbox (no site search).

**Crawlability.** All canonical pages are server-rendered; factual content
(products, courses, sites, policies, yacht guidance) is in the initial HTML.
Known limitation: `/dive-log` renders its Firestore dive list client-side —
the page shell and metadata are crawlable but the dive entries are not
(drive-by design; the Firestore SDK is client-only). `/book` shows the
Checkfront widget via client-side embed; the page itself is indexable.

**Webmaster tooling.** Sitemap is at `https://www.seasaba.com/sitemap.xml`
(already declared in robots.txt). Google Search Console and Bing Webmaster
Tools verification/submission require owner access to those accounts —
verification tokens are intentionally not in the repo. Submit the sitemap
URL in each console and verify indexing of the canonical routes above.


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
