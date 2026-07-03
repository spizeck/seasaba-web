import { createMetadata } from "@/lib/metadata";
import { UnderConstruction } from "@/components/under-construction";

export const metadata = createMetadata({
  title: "Sea Saba Dive Log",
  description:
    "Explore recent Sea Saba dives, sightings, dive sites, boats, and guides, and start building your own Saba dive log.",
  path: "/dive-log",
});

export default function DiveLogPage() {
  return (
    <UnderConstruction
      title="Dive Log — Coming Soon"
      message="We are building a new dive log experience. Check back soon to explore recent dives, sightings, and your own Saba dive history."
    />
  );
}
