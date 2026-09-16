/**
 * Canonical operational facts for the public website.
 *
 * This module is the single source of truth for customer-facing operational
 * values that appear in more than one place: product schedules, certification
 * requirements, group-size limits, contact-inquiry routing, and the Checkfront
 * item registry. See docs/OPERATIONS.md for the update procedure, the
 * Checkfront boundary, and what is deliberately left page-specific.
 *
 * Facts live here; prose stays in the pages. Change a value once and every
 * surface follows — a new departure time must never require editing three
 * files by hand.
 */

/** Business-level facts that must stay identical wherever they appear. */
export const OPERATIONS = {
  /** First year of continuous operation — used by About and Diving. */
  establishedYear: 1985,
  /**
   * Maximum divers per guide on recreational guided dives (owner-confirmed
   * scope). Course ratios are course-specific and live on the courses page.
   */
  maxRecreationalDiversPerGuide: 8,
  /** Complimentary enriched-air blend for certified Nitrox divers. */
  nitroxBlend: "32%",
  /** Every dive trip departs from and returns to Fort Bay Harbor. */
  harbor: "Fort Bay Harbor",
} as const;

// --- Bookable products -------------------------------------------------------

export interface ProductSchedule {
  /** Complimentary taxi pickup from the guest's accommodation. */
  taxiPickup: string;
  /** Boat departure from Fort Bay Harbor. */
  departure: string;
  /** Approximate return to Fort Bay Harbor. */
  returns: string;
}

export interface DiveProduct {
  /**
   * Public slug used in `/book?item=<slug>` deep links and analytics.
   * Renaming a slug changes the public URL contract — check data/redirects.ts
   * and every `/book?item=` link before doing so.
   */
  slug: string;
  /** Canonical customer-facing product name. */
  name: string;
  /** Checkfront item id. Checkfront owns live inventory and pricing. */
  checkfrontItemId: string;
  /**
   * Checkfront category id, used when the item can only be reached through a
   * category selection (the private charter has no direct item link).
   */
  checkfrontCategoryId?: string;
  schedule?: ProductSchedule;
  /** Number of dives; undefined for surface/charter products. */
  dives?: number;
  /** Minimum certification/experience requirement, customer-facing. */
  requirement?: string;
  /** Nitrox policy for this product. */
  nitrox?: "included" | "required-first-dive";
  /** Group-size note, e.g. private charter capacity. */
  capacity?: string;
}

export const DIVE_PRODUCTS = {
  classic: {
    slug: "classic",
    name: "Classic 2-Tank Dive",
    checkfrontItemId: "244",
    schedule: { taxiPickup: "10:00 AM", departure: "10:30 AM", returns: "3:00 PM" },
    dives: 2,
    // Minimum certification is deliberately NOT canonicalized: the
    // "Scuba Diver minimum" copy stays on the diving page pending owner
    // confirmation (see docs/OPERATIONS.md).
    nitrox: "included",
  },
  advanced: {
    slug: "advanced",
    name: "Advanced 2-Tank Dive",
    checkfrontItemId: "243",
    schedule: { taxiPickup: "8:30 AM", departure: "9:00 AM", returns: "1:00 PM" },
    dives: 2,
    // Owner-confirmed eligibility rule.
    requirement: "AOW + 20 logged dives OR OW + 50 logged dives",
    nitrox: "required-first-dive",
  },
  afternoon: {
    slug: "afternoon",
    name: "Afternoon 1-Tank Dive",
    checkfrontItemId: "245",
    schedule: { taxiPickup: "12:30 PM", departure: "1:00 PM", returns: "3:00 PM" },
    dives: 1,
    // Minimum certification is deliberately NOT canonicalized — same
    // "Scuba Diver minimum" pending owner confirmation as classic.
  },
  snorkel: {
    slug: "snorkel",
    name: "Afternoon Snorkel Trip",
    checkfrontItemId: "246",
    schedule: { taxiPickup: "12:30 PM", departure: "1:00 PM", returns: "3:00 PM" },
    requirement: "Comfortable swimmers — unguided",
  },
  private: {
    slug: "private",
    name: "Private Charter",
    checkfrontItemId: "254",
    checkfrontCategoryId: "49",
    capacity: "Up to 8 guests",
  },
} as const satisfies Record<string, DiveProduct>;

export type DiveProductSlug = keyof typeof DIVE_PRODUCTS;

/** `/book?item=<slug>` deep link for a marketed product. */
export function bookingHref(slug: DiveProductSlug): string {
  return `/book?item=${slug}`;
}

/**
 * Checkfront items that exist in the booking inventory but are not marketed
 * as standalone products on the diving page. Names are shown by the booking
 * widget's preselection banner. Checkfront owns this inventory; keep in sync
 * when items are added or renamed there.
 */
export const CHECKFRONT_EXTRA_ITEMS: Record<string, string> = {
  "248": "Shore Diving (Tent Reef)",
  "253": "Nitrox Upgrade",
  "249": "Dive Packages",
};

// --- Contact-inquiry routing -------------------------------------------------

export interface InquiryType {
  /** Slug accepted by `/contact?interest=<value>`. */
  value: string;
  /** Option label in the contact form. */
  label: string;
  /** Email subject / page headline when the inquiry is preselected. */
  subject: string;
  group: "courses" | "general";
}

/**
 * Every `/contact?interest=` link on the site must resolve to a value here —
 * the contact form ignores unknown values, so a missing entry is a silently
 * broken link. Course entries are linked from app/(content)/courses/page.tsx;
 * general entries from plan-your-trip and elsewhere.
 */
export const INQUIRY_TYPES: readonly InquiryType[] = [
  { value: "try-scuba", label: "Try Scuba", subject: "Try Scuba Inquiry", group: "courses" },
  { value: "sdi-open-water", label: "SDI Open Water Diver", subject: "SDI Open Water Diver Inquiry", group: "courses" },
  { value: "sdi-advanced-specialty", label: "SDI Advanced & Specialty Training", subject: "SDI Advanced & Specialty Training Inquiry", group: "courses" },
  { value: "sdi-nitrox", label: "SDI Nitrox Diver", subject: "SDI Nitrox Diver Inquiry", group: "courses" },
  { value: "sdi-rescue", label: "SDI Rescue Diver", subject: "SDI Rescue Diver Inquiry", group: "courses" },
  { value: "sdi-divemaster", label: "SDI Divemaster", subject: "SDI Divemaster Inquiry", group: "courses" },
  { value: "tdi-technical", label: "TDI Technical Diving", subject: "TDI Technical Diving Inquiry", group: "courses" },
  { value: "general", label: "General Question", subject: "General Question", group: "general" },
  { value: "book-diving", label: "Book Diving", subject: "Book Diving Inquiry", group: "general" },
  { value: "course-inquiry", label: "Course Inquiry", subject: "Course Inquiry", group: "general" },
  { value: "private-charter", label: "Private Charter", subject: "Private Charter Inquiry", group: "general" },
  { value: "group-travel", label: "Group Travel", subject: "Group Travel Inquiry", group: "general" },
  { value: "sunset-cruise", label: "Sunset Cruise", subject: "Sunset Cruise Inquiry", group: "general" },
  { value: "saba-lace", label: "Saba Lace", subject: "Saba Lace Inquiry", group: "general" },
  { value: "jewelry-making", label: "Jewelry Making", subject: "Jewelry Making Inquiry", group: "general" },
  { value: "glass-art", label: "Glass Art", subject: "Glass Art Inquiry", group: "general" },
  { value: "transportation", label: "Transportation", subject: "Transportation Inquiry", group: "general" },
  { value: "other", label: "Other", subject: "Other Inquiry", group: "general" },
] as const;

export const COURSE_INQUIRIES = INQUIRY_TYPES.filter((i) => i.group === "courses");
export const GENERAL_INQUIRIES = INQUIRY_TYPES.filter((i) => i.group === "general");

/** Look up an inquiry type by its `?interest=` slug. */
export function inquiryFor(value: string | undefined): InquiryType | undefined {
  return INQUIRY_TYPES.find((i) => i.value === value);
}
