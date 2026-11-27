"use server";

import { diveLogRangeStartDate } from "@/lib/dive-log-dates";
import {
  isPublicDivingApiEnabled,
  loadDiveSitesFromApi,
  loadPublicDivesFromApi,
} from "@/lib/public-diving/client";

// Wider Dive Log ranges, loaded when a visitor asks for them (issue #325).
// Public and unauthenticated like the page itself: these accept only the
// inputs below and return the same public data the page renders.
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
  // Uncached, so the wider list is never older than the page that asked for
  // it and can replace it outright (the API keeps its own hourly snapshot).
  return loadPublicDivesFromApi({
    startDate: days === undefined ? undefined : diveLogRangeStartDate(days, Date.now()),
    fresh: true,
  });
}

/**
 * All history for one dive site, for `?site=` deep links and site-filtered
 * all-time views — much smaller than full history. Returns null when no
 * site matches the name, so the caller can fall back to a full load.
 */
export async function loadDiveLogSiteHistory(siteName: string) {
  const name = typeof siteName === "string" ? siteName.trim() : "";
  if (!isPublicDivingApiEnabled() || !name || name.length > 128) {
    throw new Error("Dive log history is unavailable");
  }
  const sites = await loadDiveSitesFromApi();
  const match = sites.find((s) => s.name === name);
  if (!match) return null;
  return loadPublicDivesFromApi({ siteId: match.siteId, fresh: true });
}
