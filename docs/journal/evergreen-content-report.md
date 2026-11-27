# Sea Saba evergreen content initiative report

Prepared 2026-11-26. Scope: research and draft preparation only. Nothing in this packet is published, routed, indexed, merged, or deployed.

## Delivered inventory

23 unique article drafts are in `docs/journal/drafts/`:

- Batch A: 9 trip-planning drafts
- Batch B: 8 unique diving/local-expertise drafts after consolidating the two beginner topics
- Batch C: 6 behind-the-scenes/firsthand drafts

See [review index](review-index.md) for links, order, and priority.

## Overlap decisions

- `/plan-your-trip` remains the canonical broad trip-planning page. Batch A articles expand individual decisions rather than replacing it.
- `/diving` remains the canonical commercial diving overview. Day-experience, beginner, conditions, technical, and marine-park articles go deeper without changing conversion copy.
- The two beginner topics were consolidated because they share the same search intent.
- `History of Diving in Saba` and `Four Decades of Sea Saba` remain separate but deliberately conservative. History is island/industry context; four decades is institutional history requiring oral-history input.
- No competing commercial pricing source was created. Checkfront remains canonical for prices and availability.

## Research and data analysis

Primary source notes are in [source-and-audit-notes.md](research/source-and-audit-notes.md). Sources include Saba Tourism, Saba Conservation Foundation, Winair, Makana Ferry, Netherlands Worldwide, DAN, TDI/SDI, KNMI, official vessel/accommodation pages, repository canonical facts, staff biographies, dive-site data, and public dive-log output.

Original analysis used a read-only extraction of 3,351 deduplicated public dive records from 2023-09-24 through 2026-11-25. It found monthly mean water temperatures from about 26.8°C/80°F in February and March to 29.7°C/85°F in October, frequent turtle and shark sighting records, and meaningful site-level differences. All analysis files and limitations are documented in `docs/journal/research/`.

Important limitation: recreational sighting records are not unique-animal counts, scientific transects, or population trends. Publication-date refresh is recommended.

## Publication readiness

Closest to publication after owner fact-check:

1. How to Get to Saba
2. What to Expect on a Diving Day With Sea Saba
3. Planning Your First Diving Vacation in Saba
4. Where to Stay on Saba
5. Best Time of Year to Dive in Saba
6. Beginner Divers in Saba
7. Understanding Saba's Diving Conditions

Require significant owner/staff input before publication:

- Technical Diving in Saba: needs an approved technical reviewer and current equipment confirmation.
- History and Four Decades: need firsthand facts, dates, photographs, and ownership history.
- Batch C process/boat/guide articles: deliberately factual skeletons because authentic procedures and anecdotes cannot be invented.
- Cost article: needs an owner decision about whether to include current dive/package price examples.

## Photography and assignments

Existing approved library images were identified where possible, but machine-readable attribution is incomplete. Candice Landau and Chris Kurzatkowski credits are visible in homepage usage for selected images; owner confirmation is still needed before reusing attribution.

Missing priority images:

- Makana Ferry or Winair arrival imagery
- Behind-the-scenes equipment preparation and briefing photos
- Current fleet photos by boat, including ladders, camera tables, rinse tanks, oxygen, upper deck
- Historic Sea Saba photos and archive material
- Original macro photography for the photography article
- Staff-approved candid guide-at-work images

## Internal linking recommendations

After publication and Journal integration:

- Link `/plan-your-trip` sections to the detailed travel, stay, cost, packing, season, itinerary, and non-diving articles.
- Link `/diving` experience, beginner, technical, and marine-park sections to matching articles.
- Link individual dive-site pages contextually to pinnacles, sharks, conditions, marine park, and photography articles.
- Link `/dive-log` to the dive-log-analysis article only after numerical transparency is approved.
- Link staff biographies to history or behind-the-scenes articles only when those individuals approve attribution.
- Do not expose draft links until articles are actually published.

## Validation results

Automated and manual validation performed on this documentation-only branch:

- 23 Markdown draft files present.
- Exactly one H1 per draft.
- No em dashes detected in drafts.
- Drafts are under `docs/` only; no app routes, navigation entries, sitemap entries, robots changes, or public rendering were added.
- Internal `/journal/...` links intentionally reference future slugs and must not be rendered publicly before publication.
- Full Next.js lint/typecheck/build were not necessary to validate these non-imported documentation files and would not exercise them; no application code changed.

## Skills used

- Repository instructions and skills: `AGENTS.md` and `AI_INSTRUCTIONS.md` were read and applied. Key applications: marketing pages are canonical TSX but drafts are documentation because no merged Journal draft workflow exists; do not duplicate pricing logic; preserve operational facts in `data/operations.ts`; avoid hype; prioritize trust and SEO-quality content.
- `pr-workflow`: used for branch/PR-oriented completion expectations. No existing issue was created for this task because the user provided a direct comprehensive specification.
- `vercel-react-best-practices`: reviewed but not applied because no React or Next.js application code was changed.
- `discovery-first-development`: not used because this was a detailed specified content-production assignment, not an exploratory product UX request.

## Blockers and required owner decisions

1. No merged Journal draft workflow exists on `master`; this packet uses the assignment's Markdown fallback.
2. Owner approval is required before publication, merging, deployment, staff attribution, or author/reviewer naming.
3. Batch C cannot become genuinely rich firsthand content without owner/staff interviews or annotations.
4. Photography rights and attribution require confirmation.
5. Current prices, boat details, lunch arrangements, and exact operational procedures require owner confirmation.
