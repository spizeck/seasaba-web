"use server";

import {
  diveLogStartDate,
  isPublicDivingApiEnabled,
  loadPublicDivesFromApi,
} from "@/lib/public-diving/client";

// Wider Dive Log ranges, loaded when a visitor asks for them (issue #325).
// Public and unauthenticated like the page itself: it accepts only these
// keys and returns the same public data the page renders.
const HISTORY_DAYS: Record<string, number | undefined> = {
  "30": 30,
  "90": 90,
  all: undefined,
};

export async function loadDiveLogHistory(range: string) {
  if (!isPublicDivingApiEnabled() || !Object.hasOwn(HISTORY_DAYS, range)) {
    throw new Error("Dive log history is unavailable");
  }
  const days = HISTORY_DAYS[range];
  return loadPublicDivesFromApi({
    startDate: days === undefined ? undefined : diveLogStartDate(days),
  });
}
