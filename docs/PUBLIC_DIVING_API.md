# Public Diving API Integration (seasaba-web#325)

How seasaba.com consumes the seasaba.app public diving API (v1), implemented
in `spizeck/contract-builder` (issue #404; contract in its `PUBLIC_API.md`).
seasaba.app is intended to become the single authoritative source for
operational diving data and approved public dive-site content. This repo
only fetches, validates and maps API responses into the existing view
models; it does not redefine grouping or statistics.

## Architecture

```
Dive Log page / homepage / dive-site pages (server components, hourly ISR)
  -> lib/public-diving/client.ts            (server-only)
  -> GET {PUBLIC_DIVING_API_BASE_URL}/api/public/v1/{dives,dive-stats,dive-sites}
  -> seasaba.app (hourly cached snapshot of operational Firestore)
```

| Surface | Endpoint | Mapped to |
|---|---|---|
| `/dive-log` | `GET /dives?limit=100&cursor=...` (all pages) | `PublicDive[]` (already grouped by the API) |
| Homepage stats | `GET /dive-stats` | `WeeklyDiveStats` |
| `/dive-sites/[slug]` | `GET /dive-sites?published=true` | `DiveSitePageContent` overlay |

Units are meters and Celsius; the client refuses a response declaring other
units. Metric/imperial conversion, filters and PDF/CSV exports run on the
mapped `PublicDive` objects exactly as before.

## Configuration

| Variable | Default | Effect |
|---|---|---|
| `PUBLIC_DIVING_API_BASE_URL` | unset | Unset: Dive Log and homepage stats read Firestore directly (pre-#325 behavior). Set to the deployment origin (e.g. `https://seasaba.app`): both render from the API. Only `https://` origins, or `http://` on localhost, are accepted; anything else counts as unset. |
| `DIVE_SITE_CONTENT_SOURCE` | unset (`static`) | `api` (with the base URL set): published website snapshots override the fields they provide on matching dive-site pages. |

Both are server-only (no `NEXT_PUBLIC_` prefix) and are not secrets: the API
is public and unauthenticated.

### Local, test and preview

- **Local dev / unit tests / CI / `build:test`:** leave both unset. Behavior
  is identical to before this change. Tests stub `fetch` with representative
  v1 responses (`tests/fixtures/public-diving-api.ts`).
- **Against a local contract-builder:** `PUBLIC_DIVING_API_BASE_URL=http://localhost:3000`
  (run the website on another port).
- **Vercel preview:** set the variable for the Preview environment only,
  pointing at a contract-builder preview or production deployment that
  serves `/api/public/v1`. If that deployment uses Vercel deployment
  protection the server-side fetch will be refused; use an unprotected API
  origin.

## Failure behavior

Every failure (network error, timeout, non-2xx including `503
backend_unavailable` and `400 invalid_query`, malformed body, unexpected
units, runaway pagination) throws.

| Phase | Dive Log | Homepage stats | Dive-site pages |
|---|---|---|---|
| Production runtime (ISR) | Throws: last good page kept | Throws: last good page kept | Throws: last good page kept |
| Build / development | Error state; "Try again" re-renders on the server | Stats section hidden | Static content |

A `200` with empty data is a genuine result: an empty week shows no stats
section (as before), and the Dive Log renders its "No dives logged yet"
state. (In Firestore mode an empty Dive Log at production runtime still
keeps the last good page, because an unreachable Firestore can resolve an
empty snapshot.)

In API mode the browser never reads Firestore. Without a server payload the
Dive Log shows its error state, and "Try again" calls `router.refresh()` so
the server re-renders through the API (and the ISR cache).

## Dive-site content rules

- The static catalogue (`data/dive-site-videos.ts`) still decides which pages
  exist, their slugs, names, areas, sitemap entries, related sites and
  photography. API sites without a catalogue slug do not create pages.
- Only `websitePublished: true` snapshots with `websiteContent` are used;
  drafts are never requested, and operational `active` is never read.
- A site matches on `websiteContent.slug`, else on the slug of its name.
- Provided fields override: `fullDescription` (else `shortDescription`) for
  body copy and structured data, `seoTitle`, `seoDescription` (else
  `shortDescription`), and `youtubeVideoUrl` (YouTube https URLs only; still
  rendered through the click-to-play `youtube-nocookie.com` facade). Every
  field not provided keeps the static value. Nothing is synthesized.
- Not yet rendered: `experienceLevel`, `typicalConditions`,
  `specialConsiderations`, `featuredImage*`. They need presentation design
  (and an image host allowlist) owned by the dive-site presentation work.

## Commissioning and transition

1. **Now (this PR):** both variables unset in production. No change.
2. **Dive Log + stats:** once contract-builder PR #408 is deployed, verify
   `/api/public/v1/dives` and `/dive-stats` on seasaba.app, set
   `PUBLIC_DIVING_API_BASE_URL` in a preview, compare against the current
   production pages, then set it in Production. Rollback: unset and redeploy.
3. **Dive-site content:** after the import (contract-builder PR #407) has
   been reviewed and published in Manage Sites, set
   `DIVE_SITE_CONTENT_SOURCE=api` in a preview, review every page, then
   Production.
4. **Decommission the dual path:** once both are stable, remove the direct
   Firestore Dive Log/stats reads (`lib/firestore/dive-log.ts` fetchers,
   `lib/dive-stats.ts` computation, the Firestore-mode client retry in
   `components/dive-log-client.tsx`), both commissioning variables, and the
   static descriptions superseded by published content. The variables are
   transition switches, not a permanent dual-source design.
