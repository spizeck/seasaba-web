import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { DiveLogClient } from "@/components/dive-log-client";
import { loadPublicDives, type PublicDive } from "@/lib/firestore/dive-log";

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
  // Server-render the dive list so real recent dives are in the initial
  // HTML (issue #108). If the fetch fails — no credentials, backend
  // unreachable, slow — the client component falls back to fetching in the
  // browser exactly as it did before.
  let initialDives: PublicDive[] | undefined;
  try {
    initialDives = await loadPublicDives();
  } catch (err) {
    console.error("Dive log server fetch failed, falling back to client fetch", err);
  }

  return (
    <>
      <DiveLogClient initialDives={initialDives} />
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
