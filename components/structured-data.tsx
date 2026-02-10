import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Saba",
      addressCountry: "BQ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.63,
      longitude: -63.24,
    },
    priceRange: "$$",
    image: `${SITE_URL}/images/og-image.jpg`,
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
