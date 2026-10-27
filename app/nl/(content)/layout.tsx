import { Breadcrumbs } from "@/components/breadcrumbs";

// Mirrors app/(en)/(content)/layout.tsx — the shared centered content grid
// (max-w-6xl, px-4/6/8, prose) plus breadcrumbs, localized for /nl.
export default function DutchContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <Breadcrumbs locale="nl" />
      <article className="prose prose-slate max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>p]:max-w-3xl">{children}</article>
    </div>
  );
}
