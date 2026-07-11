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
  technicalDiving: "technical-diving",
} as const;

export const planYourTripAnchors = {
  gettingHere: "getting-here",
  whereToStay: "where-to-stay",
  whenToVisit: "when-to-visit",
  whatToBring: "what-to-bring",
  goodToKnow: "good-to-know",
  recommendedPartners: "recommended-partners",
  restaurants: "restaurants",
  history: "history",
  hiking: "hiking",
  experiences: "experiences",
  faq: "faq",
} as const;

export const yachtDivingAnchors = {
  divingRegulations: "diving-regulations",
  waysToDive: "ways-to-dive",
  arrivingInSaba: "arriving-in-saba",
  moorings: "moorings",
  faq: "faq",
} as const;

export const coursesAnchors = {
  nitrox: "nitrox",
} as const;
