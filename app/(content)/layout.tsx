import { Breadcrumbs } from "@/components/breadcrumbs";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumbs />
      <article className="prose prose-slate max-w-none dark:prose-invert [&>*:first-child]:mt-0">{children}</article>
    </div>
  );
}
