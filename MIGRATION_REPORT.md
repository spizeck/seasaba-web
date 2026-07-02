# Wix → Next.js SEO Migration Report

Migration of legacy Wix URLs (https://www.seasaba.com) onto the new Next.js site,
preserving the new information architecture and URL slugs while protecting existing
search rankings with single-hop 301 redirects.

**Guiding principle:** the new site's structure, navigation, and slugs are canonical.
Legacy URLs are mapped to the most relevant new destination — never redirected to the
homepage just to avoid a 404, and flagged for manual review when no suitable equivalent exists.

## Summary

| Metric | Count |
|---|---|
| Total legacy URLs crawled (Wix sitemaps) | 74 |
| — Pages | 71 |
| — Blog posts | 3 |
| 301 redirects created | 66 |
| URLs unchanged (identical slug, no redirect) | 3 |
| URLs flagged for manual review (no auto-redirect) | 5 |
| Redirect chains | 0 |
| Redirect loops | 0 |
| Multi-hop redirects | 0 (every redirect resolves in a single hop) |
| New-site pages crawled | 12 |
| Broken internal links | 0 |
| Broken referenced assets (images/PDF) | 0 |
| Orphan pages (in sitemap, unlinked) | 0 (was 1: `/diving/first-dive`, now linked from `/diving`) |
| Production pages accidentally `noindex` | 0 |

## How the inventory was built
- Fetched `https://www.seasaba.com/robots.txt` → `sitemap.xml` (Wix sitemap index).
- Parsed `pages-sitemap.xml` (71 URLs) and `blog-posts-sitemap.xml` (3 URLs).
- Crawled every legacy URL and captured HTTP status, final URL, `<title>`, meta description,
  H1, canonical, and robots meta.
- Enumerated the new site's routes from the Next.js App Router and cross-referenced page
  content (dive-site area anchors, plan-your-trip section anchors) to choose the most
  relevant redirect target for each legacy URL.

## Validation (against a production build of the new site)
- All 66 redirects return a single `301` to the expected destination; each destination
  returns `200` (no chains, no loops, no multi-hop).
- All 3 identical URLs (`/`, `/contact`, `/terms`) return `200`.
- All 5 manual-review URLs correctly return `404` (intentionally not guessed).
- Crawled the new site from the homepage: all pages `200`, no broken internal links,
  36 referenced static assets all `200`, no orphan pages, no accidental `noindex`.
- `sitemap.xml` contains only indexable (`200`) pages; `robots.txt` allows all
  and points at the sitemap.

## Items flagged for manual review (no redirect created)
These legacy URLs have no suitable equivalent in the new IA and were intentionally left
without a redirect (they 404) rather than guessing an unrelated destination:

| Old URL | Reason | Suggested action |
|---|---|---|
| `/seasaba-blog` | Blog index — the new site has no blog | Decide: 301 to a content hub, rebuild a blog, or return 410 |
| `/post/join-sea-learn-field-projects-with-sea-saba-october-2023` | Dated event post, no equivalent | 410, or migrate as an evergreen article |
| `/post/oxe-marine-technician-training` | Blog post, no equivalent | 410, or migrate as an article |
| `/dive-log` | Near-empty Wix utility page (unclear purpose) | Confirm intent; 410 if obsolete |
| `/howto-s` | Near-empty Wix utility page (unclear purpose) | Confirm intent; 410 if obsolete |

> Note: `/post/diving-into-the-future-with-fin-tonic-and-shark-bait` (blog post about the
> new dive boats) WAS redirected to `/diving`, since the boats are covered there.

## Notes on images & assets
- Legacy Wix images were served from Wix's CDN (`static.wixstatic.com`), a different domain,
  so no image URL redirects are needed — new images live under `/images/optimized/*`.
- All 36 static assets referenced by the new site resolve (`200`).
- Minor: `public/images/White SEA SABA logo transparent.png` contains spaces. It works
  (URL-encoded) but a hyphenated filename (e.g. `sea-saba-logo-white.png`) is cleaner for SEO.

## Metadata / SEO status of the new site (audit)
- Every page has exactly one `<h1>` (hero title on content pages; explicit on `/book`,
  `/contact`; MDX heading on `/diving/first-dive`).
- Per-page titles, meta descriptions, canonical URLs, and Open Graph / Twitter cards are
  generated via `lib/metadata.ts` `createMetadata()`; the root layout sets a title template
  and default OG/Twitter.
- `LocalBusiness`/`SportsActivityLocation` JSON-LD is present site-wide.
- Search-param pages (`/book`, `/contact` with query strings) are set to `noindex, follow`
  to avoid duplicate-content indexing; the clean routes remain indexable.
- No duplicate titles/descriptions across canonical routes.

## Recommendations (future enhancements, not blocking)
1. Resolve the 5 manual-review URLs above (410 vs. migrate vs. redirect).
2. Consider dedicated content the old site had that the new IA folds into broader pages:
   Saba history, restaurants, hiking/things-to-do, sunset cruise, air-quality ("Certified
   Pure"), and DAN/altitude safety — currently redirected to the closest hub.
3. Rename the logo asset to a hyphenated, descriptive filename.
4. Replace the `/diving/first-dive` sample MDX with finalized copy if not already intended
   as production content.

## Complete URL mapping table

| Old URL | New URL | Redirect | Status | Notes |
|---|---|---|---|---|
| `/` | `/` | No | OK (identical) | Homepage — identical URL, no redirect needed |
| `/about/the-sea-saba-difference` | `/about` | Yes | 301 | Our Approach / difference now on About page |
| `/book-saba-diving-online` | `/book` | Yes | 301 | Online booking page |
| `/certified-pure` | `/diving` | Yes | 301 | Air-quality/safety content best fits Diving; consider an air-quality note |
| `/childrens-scuba` | `/courses` | Yes | 301 | Try Scuba covers younger/new divers; consider a family note |
| `/concerning-altitude` | `/diving` | Yes | 301 | Altitude/flying-after-diving safety best fits Diving; consider a safety note |
| `/contact` | `/contact` | No | OK (identical) | Identical URL, no redirect needed |
| `/copy-of-dive-shop` | `/about` | Yes | 301 | Duplicate Fort Bay page; mapped directly to final destination (no chain) |
| `/copy-of-fort-bay-harbor` | `/about` | Yes | 301 | Duplicate Fort Bay page; mapped directly to final destination (no chain) |
| `/cottage-andhouse-rentals` | `/plan-your-trip#where-to-stay` | Yes | 301 | Accommodation options in Where to Stay |
| `/dan-report` | `/diving` | Yes | 301 | DAN/dive-safety content best fits Diving; consider a safety note |
| `/dive-log` | — | No | Manual review | Near-empty Wix utility page (unclear purpose); flag for manual review |
| `/dive-nitrox-with-sea-saba` | `/diving` | Yes | 301 | Free Nitrox featured on Diving page |
| `/dive-partners` | `/about` | Yes | 301 | Partners context best fits About; consider a dedicated Partners section |
| `/dive-shop-on-saba` | `/contact` | Yes | 301 | New site has no retail catalog; Contact shows location/visit info |
| `/dive-training-courses` | `/courses` | Yes | 301 | Courses & certifications page |
| `/facebook` | `https://www.facebook.com/sea.saba/` | Yes | 301 | Wix social shortcut → external Facebook profile |
| `/fort-bay-harbor` | `/about` | Yes | 301 | 'Our Historic Home in Fort Bay Harbor' section on About page |
| `/hiking-on-saba` | `/plan-your-trip` | Yes | 301 | Non-diver island activities; consider a things-to-do note |
| `/howto-s` | — | No | Manual review | Near-empty Wix utility page (unclear purpose); flag for manual review |
| `/instagram` | `https://www.instagram.com/seasaba/` | Yes | 301 | Wix social shortcut → external Instagram profile |
| `/meet-the-crew` | `/about` | Yes | 301 | Meet the Crew section on About page |
| `/post/diving-into-the-future-with-fin-tonic-and-shark-bait` | `/diving` | Yes | 301 | Blog post about the dive boats; Diving page covers the boats |
| `/post/join-sea-learn-field-projects-with-sea-saba-october-2023` | — | No | Manual review | Dated event blog post — no equivalent; flag for manual review |
| `/post/oxe-marine-technician-training` | — | No | Manual review | Blog post — no equivalent; flag for manual review |
| `/saba-1-mt-michel` | `/dive-sites#pinnacles` | Yes | 301 | Individual dive-site page → Dive Sites 'pinnacles' area section |
| `/saba-10-coral-nursery` | `/dive-sites` | Yes | 301 | No dedicated section for the Coral Nursery site; mapped to Dive Sites index |
| `/saba-11-customs-house` | `/dive-sites#ladder-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'ladder-bay' area section |
| `/saba-12-porites-point` | `/dive-sites#ladder-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'ladder-bay' area section |
| `/saba-13-babylon` | `/dive-sites#ladder-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'ladder-bay' area section |
| `/saba-14-ladder-labyrinth` | `/dive-sites#ladder-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'ladder-bay' area section |
| `/saba-15-50-50` | `/dive-sites#ladder-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'ladder-bay' area section |
| `/saba-16-hot-springs` | `/dive-sites#ladder-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'ladder-bay' area section |
| `/saba-17-rays-n-anchors` | `/dive-sites#ladder-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'ladder-bay' area section |
| `/saba-18-tedran-wall` | `/dive-sites#tent-reef` | Yes | 301 | Individual dive-site page → Dive Sites 'tent-reef' area section |
| `/saba-19-tent-reef-wall` | `/dive-sites#tent-reef` | Yes | 301 | Individual dive-site page → Dive Sites 'tent-reef' area section |
| `/saba-2-third-encounter` | `/dive-sites#pinnacles` | Yes | 301 | Individual dive-site page → Dive Sites 'pinnacles' area section |
| `/saba-20-tent-reef` | `/dive-sites#tent-reef` | Yes | 301 | Individual dive-site page → Dive Sites 'tent-reef' area section |
| `/saba-21-tent-reef-shallow` | `/dive-sites#tent-reef` | Yes | 301 | Individual dive-site page → Dive Sites 'tent-reef' area section |
| `/saba-22-tent-reef-deep` | `/dive-sites#tent-reef` | Yes | 301 | Individual dive-site page → Dive Sites 'tent-reef' area section |
| `/saba-23-mooring-muck-dive` | `/dive-sites` | Yes | 301 | No dedicated section for the Mooring/Muck dive; mapped to Dive Sites index |
| `/saba-24-greer-gut` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-25-big-rock-market` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-26-big-rock-deep` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-27-hole-in-the-corner` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-28-davids-dropoff` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-29-core-gut` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-3-twiwlight-zone` | `/dive-sites#pinnacles` | Yes | 301 | Individual dive-site page → Dive Sites 'pinnacles' area section |
| `/saba-30-cove-bay` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-31-green-island` | `/dive-sites#windwardside` | Yes | 301 | Individual dive-site page → Dive Sites 'windwardside' area section |
| `/saba-4-outer-limits` | `/dive-sites#pinnacles` | Yes | 301 | Individual dive-site page → Dive Sites 'pinnacles' area section |
| `/saba-5-oshark-shoals` | `/dive-sites#pinnacles` | Yes | 301 | Individual dive-site page → Dive Sites 'pinnacles' area section |
| `/saba-6-diamond-rock` | `/dive-sites#wells-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'wells-bay' area section |
| `/saba-7-man-owar-shoals` | `/dive-sites#wells-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'wells-bay' area section |
| `/saba-8-otto-limits` | `/dive-sites#wells-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'wells-bay' area section |
| `/saba-9-torrens-point` | `/dive-sites#wells-bay` | Yes | 301 | Individual dive-site page → Dive Sites 'wells-bay' area section |
| `/saba-history` | `/plan-your-trip` | Yes | 301 | No dedicated history page; recommend a Saba history section |
| `/saba-marine-park` | `/dive-sites` | Yes | 301 | Saba Marine Park overview covered on Dive Sites page |
| `/saba-restaurants` | `/plan-your-trip#good-to-know` | Yes | 301 | Island dining; no dedicated restaurants section |
| `/saba-sunset-cruise` | `/diving` | Yes | 301 | Sunset cruise not currently featured; recommend adding as an experience |
| `/sabas-best-dive-boats` | `/diving` | Yes | 301 | Boats/experience content on Diving page |
| `/sabas-dive-sites` | `/dive-sites` | Yes | 301 | Dive sites overview |
| `/sailing-to-saba` | `/plan-your-trip#getting-here` | Yes | 301 | Arrival options / rendezvous; consider a sailing note |
| `/seasaba-blog` | — | No | Manual review | Blog index — no blog on new IA; flag for manual review (301 to hub or 410) |
| `/seasaba-faqs` | `/plan-your-trip#faq` | Yes | 301 | FAQ section |
| `/snorkeling-saba` | `/diving` | Yes | 301 | Snorkel trip is a Diving experience option |
| `/terms` | `/terms` | No | OK (identical) | Identical URL, no redirect needed |
| `/the-island-of-saba` | `/plan-your-trip` | Yes | 301 | Destination overview |
| `/training-beginners` | `/courses` | Yes | 301 | Beginner courses (Try Scuba / Open Water) on Courses page |
| `/training-the-next-step` | `/courses` | Yes | 301 | Continuing-education courses on Courses page |
| `/travelling-to-saba` | `/plan-your-trip#getting-here` | Yes | 301 | Getting to Saba |
| `/tripadvisor` | `https://www.tripadvisor.com/Attraction_Review-g147337-d1206831-Reviews-Sea_Saba_Dive_Center-Windwardside_Saba.html` | Yes | 301 | Wix social shortcut → external TripAdvisor listing |
| `/where-to-stay` | `/plan-your-trip#where-to-stay` | Yes | 301 | Where to Stay section |
| `/youtube` | `https://youtube.com/@sea_saba` | Yes | 301 | Wix social shortcut → external YouTube profile |
