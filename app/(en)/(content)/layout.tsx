import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContourLines } from "@/components/contour-lines";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <ContourLines
        corner="top-left"
        seed={15}
        className="left-2 text-primary sm:left-4 lg:left-6 xl:-left-24"
      />
      <div className="relative">
        <Breadcrumbs />
        <article className="prose prose-slate max-w-none dark:prose-invert [&>*:first-child]:mt-0">{children}</article>
      </div>
    </div>
  );
}
