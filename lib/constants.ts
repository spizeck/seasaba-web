export const SITE_NAME = "Sea Saba";
export const SITE_DESCRIPTION =
  "Professional scuba diving in Saba, Dutch Caribbean. Expert-guided dives, certifications, and underwater experiences on one of the Caribbean's best-kept secrets.";
export const SITE_URL = "https://www.seasaba.com";

export const NAV_ITEMS = [
  { label: "Diving", href: "/diving" },
  { label: "Dive Sites", href: "/dive-sites" },
  { label: "Courses", href: "/courses" },
  { label: "Plan Your Trip", href: "/plan-your-trip" },
  { label: "About", href: "/about" },
] as const;

export const BOOKING_URL = "https://seasaba.checkfront.com/reserve/";

export const OG_IMAGE = {
  url: "/images/og-image.jpg",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — Professional Scuba Diving in Saba`,
} as const;

export const CONTACT = {
  phone: "+599 416 2246",
  phoneRaw: "+5994162246",
  phoneHref: "tel:+5994162246",
  whatsapp: "+599 416 2246",
  whatsappHref: "https://wa.me/5994162246",
  email: "info@seasaba.com",
  addressLines: ["66 Fort Bay Harbor", "The Bottom, Saba", "Caribbean Netherlands"],
} as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/seasaba/" },
  { label: "Facebook", href: "https://www.facebook.com/sea.saba/" },
  { label: "YouTube", href: "https://youtube.com/@sea_saba" },
  {
    label: "TripAdvisor",
    href: "https://www.tripadvisor.com/Attraction_Review-g147337-d1206831-Reviews-Sea_Saba_Dive_Center-Windwardside_Saba.html",
  },
  { label: "Google Reviews", href: "https://share.google/WnkPS93TFHU4rCFl9" },
] as const;
