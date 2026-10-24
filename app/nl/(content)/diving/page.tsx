import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { canServeNlRoute } from "@/content/nl";
import { NlDiving, nlMetadata } from "@/content/nl/diving";

export const metadata = createMetadata({
  ...nlMetadata,
  path: "/diving",
  locale: "nl",
  noIndex: true,
});

export default function DutchDivingPage() {
  if (!canServeNlRoute("/diving")) notFound();
  return <NlDiving />;
}
