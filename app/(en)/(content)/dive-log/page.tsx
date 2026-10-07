import { createMetadata } from "@/lib/metadata";
import { DiveLogClient } from "@/components/dive-log-client";

export const metadata = createMetadata({
  title: "Sea Saba Dive Log",
  description:
    "Explore recent Sea Saba dives, sightings, dive sites, boats, and guides, and start building your own Saba dive log.",
  path: "/dive-log",
});

export default function DiveLogPage() {
  return (
    <>
      <DiveLogClient />
      {/* Without JS the client component sits on its loading state forever
          — say so and offer a real next step instead (issue #209). */}
      <noscript>
        <p className="mx-auto max-w-md px-4 pb-10 text-center text-sm text-muted-foreground">
          Recent dive activity needs JavaScript to load. You can still{" "}
          <a
            href="/dive-sites"
            className="font-medium text-primary underline underline-offset-2 hover:underline"
          >
            browse our dive sites
          </a>{" "}
          or{" "}
          <a
            href="/contact"
            className="font-medium text-primary underline underline-offset-2 hover:underline"
          >
            ask us about a recent trip
          </a>
          .
        </p>
      </noscript>
    </>
  );
}
