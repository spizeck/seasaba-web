// TODO: This data access layer currently returns mock data.
// When the Sea Saba dive log app's public API or Firestore export is ready,
// replace getPublicDives() with an API fetch or Firestore query.
// Do NOT add Firebase credentials or connect directly to the other repo here.
// The UI in app/(content)/dive-log/page.tsx consumes this function and
// should require no changes when this layer is updated.

import type { PublicDive } from "@/data/dive-log-mock";
import { MOCK_DIVES } from "@/data/dive-log-mock";

export type { PublicDive };

export async function getPublicDives(): Promise<PublicDive[]> {
  return MOCK_DIVES;
}
