import Link from "next/link";
import type { JournalArticle } from "../types";

/*
 * GENERATED DRAFT — DO NOT PUBLISH WITHOUT HUMAN REVIEW.
 * Provenance (for editors; delete before publishing if preferred):
 * {
  "generator": "scripts/generate-dive-notes.mts (#245)",
  "generatedAt": "2026-10-10T11:38:41.721Z",
  "period": {
    "from": "2026-09-07",
    "to": "2026-09-13"
  },
  "recordCount": 5,
  "sourceRecordIds": [
    "fx-001",
    "fx-002",
    "fx-003",
    "fx-004",
    "fx-005"
  ],
  "fieldsUsed": [
    "date",
    "diveSlot",
    "boatId",
    "diveSiteId",
    "maxDepth",
    "waterTemperature",
    "sightings.speciesId",
    "sightings.count"
  ],
  "excludedFields": [
    "diveGuide/diveGuides (staff names — add by name only if approved)",
    "createdBy (internal user reference)",
    "createdAt (internal write timestamp)",
    "any guest/customer fields (none exist on dive records)"
  ]
}
 */

/**
 * Dive Notes draft generated 2026-10-10T11:38:41.721Z from dive-log data — unpublished
 * by construction (draft: true, unregistered). Review, edit, and delete this
 * header before publishing. See data/journal/README.md for the workflow.
 */
export const article: JournalArticle = {
  slug: "dive-notes-2026-09-07-to-2026-09-13",
  title: "Dive Notes: September 7–13, 2026",
  description:
    "Dive-log notes for September 7, 2026 – September 13, 2026: 4 dives across 3 sites, with 3 species logged. Draft pending editorial review.",
  publishedAt: "2026-09-13",
  category: "From the Boats",
  author: { name: "Sea Saba", type: "Organization", role: "Dive crew" },
  hero: {
    // Placeholder — replace with a real /images/optimized/ photo before review.
    src: "/images/optimized/dive-notes-hero-placeholder.webp",
    alt: "[Editor: choose a real photo from this period and describe it]",
  },
  draft: true,
  cta: { label: "Browse the full dive log", href: "/dive-log" },
  body: (
    <>
      <p>
        Between September 7, 2026 and September 13, 2026,
        Sea Saba boats logged 4 dives
        across 3 sites aboard Deep Blue and Fin &amp; Tonic.
      </p>
      <p>
        [Guide note: add context about this period — weather, sea state,
        or anything that shaped the diving.]
      </p>

      <h2>Where we dove</h2>
      <ul>
        <li>
          <Link href="/dive-sites#tent-reef">Tent Reef</Link> — 2 dives
        </li>
        <li>
          <Link href="/dive-sites">Fixture Shoal</Link> — 1 dive
        </li>
        <li>
          <Link href="/dive-sites#pinnacles">Third Encounter</Link> — 1 dive
        </li>
      </ul>

      <h2>Recorded sightings</h2>
      <p>
        Species the crew logged, with how many dives each was seen
        on — a count of encounters, not of individual animals.
      </p>
      <ul>
        <li>Caribbean Reef Shark — seen on 2 dives (up to 3 at once)</li>
        <li>Green Turtle — seen on 2 dives (up to 2 at once)</li>
        <li>Lionfish — seen on 1 dive (up to 2 at once)</li>
      </ul>

      <h2>Conditions</h2>
      <p>
        Recorded water temperatures ran 27–28 °C (81–82 °F); the deepest logged dive reached 30 m (98 ft); 1 drift dive was logged.
      </p>
      <p>
        [Guide note: add observed conditions — temperature,
        visibility, current.]
      </p>

      <h2>Before publishing</h2>
      <ul>
        <li>
          [Editor note: choose a real hero photo — ideally from this
          period — and write its alt text.]
        </li>
        <li>
          [Editor note: pick up to three related articles and set the
          related field.]
        </li>
        <li>
          [Editor note: once reviewed, remove draft: true and register
          this module in data/journal/index.ts — that commit is the
          publish step.]
        </li>
      </ul>
    </>
  ),
};
