import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/structured-data";
import { JournalCard } from "@/components/journal/article-card";
import { InlineImage } from "@/components/inline-image";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";
import {
  JOURNAL_FEED_PATH,
  JOURNAL_NAME,
  JOURNAL_PATH,
  articleJsonLd,
  articlePath,
  formatJournalDate,
  getArticle,
  getRelatedArticles,
  listArticles,
} from "@/lib/journal";

interface JournalArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** Only registry articles resolve — any other slug is a genuine 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return listArticles().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return createMetadata({
    title: `${article.title} — ${JOURNAL_NAME}`,
    description: article.description,
    path: articlePath(article),
    ogType: "article",
    ogImage: { url: article.hero.src, alt: article.hero.alt },
    article: {
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      section: article.category,
      authors: [article.author.name],
    },
    rss: JOURNAL_FEED_PATH,
  });
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Journal", href: JOURNAL_PATH },
          { label: article.title, href: articlePath(article) },
        ]}
      />
      <JsonLd data={articleJsonLd(article)} />

      <article>
        <header className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {article.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {article.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>
              By{" "}
              <span className="font-medium text-foreground">
                {article.author.name}
              </span>
              {article.author.role ? `, ${article.author.role}` : ""}
            </span>
            <span aria-hidden="true" className="text-muted-foreground/50">·</span>
            <span>
              Published{" "}
              <time dateTime={article.publishedAt}>
                {formatJournalDate(article.publishedAt)}
              </time>
            </span>
            {article.updatedAt && (
              <>
                <span aria-hidden="true" className="text-muted-foreground/50">·</span>
                <span>
                  Updated{" "}
                  <time dateTime={article.updatedAt}>
                    {formatJournalDate(article.updatedAt)}
                  </time>
                </span>
              </>
            )}
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-4xl">
          <InlineImage
            src={article.hero.src}
            alt={article.hero.alt}
            aspectRatio="16/9"
            objectPosition={article.hero.position ?? "center"}
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          {article.demo && (
            <p className="not-prose mb-8 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-xs italic leading-relaxed text-muted-foreground">
              Demonstration article — placeholder copy shipped with the
              Journal foundation to exercise layout and metadata, not a
              published Sea Saba story.
            </p>
          )}
          <div className="prose prose-slate max-w-none dark:prose-invert [&>*:first-child]:mt-0">
            {article.body}
          </div>

          {article.cta && (
            <div className="mt-12 flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-muted/20 px-5 py-4">
              <p className="text-sm text-muted-foreground">Keep exploring</p>
              <Button asChild variant="outline" size="sm">
                <Link href={article.cta.href}>{article.cta.label}</Link>
              </Button>
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section aria-label="More from the Journal" className="mt-16">
          <h2 className="text-xl font-semibold text-foreground">
            More from the Journal
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <JournalCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
