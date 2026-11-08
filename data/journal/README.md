# Sea Saba Journal — content model

> Phase 1 foundation (issue #243). Repo-native, file-backed articles; no CMS,
> no database. Public routes: `/journal` and `/journal/<slug>`.

## Format

Each article is one TypeScript module in `articles/` exporting
`const article: JournalArticle` (schema in `types.ts`). Metadata fields are
plain data; `body` is a JSX tree rendered inside the article route's prose
column. This matches the repo convention — MDX was removed; content is
ordinary React/TSX.

To publish an article: add `articles/<slug>.tsx`, register it in `index.ts`.
Validation in `lib/journal.ts` runs at module load, so a malformed article
fails `next build` / `npm test` with a named list of problems.

### Field rules

- `slug` — kebab-case, unique; it *is* the public URL. Never reuse
  `feed.xml`/`feed` (reserved route segments) or republish a retired slug.
- `publishedAt`/`updatedAt` — ISO `YYYY-MM-DD`; `updatedAt` only on real
  revisions (it drives sitemap `lastModified` and `dateModified`).
- `category` — one of `JOURNAL_CATEGORIES`.
- `hero.src` — must point into `/images/` (the local optimized pipeline);
  `hero.alt` is required and reused for OG/JSON-LD.
- `body` — semantic JSX: `p`, `h2`/`h3` (never `h1` — the route renders the
  title), `ul`/`ol`, `blockquote`, `<Link>`, plus `JournalFigure`
  (captioned image) and `JournalCallout` ("good to know" aside). Link to the
  canonical pages (`/diving`, `/dive-sites`, `/plan-your-trip`, …) rather
  than duplicating facts; pull operational values from `data/operations.ts`.
- `cta` — optional, at most one. It renders as a quiet text link at the
  article foot, so write the label as the natural next step for *that*
  article (e.g. a trip-planning piece points at "Plan your Saba trip", a
  Dive Notes piece at "See recent dives"). Never a generic "Learn more" or
  a booking push.

### Editorial style rules

- **No em dashes in public-facing Journal copy** — titles, descriptions,
  body, captions, notices, CTA labels, the index intro. Prefer commas,
  colons, parentheses, or splitting into shorter sentences.
- Avoid repetitive headline constructions of the `X — Y` / `X: Y` shape
  unless there is a specific editorial reason; most titles read better
  plain.
- Keep descriptions (deks) to one or two disciplined sentences; they are
  also the meta description.
- `demo` — marks placeholder content and renders a small notice on the
  article page. **Every article currently in this directory is a demo
  fixture** — neutral placeholder copy written to prove the system, not
  owner-reviewed editorial content. Replace fixtures with real articles
  before considering the Journal "launched".

## Future CMS seam

Routes, sitemap, RSS and components consume the Journal only through
`lib/journal.ts` (`listArticles`, `getArticle`, `getRelatedArticles`, …).
That module is the entire storage boundary: a CMS-backed implementation can
swap `JOURNAL_ARTICLES` for a remote fetch and render remote bodies through
the same `JournalArticle` shape without touching `app/(en)/journal/*`, the
public URLs, or any component. Keep new consumers on the `lib/journal.ts` API —
do not import `data/journal` modules from routes or components.
