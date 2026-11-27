import { isValidElement, type ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
export { JsonLd, BreadcrumbListJsonLd } from "@/components/json-ld";
import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  CONTACT,
  OG_IMAGE,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { OPERATIONS } from "@/data/operations";
import {
  teamMemberDisplayName,
  teamMemberEntityId,
  teamMemberProfileUrl,
  type ProfiledTeamMember,
} from "@/data/team";

/** Stable entity identifier — lets other schema nodes reference the business. */
export const BUSINESS_ID = `${SITE_URL}/#business`;

/**
 * Flatten a rendered answer (strings, interpolated values, nested elements
 * like <Link>) into the plain text schema.org expects for e.g.
 * FAQPage.acceptedAnswer.text. Keeps JSON-LD derived from the same copy the
 * visitor reads — no duplicated plain-text answers that can drift.
 */
export function jsxToText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(jsxToText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return jsxToText(node.props.children);
  }
  return "";
}

/** schema.org Person derived from the canonical staff record. */
export function personJsonLd(member: ProfiledTeamMember): Record<string, unknown> {
  return {
    "@type": "Person",
    "@id": teamMemberEntityId(member),
    name: teamMemberDisplayName(member),
    jobTitle: member.title,
    description: member.bio,
    url: teamMemberProfileUrl(member),
    ...(member.image && { image: `${SITE_URL}${member.image}` }),
    worksFor: { "@id": BUSINESS_ID },
    ...(member.externalLinks?.length && {
      sameAs: member.externalLinks.map((link) => link.href),
    }),
    ...(member.languages && { knowsLanguage: member.languages }),
  };
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
