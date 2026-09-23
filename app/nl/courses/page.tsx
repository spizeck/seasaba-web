import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { canServeNlRoute } from "@/content/nl";
import { NlCourses, nlMetadata } from "@/content/nl/courses";

export const metadata = createMetadata({
  ...nlMetadata,
  path: "/courses",
  locale: "nl",
  noIndex: true,
});

export default function DutchCoursesPage() {
  if (!canServeNlRoute("/courses")) notFound();
  return <NlCourses />;
}
