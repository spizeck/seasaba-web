/**
 * Centralized section-anchor IDs.
 *
 * These constants are the single source of truth for on-page section `id`s that
 * are also used as redirect targets (see `data/redirects.ts`). Import them in
 * page markup and in the redirect map so that changing an anchor in one place
 * updates both, and a rename can never silently break a legacy redirect.
 */

export const diveSiteAnchors = {
  pinnacles: "pinnacles",
  tentReef: "tent-reef",
  ladderBay: "ladder-bay",
  wellsBay: "wells-bay",
  windwardside: "windwardside",
} as const;

export const divingAnchors = {
  nitrox: "nitrox",
  altitudeFlying: "altitude-flying",
} as const;

export const planYourTripAnchors = {
  gettingHere: "getting-here",
  whereToStay: "where-to-stay",
  restaurants: "restaurants",
  history: "history",
  hiking: "hiking",
  experiences: "experiences",
  faq: "faq",
} as const;

export const coursesAnchors = {
  nitrox: "nitrox",
} as const;
