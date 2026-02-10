import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "./constants";

interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title: path === "" ? `${SITE_NAME} — ${title}` : `${title} | ${SITE_NAME}`,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
