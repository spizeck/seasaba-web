import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  CONTACT,
  OG_IMAGE,
  SOCIAL_LINKS,
} from "@/lib/constants";

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: CONTACT.phoneHref.replace("tel:", ""),
    email: CONTACT.email,
    foundingDate: "1985",
    address: {
      "@type": "PostalAddress",
      streetAddress: "66 Fort Bay Harbor",
      addressLocality: "The Bottom",
      addressRegion: "Saba",
      addressCountry: "BQ",
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
