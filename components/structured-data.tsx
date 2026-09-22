import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  CONTACT,
  OG_IMAGE,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { OPERATIONS } from "@/data/operations";

/** Stable entity identifier — lets other schema nodes reference the business. */
export const BUSINESS_ID = `${SITE_URL}/#business`;

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

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    "@id": BUSINESS_ID,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: CONTACT.phoneRaw,
    email: CONTACT.email,
    foundingDate: `${OPERATIONS.establishedYear}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.streetAddress,
      addressLocality: CONTACT.address.addressLocality,
      addressRegion: CONTACT.address.addressRegion,
      addressCountry: CONTACT.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.63,
      longitude: -63.24,
    },
    priceRange: "$$",
    image: `${SITE_URL}${OG_IMAGE.url}`,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * BreadcrumbList matching the visible <Breadcrumbs> trail. Emitted only when
 * the trail has at least one page segment (content pages), so the schema
 * always mirrors what the visitor sees.
 */
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
