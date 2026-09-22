import { createMetadata } from "@/lib/metadata";
import { DiveLogClient } from "@/components/dive-log-client";

export const metadata = createMetadata({
  title: "Sea Saba Dive Log",
  description:
    "Explore recent Sea Saba dives, sightings, dive sites, boats, and guides, and start building your own Saba dive log.",
  path: "/dive-log",
});

export default function DiveLogPage() {
  return <DiveLogClient />;
}
