import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatePanel } from "@/components/state-panel";
import { JournalCard } from "@/components/journal/article-card";
import {
  JOURNAL_DESCRIPTION,
  JOURNAL_FEED_PATH,
  JOURNAL_NAME,
  articlePath,
  formatJournalDate,
} from "@/lib/journal";
import type { JournalArticle } from "@/data/journal/types";

/**
 * JournalIndex — the /journal editorial index. Newest article gets the
 * lead-story row; the rest flow into the card grid. Purely server-rendered —
 * no client JS.
 */
export function JournalIndex({ articles }: { articles: JournalArticle[] }) {
  const [lead, ...rest] = articles;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <Breadcrumbs />

      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {JOURNAL_NAME}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {JOURNAL_DESCRIPTION}
        </p>
        <p className="mt-3 text-sm">
          <a
            href={JOURNAL_FEED_PATH}
            className="rounded-sm text-muted-foreground underline underline-offset-4 decoration-muted-foreground/40 transition-colors hover:text-foreground focus-ring"
          >
            Subscribe via RSS
          </a>
        </p>
      </header>

      {articles.length === 0 ? (
        <StatePanel
          className="mt-10"
          title="The Journal is just getting started"
          description="No stories are published yet. New writing on diving Saba will appear here."
        >
          <Link
            href="/diving"
            className="mt-4 inline-block rounded-sm text-sm font-medium text-primary underline-offset-2 hover:underline focus-ring"
          >
            Meanwhile, explore diving with Sea Saba
          </Link>
        </StatePanel>
      ) : (
        <>
          {/* Lead story — latest article, editorial feature row */}
          <Link
            href={articlePath(lead)}
            className="group mt-10 grid overflow-hidden rounded-2xl border border-border/50 bg-card transition-card hover:border-primary/25 focus-ring lg:grid-cols-[3fr_2fr]"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-auto lg:min-h-[340px]">
              <Image
                src={lead.hero.src}
                alt={lead.hero.alt}
                fill
                priority
                className="object-cover"
                style={lead.hero.position ? { objectPosition: lead.hero.position } : undefined}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Latest story
                <span className="mx-2 font-normal normal-case tracking-normal text-muted-foreground/70">·</span>
                {lead.category}
                <span className="mx-2 font-normal normal-case tracking-normal text-muted-foreground/70">·</span>
                <time
                  dateTime={lead.publishedAt}
                  className="font-normal normal-case tracking-normal text-muted-foreground"
                >
                  {formatJournalDate(lead.publishedAt)}
                </time>
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                {lead.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {lead.excerpt ?? lead.description}
              </p>
            </div>
          </Link>

          {rest.length > 0 && (
            <section aria-label="More stories" className="mt-12">
              <h2 className="text-xl font-semibold text-foreground">
                More from the Journal
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <JournalCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
