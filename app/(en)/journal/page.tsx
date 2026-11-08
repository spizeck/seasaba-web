import { createMetadata } from "@/lib/metadata";
import {
  JOURNAL_DESCRIPTION,
  JOURNAL_FEED_PATH,
  JOURNAL_NAME,
  JOURNAL_PATH,
  listArticles,
} from "@/lib/journal";
import { JournalIndex } from "@/components/journal/journal-index";

export const metadata = createMetadata({
  title: JOURNAL_NAME,
  description: JOURNAL_DESCRIPTION,
  path: JOURNAL_PATH,
  rss: JOURNAL_FEED_PATH,
});

export default function JournalPage() {
  return <JournalIndex articles={listArticles()} />;
}
