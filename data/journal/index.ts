import { article as aDiveDayOnSaba } from "./articles/a-dive-day-on-saba";
import { article as planningASabaDiveTrip } from "./articles/planning-a-saba-dive-trip";
import { article as readingTheReef } from "./articles/reading-the-reef";
import { article as theMarinePark } from "./articles/the-marine-park-that-protects-the-dive";
import { article as welcomeToTheJournal } from "./articles/welcome-to-the-sea-saba-journal";
import { article as whySabaDivesDifferently } from "./articles/why-saba-dives-differently";
import type { JournalArticle } from "./types";

/**
 * The Journal registry — one module per article under `articles/`, listed
 * explicitly (no filesystem globbing, so publication is always a deliberate
 * commit). Ordering for display is derived from `publishedAt`; the order
 * here doesn't matter.
 *
 * All current entries are `demo: true` fixtures shipped with the Phase 1
 * foundation (#243) to prove the system — see README.md. They are not
 * owner-reviewed editorial content.
 */
export const JOURNAL_ARTICLES: JournalArticle[] = [
  welcomeToTheJournal,
  aDiveDayOnSaba,
  planningASabaDiveTrip,
  whySabaDivesDifferently,
  readingTheReef,
  theMarinePark,
];
