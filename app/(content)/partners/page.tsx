import { createMetadata } from "@/lib/metadata";
import { UnderConstruction } from "@/components/under-construction";

export const metadata = createMetadata({
  title: "Recommended Partners",
  description:
    "Trusted Sea Saba partners for accommodations, transportation, restaurants, activities, dive operators, training agencies, equipment brands, travel organizers, and conservation.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <UnderConstruction
      title="Recommended Partners — Coming Soon"
      message="We are finalizing our curated list of recommended partners. This section will be available shortly."
    />
  );
}
