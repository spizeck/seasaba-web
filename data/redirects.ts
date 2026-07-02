import {
  diveSiteAnchors,
  divingAnchors,
  planYourTripAnchors,
} from "../lib/anchors";

/**
 * Legacy Wix URL → new-site redirect map, generated during the Wix→Next.js
 * migration. Extracted here (rather than inlined in `next.config.ts`) so future
 * URL/anchor changes don't require editing core Next.js config.
 *
 * Rules enforced by this table:
 *  - Every entry resolves in a single hop (no destination is also a source).
 *  - No redirect chains or loops.
 *  - Genuine HTTP 301 (`statusCode: 301`), not the 308 that `permanent: true`
 *    emits, to preserve SEO equity as legacy 301s did.
 *
 * Anchor targets reference the shared constants in `lib/anchors.ts` so a section
 * rename on a page updates the redirect target too.
 */
export type LegacyRedirect = {
  source: string;
  destination: string;
  statusCode: 301;
  basePath?: false;
};

const diving = (anchor?: string) =>
  anchor ? `/diving#${anchor}` : "/diving";
const planYourTrip = (anchor: string) => `/plan-your-trip#${anchor}`;
const diveSites = (anchor?: string) =>
  anchor ? `/dive-sites#${anchor}` : "/dive-sites";

export const legacyRedirects: LegacyRedirect[] = [
  // About cluster
  { source: "/about/the-sea-saba-difference", destination: "/about", statusCode: 301 },
  { source: "/meet-the-crew", destination: "/about", statusCode: 301 },
  { source: "/fort-bay-harbor", destination: "/about", statusCode: 301 },
  { source: "/copy-of-fort-bay-harbor", destination: "/about", statusCode: 301 },
  { source: "/copy-of-dive-shop", destination: "/about", statusCode: 301 },
  { source: "/dive-partners", destination: "/about", statusCode: 301 },

  // Booking
  { source: "/book-saba-diving-online", destination: "/book", statusCode: 301 },

  // Dive sites — overview / marine park / map
  { source: "/sabas-dive-sites", destination: diveSites(), statusCode: 301 },
  { source: "/saba-marine-park", destination: diveSites(), statusCode: 301 },

  // Individual dive-site pages → Dive Sites area sections
  { source: "/saba-1-mt-michel", destination: diveSites(diveSiteAnchors.pinnacles), statusCode: 301 },
  { source: "/saba-2-third-encounter", destination: diveSites(diveSiteAnchors.pinnacles), statusCode: 301 },
  { source: "/saba-3-twiwlight-zone", destination: diveSites(diveSiteAnchors.pinnacles), statusCode: 301 },
  { source: "/saba-4-outer-limits", destination: diveSites(diveSiteAnchors.pinnacles), statusCode: 301 },
  { source: "/saba-5-oshark-shoals", destination: diveSites(diveSiteAnchors.pinnacles), statusCode: 301 },
  { source: "/saba-6-diamond-rock", destination: diveSites(diveSiteAnchors.wellsBay), statusCode: 301 },
  { source: "/saba-7-man-owar-shoals", destination: diveSites(diveSiteAnchors.wellsBay), statusCode: 301 },
  { source: "/saba-8-otto-limits", destination: diveSites(diveSiteAnchors.wellsBay), statusCode: 301 },
  { source: "/saba-9-torrens-point", destination: diveSites(diveSiteAnchors.wellsBay), statusCode: 301 },
  { source: "/saba-10-coral-nursery", destination: diveSites(), statusCode: 301 },
  { source: "/saba-11-customs-house", destination: diveSites(diveSiteAnchors.ladderBay), statusCode: 301 },
  { source: "/saba-12-porites-point", destination: diveSites(diveSiteAnchors.ladderBay), statusCode: 301 },
  { source: "/saba-13-babylon", destination: diveSites(diveSiteAnchors.ladderBay), statusCode: 301 },
  { source: "/saba-14-ladder-labyrinth", destination: diveSites(diveSiteAnchors.ladderBay), statusCode: 301 },
  { source: "/saba-15-50-50", destination: diveSites(diveSiteAnchors.ladderBay), statusCode: 301 },
  { source: "/saba-16-hot-springs", destination: diveSites(diveSiteAnchors.ladderBay), statusCode: 301 },
  { source: "/saba-17-rays-n-anchors", destination: diveSites(diveSiteAnchors.ladderBay), statusCode: 301 },
  { source: "/saba-18-tedran-wall", destination: diveSites(diveSiteAnchors.tentReef), statusCode: 301 },
  { source: "/saba-19-tent-reef-wall", destination: diveSites(diveSiteAnchors.tentReef), statusCode: 301 },
  { source: "/saba-20-tent-reef", destination: diveSites(diveSiteAnchors.tentReef), statusCode: 301 },
  { source: "/saba-21-tent-reef-shallow", destination: diveSites(diveSiteAnchors.tentReef), statusCode: 301 },
  { source: "/saba-22-tent-reef-deep", destination: diveSites(diveSiteAnchors.tentReef), statusCode: 301 },
  { source: "/saba-23-mooring-muck-dive", destination: diveSites(), statusCode: 301 },
  { source: "/saba-24-greer-gut", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },
  { source: "/saba-25-big-rock-market", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },
  { source: "/saba-26-big-rock-deep", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },
  { source: "/saba-27-hole-in-the-corner", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },
  { source: "/saba-28-davids-dropoff", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },
  { source: "/saba-29-core-gut", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },
  { source: "/saba-30-cove-bay", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },
  { source: "/saba-31-green-island", destination: diveSites(diveSiteAnchors.windwardside), statusCode: 301 },

  // Diving — experiences / operations / safety
  { source: "/sabas-best-dive-boats", destination: diving(), statusCode: 301 },
  { source: "/dive-nitrox-with-sea-saba", destination: diving(divingAnchors.nitrox), statusCode: 301 },
  // /certified-pure covers compressor/air quality + Nitrox; the Nitrox section has that language
  { source: "/certified-pure", destination: diving(divingAnchors.nitrox), statusCode: 301 },
  { source: "/dan-report", destination: diving(divingAnchors.altitudeFlying), statusCode: 301 },
  { source: "/concerning-altitude", destination: diving(divingAnchors.altitudeFlying), statusCode: 301 },
  { source: "/post/diving-into-the-future-with-fin-tonic-and-shark-bait", destination: diving(), statusCode: 301 },

  // Courses / training
  { source: "/dive-training-courses", destination: "/courses", statusCode: 301 },
  { source: "/training-beginners", destination: "/courses", statusCode: 301 },
  { source: "/training-the-next-step", destination: "/courses", statusCode: 301 },
  { source: "/childrens-scuba", destination: "/courses", statusCode: 301 },

  // Plan your trip cluster
  { source: "/travelling-to-saba", destination: planYourTrip(planYourTripAnchors.gettingHere), statusCode: 301 },
  { source: "/sailing-to-saba", destination: planYourTrip(planYourTripAnchors.gettingHere), statusCode: 301 },
  { source: "/where-to-stay", destination: planYourTrip(planYourTripAnchors.whereToStay), statusCode: 301 },
  { source: "/cottage-andhouse-rentals", destination: planYourTrip(planYourTripAnchors.whereToStay), statusCode: 301 },
  { source: "/saba-restaurants", destination: planYourTrip(planYourTripAnchors.restaurants), statusCode: 301 },
  { source: "/hiking-on-saba", destination: planYourTrip(planYourTripAnchors.hiking), statusCode: 301 },
  { source: "/the-island-of-saba", destination: planYourTrip(planYourTripAnchors.history), statusCode: 301 },
  { source: "/saba-history", destination: planYourTrip(planYourTripAnchors.history), statusCode: 301 },
  { source: "/saba-sunset-cruise", destination: planYourTrip(planYourTripAnchors.experiences), statusCode: 301 },
  { source: "/snorkeling-saba", destination: planYourTrip(planYourTripAnchors.experiences), statusCode: 301 },
  { source: "/seasaba-faqs", destination: planYourTrip(planYourTripAnchors.faq), statusCode: 301 },

  // Partners / blog (the /partners page lists Sea & Learn)
  { source: "/post/join-sea-learn-field-projects-with-sea-saba-october-2023", destination: "/partners", statusCode: 301 },
  { source: "/seasaba-blog", destination: "/partners", statusCode: 301 },

  // Retail (no retail catalog in the new IA) → Contact (visit/location info)
  { source: "/dive-shop-on-saba", destination: "/contact", statusCode: 301 },

  // Wix social shortcut pages → external profiles
  { source: "/youtube", destination: "https://youtube.com/@sea_saba", statusCode: 301, basePath: false },
  { source: "/facebook", destination: "https://www.facebook.com/sea.saba/", statusCode: 301, basePath: false },
  { source: "/instagram", destination: "https://www.instagram.com/seasaba/", statusCode: 301, basePath: false },
  { source: "/tripadvisor", destination: "https://www.tripadvisor.com/Attraction_Review-g147337-d1206831-Reviews-Sea_Saba_Dive_Center-Windwardside_Saba.html", statusCode: 301, basePath: false },

  // --- Manual review (no suitable destination yet) ---
  // /post/oxe-marine-technician-training — leave as 404 pending a news/resources page
  // /dive-log — now a live route with an identical slug, so no redirect is needed.
];
