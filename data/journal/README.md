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
- `demo` — marks placeholder content and renders a small notice on the
  article page. **Every article currently in this directory is a demo
  fixture** — neutral placeholder copy written to prove the system, not
  owner-reviewed editorial content. Replace fixtures with real articles
  before considering the Journal "launched".
- `draft` — marks an unpublished working draft (#245). Drafts still validate
  against the registry, but the public loader ignores them entirely: no index
  listing, no route (the slug 404s), no sitemap entry, no RSS item. Removing
  `draft: true` after human review is the publish step.

## Dive Notes drafts (#245)

`scripts/generate-dive-notes.mts` turns dive-log data into an unpublished
Dive Notes draft — a human-reviewed editorial workflow, never auto-published.

```bash
node scripts/generate-dive-notes.mts --week 2026-09-07      # week containing a date
node scripts/generate-dive-notes.mts --month 2026-09        # full month
node scripts/generate-dive-notes.mts --from 2026-09-07 --to 2026-09-13
node scripts/generate-dive-notes.mts --month 2026-09 --input snapshot.json
node scripts/generate-dive-notes.mts --week 2026-09-07 --preview   # no file written
```

Data source: `--input` takes a JSON snapshot
(`{ dives: [...], sites: [{id,name}], species: [...], boats: [...] }`;
Firestore `{seconds}` export dates are accepted). Without `--input` the
script reads the public dive-log collections over Firestore using the
documented `FIREBASE_*` env vars.

Output goes to `data/journal/drafts/dive-notes-<from>-to-<to>.tsx` — a normal
`JournalArticle` module with `draft: true`, placeholder hero, bracketed
`[Guide note: …]`/`[Editor note: …]` prompts wherever data can't support
prose, and a non-public provenance comment (date range, source record ids,
aggregation timestamp, fields used). It is **not** registered in `index.ts`
and carries `draft: true`, so it can never appear on `/journal`. To publish:
edit the draft, fill the prompts, then register it and remove `draft: true`
in a normal reviewed commit.

### Dive-log field classification

The generator reads a fixed whitelist — anything else on a record is ignored
by construction (`lib/journal/dive-notes.ts` → `DIVE_FIELDS_USED`):

| Field | Class | Handling |
| --- | --- | --- |
| `date` | safe (aggregated) | grouping, counts, titles |
| `diveSlot` | safe | grouping, drift detection |
| `boatId` → boat name | safe (already public) | named in the draft |
| `diveSiteId` → site name | safe (already public) | linked to `/dive-sites` anchors |
| `sightings[].speciesId/count` | safe (already public) | "seen on N dives" — never summed |
| `maxDepth`, `waterTemperature` | safe (already public) | ranges, only when recorded |
| `diveGuide`/`diveGuides` | staff names — approval only | never emitted; editor prompt instead |
| `createdBy`, `createdAt` | internal | never emitted; excluded from output entirely |
| record `id` | safe reference | provenance comment only, not rendered |
| guest/customer fields | — | **none exist** on dive records |
| any other field | untrusted | unread by the whitelist |

## Future CMS seam

Routes, sitemap, RSS and components consume the Journal only through
`lib/journal.ts` (`listArticles`, `getArticle`, `getRelatedArticles`, …).
That module is the entire storage boundary: a CMS-backed implementation can
swap `JOURNAL_ARTICLES` for a remote fetch and render remote bodies through
the same `JournalArticle` shape without touching `app/(en)/journal/*`, the
public URLs, or any component. Keep new consumers on the `lib/journal.ts` API —
do not import `data/journal` modules from routes or components.
