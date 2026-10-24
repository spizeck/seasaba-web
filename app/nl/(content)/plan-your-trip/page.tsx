import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { canServeNlRoute } from "@/content/nl";
import { NlPlanYourTrip, nlMetadata } from "@/content/nl/plan-your-trip";

export const metadata = createMetadata({
  ...nlMetadata,
  path: "/plan-your-trip",
  locale: "nl",
  noIndex: true,
});

export default function DutchPlanYourTripPage() {
  if (!canServeNlRoute("/plan-your-trip")) notFound();
  return <NlPlanYourTrip />;
}
