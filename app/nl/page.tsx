import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { canServeNlRoute } from "@/content/nl";
import { NlHome, nlMetadata } from "@/content/nl/home";

export const metadata = createMetadata({
  ...nlMetadata,
  path: "/",
  locale: "nl",
  noIndex: true,
});

export default function DutchHomePage() {
  if (!canServeNlRoute("/")) notFound();
  return <NlHome />;
}
