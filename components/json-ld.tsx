import { SITE_URL } from "@/lib/constants";

/**
 * Render a JSON-LD block. `data` is a plain schema.org object; callers pass
 * `@context` themselves so each block is self-contained.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** schema.org BreadcrumbList matching the visible breadcrumb trail. */
export function BreadcrumbListJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  if (items.length === 0) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
  return <JsonLd data={jsonLd} />;
}
