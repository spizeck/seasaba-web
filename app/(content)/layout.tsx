import { Breadcrumbs } from "@/components/breadcrumbs";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs />
      <article className="prose prose-slate max-w-none dark:prose-invert">{children}</article>
    </div>
  );
}
