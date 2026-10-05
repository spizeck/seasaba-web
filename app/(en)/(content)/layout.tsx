import { Breadcrumbs } from "@/components/breadcrumbs";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <Breadcrumbs />
      <article className="prose prose-slate max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>p]:max-w-3xl">{children}</article>
    </div>
  );
}
