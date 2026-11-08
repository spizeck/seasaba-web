import Image from "next/image";
import Link from "next/link";
import type { JournalArticle } from "@/data/journal/types";
import { articlePath, formatJournalDate } from "@/lib/journal";

/**
 * JournalCard — the shared article card for the index grid and the
 * related-articles section. One card = one link (the whole surface is the
 * anchor — no nested interactive elements). Visual language follows
 * ImageCard: rounded-2xl, hairline border, photo-top, no shadows.
 */
export function JournalCard({ article }: { article: JournalArticle }) {
  return (
    <Link
      href={articlePath(article)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background transition-card hover:border-primary/25 focus-ring"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={article.hero.src}
          alt={article.hero.alt}
          fill
          className="object-cover"
          style={article.hero.position ? { objectPosition: article.hero.position } : undefined}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {article.category}
          <span className="mx-2 font-normal normal-case tracking-normal text-muted-foreground/70">·</span>
          <time
            dateTime={article.publishedAt}
            className="font-normal normal-case tracking-normal text-muted-foreground"
          >
            {formatJournalDate(article.publishedAt)}
          </time>
        </p>
        <h3 className="mt-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt ?? article.description}
        </p>
      </div>
    </Link>
  );
}
