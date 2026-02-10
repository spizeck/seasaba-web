import { createMetadata } from "@/lib/metadata";
import SampleContent from "@/content/sample.mdx";

export const metadata = createMetadata({
  title: "Your First Dive in Saba",
  description:
    "What to expect on your first scuba dive in Saba. Preparation tips, dive site previews, and what you'll see underwater in the Dutch Caribbean.",
  path: "/diving/first-dive",
});

export default function FirstDivePage() {
  return <SampleContent />;
}
