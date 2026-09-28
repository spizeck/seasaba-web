import {
  DRAFTED_ROUTES,
  isDraftPreviewEnabled,
  isRoutePublished,
  type TranslationReview,
} from "@/lib/locale";
import * as book from "./book";
import * as contact from "./contact";
import * as courses from "./courses";
import * as diving from "./diving";
import * as home from "./home";
import * as planYourTrip from "./plan-your-trip";

interface NlRouteModule {
  review: TranslationReview;
}

/**
 * Registry of Dutch content modules by canonical English path (#151). Every
 * entry in `DRAFTED_ROUTES.nl` must map to a module here — a unit test
 * asserts the two lists stay in sync.
 */
export const NL_CONTENT: Record<string, NlRouteModule> = {
  "/": home,
  "/diving": diving,
  "/plan-your-trip": planYourTrip,
  "/courses": courses,
  "/contact": contact,
  "/book": book,
};

/**
 * Whether `/nl<routePath>` may render. Production serves a Dutch route only
 * once it appears in `PUBLISHED_ROUTES.nl` (human approval is a prerequisite
 * for that listing); draft preview builds additionally serve routes that have
 * a content module. Draft routes are therefore never reachable in production.
 */
export function canServeNlRoute(routePath: string): boolean {
  return (
    isRoutePublished("nl", routePath) ||
    (isDraftPreviewEnabled() &&
      DRAFTED_ROUTES.nl.includes(routePath) &&
      routePath in NL_CONTENT)
  );
}
