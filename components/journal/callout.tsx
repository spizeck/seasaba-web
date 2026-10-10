import type { ReactNode } from "react";

/**
 * JournalCallout — a quiet "good to know"-style aside for article bodies.
 * Restrained left-border treatment matching the site's blockquote language;
 * semantically an <aside> so it sits outside the main reading flow.
 */
export function JournalCallout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="not-prose my-8 rounded-lg border border-border/50 border-l-2 border-l-primary/60 bg-muted/20 px-5 py-4">
      {title && (
        <p className="text-sm font-semibold text-foreground">{title}</p>
      )}
      <div className="mt-1 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </aside>
  );
}
