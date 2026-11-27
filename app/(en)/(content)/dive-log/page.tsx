import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { DiveLogClient } from "@/components/dive-log-client";
import { loadPublicDives, type PublicDive } from "@/lib/firestore/dive-log";
import {
  diveLogDefaultStartDate,
  isPublicDivingApiEnabled,
  loadPublicDivesFromApi,
} from "@/lib/public-diving/client";

export const metadata = createMetadata({
  title: "Sea Saba Dive Log",
  description:
    "Explore recent Sea Saba dives, sightings, dive sites, boats, and guides, and start building your own Saba dive log.",
  path: "/dive-log",
});

// Revalidate hourly — dive entries are appended at most daily, so an
// hour-stale page is fresh enough for both visitors and crawlers while
// keeping Firestore reads off the request path.
export const revalidate = 3600;

export default async function DiveLogPage() {
  // No searchParams access here — reading it would opt the route out of
  // static generation and run Firestore reads on every request. The
  // `?site=` deep-link filter is applied client-side instead.
  // Server-render the dive list so real recent dives are in the initial
  // HTML (issue #108). On failure, production serving and every other
  // phase behave differently by design:
  //   - Build (`next build` sets NEXT_PHASE) and development: there is no
  //     previous page to preserve, so a failed/empty fetch still renders
  //     the client-fetch fallback shell — the build must succeed, dev
  //     shouldn't error on missing credentials, and the shell self-heals
  //     in the browser.
  //   - Production serving (ISR regeneration): throwing keeps the last
  //     successfully generated page in the ISR cache instead of replacing
  //     a good page with a degraded shell — Next.js serves the cached
  //     page and retries revalidation on the next request. An empty
  //     payload is treated the same: Firestore can resolve an empty
  //     snapshot when its backend is unreachable, and a genuine
  //     "zero dives" dataset does not exist in production.
  //     Trade-off, accepted: an on-demand generation with no cached page
  //     (e.g. cache purge + simultaneous Firestore outage) surfaces an
  //     error rather than the graceful shell.
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";
  const preserveCachedPage =
    !isBuildTime && process.env.NODE_ENV === "production";
  // PUBLIC_DIVING_API_BASE_URL commissions the seasaba.app public API
  // (issue #325); unset keeps the direct Firestore read. In API mode a 200
  // with no dives is a genuine empty result (per the v1 contract), and the
  // browser never falls back to Firestore. Only the default 14-day range is
  // fetched here; wider ranges load on demand via ./actions.
  const source = isPublicDivingApiEnabled() ? "api" : "firestore";
  let initialDives: PublicDive[] | undefined;
  let generatedAt: number | undefined;
  try {
    const result = await (source === "api"
      ? loadPublicDivesFromApi({ startDate: diveLogDefaultStartDate() })
      : loadPublicDives());
    if (result.dives.length > 0 || source === "api") {
      initialDives = result.dives;
      generatedAt = result.generatedAt;
    } else if (preserveCachedPage) {
      throw new Error("Dive log fetch returned no dives");
    }
  } catch (err) {
    if (preserveCachedPage) throw err;
    console.error("Dive log server fetch failed, falling back to client fetch", err);
  }

  return (
    <>
      <DiveLogClient
        initialDives={initialDives}
        generatedAt={generatedAt}
        source={source}
      />
      {/* Without JS the client component sits on its loading state forever
          — say so and offer a real next step instead (issue #209). When the
          server fetch succeeded, no-JS visitors see the static list anyway,
          so the notice is only needed on the client-fetch path. */}
      {!initialDives && (
        <noscript>
          <p className="mx-auto max-w-md px-4 pb-10 text-center text-sm text-muted-foreground">
            Recent dive activity needs JavaScript to load. You can still{" "}
            <Link
              href="/dive-sites"
              className="font-medium text-primary underline underline-offset-2 hover:underline"
            >
              browse our dive sites
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-medium text-primary underline underline-offset-2 hover:underline"
            >
              ask us about a recent trip
            </Link>
            .
          </p>
        </noscript>
      )}
    </>
  );
}
