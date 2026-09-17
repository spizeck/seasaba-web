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
  /**
   * Time taxi pickups BEGIN — guests must be ready by this time. Actual
   * taxi arrival varies with the route and pickup order; this is not a
   * guaranteed per-guest pickup time.
   */
  taxiPickup: string;
  /** Boat departure from Fort Bay Harbor. */
  departure: string;
  /** Approximate return to Fort Bay Harbor. */
  returns: string;
}

export interface BookableProduct {
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
  /** Number of dives; undefined for surface/charter/cruise products. */
  dives?: number;
  /**
   * Which dives of the shared daily schedule the product covers. The boat
   * day runs three dives — Dive 1 (early, deepest), Dive 2 (late morning),
   * and Dive 3 (afternoon). Advanced and Classic overlap on Dive 2; Classic
   * and the Afternoon dive share Dive 3, so mixed-experience partners can
   * dive together when booking different products (owner-confirmed).
   */
  diveSlots?: readonly number[];
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
    diveSlots: [2, 3],
    // Eligibility is deliberately NOT a `requirement`: Scuba
    // Diver-certified guests may join with no logged-dive minimum but
    // require a private guide (owner-confirmed — see docs/OPERATIONS.md).
    // A single requirement string would imply they can join the normal
    // guided group autonomously.
    nitrox: "included",
  },
  advanced: {
    slug: "advanced",
    name: "Advanced 2-Tank Dive",
    checkfrontItemId: "243",
    schedule: { taxiPickup: "8:30 AM", departure: "9:00 AM", returns: "1:00 PM" },
    dives: 2,
    diveSlots: [1, 2],
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
    diveSlots: [3],
    // Eligibility is deliberately NOT a `requirement` — same
    // owner-confirmed private-guide rule as classic (see docs/OPERATIONS.md).
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
} as const satisfies Record<string, BookableProduct>;

/**
 * Bookable non-dive products. Same model as `DIVE_PRODUCTS` — these are
 * experiences customers book directly, just not dive trips. Item ids are
 * owner-confirmed Checkfront inventory.
 */
export const CRUISE_PRODUCTS = {
  "sunset-cruise": {
    slug: "sunset-cruise",
    name: "Shared Sunset Cruise",
    checkfrontItemId: "247",
  },
  "private-sunset-cruise": {
    slug: "private-sunset-cruise",
    name: "Private Sunset Cruise",
    checkfrontItemId: "328",
  },
} as const satisfies Record<string, BookableProduct>;

/** Every marketed product resolvable by `/book?item=<slug>`. */
export const BOOKABLE_PRODUCTS = {
  ...DIVE_PRODUCTS,
  ...CRUISE_PRODUCTS,
} as const;

export type BookableProductSlug = keyof typeof BOOKABLE_PRODUCTS;

/** `/book?item=<slug>` deep link for a marketed product. */
export function bookingHref(slug: BookableProductSlug): string {
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

/**
 * Full Checkfront inventory list shown when no item is preselected.
 * Checkfront owns this set — update it when items are added or removed there.
 * Also the allowlist for numeric `/book?item=<id>` passthrough values.
 */
export const CHECKFRONT_ALL_ITEM_IDS =
  "245,244,243,246,247,248,253,249,254,328";

const KNOWN_ITEM_IDS = new Set(CHECKFRONT_ALL_ITEM_IDS.split(","));

export interface ResolvedBookingItem {
  /** Checkfront item id when the `?item=` value maps to real inventory. */
  itemId: string | null;
  /** True when `?item=` was supplied but matches no slug or known item id. */
  unknown: boolean;
}

/**
 * Resolve a `/book?item=` value to a Checkfront item id. Accepts marketed
 * slugs (`classic`) and numeric ids that exist in the Checkfront inventory
 * (`248`). Anything else is rejected rather than handed to Checkfront as a
 * bogus item id — the widget falls back to the full inventory with a notice.
 */
export function resolveBookingItem(item: string | undefined): ResolvedBookingItem {
  if (!item) return { itemId: null, unknown: false };
  const product = Object.values(BOOKABLE_PRODUCTS).find(
    (p) => p.slug === item
  );
  if (product) return { itemId: product.checkfrontItemId, unknown: false };
  if (KNOWN_ITEM_IDS.has(item)) return { itemId: item, unknown: false };
  return { itemId: null, unknown: true };
}

// --- Contact-inquiry routing -------------------------------------------------

/**
 * Optional contextual fields the contact form can reveal for an inquiry.
 * "whatsapp" is the visitor's WhatsApp number (Respond.io is WhatsApp-first);
 * "partySize" is divers/students/guests depending on `partyLabel`.
 */
export type ContactField =
  | "whatsapp"
  | "dates"
  | "partySize"
  | "certification"
  | "loggedDives";

export interface InquiryType {
  /** Slug accepted by `/contact?interest=<value>`. */
  value: string;
  /** Option label in the contact form. */
  label: string;
  /** Email subject / page headline when the inquiry is preselected. */
  subject: string;
  group: "courses" | "general";
  /**
   * Contextual fields worth asking for this inquiry. The form renders only
   * these after the core fields; hidden fields are cleared and never
   * submitted. Ordered as displayed.
   */
  fields: readonly ContactField[];
  /** Label for the party-size field when `fields` includes "partySize". */
  partyLabel?: string;
}

/**
 * Every `/contact?interest=` link on the site must resolve to a value here —
 * the contact form ignores unknown values, so a missing entry is a silently
 * broken link. Course entries are linked from app/(content)/courses/page.tsx;
 * general entries from plan-your-trip and elsewhere.
 *
 * `fields` drives progressive disclosure in the contact form: entry-level
 * offerings (Try Scuba, Open Water) never ask certification/experience;
 * scuba-specific fields stay off non-diving inquiries entirely.
 */
export const INQUIRY_TYPES: readonly InquiryType[] = [
  { value: "try-scuba", label: "Try Scuba", subject: "Try Scuba Inquiry", group: "courses",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Number of participants" },
  { value: "sdi-open-water", label: "SDI Open Water Diver", subject: "SDI Open Water Diver Inquiry", group: "courses",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Number of students" },
  { value: "sdi-advanced-specialty", label: "SDI Advanced & Specialty Training", subject: "SDI Advanced & Specialty Training Inquiry", group: "courses",
    fields: ["whatsapp", "dates", "partySize", "certification", "loggedDives"], partyLabel: "Number of students" },
  { value: "sdi-nitrox", label: "SDI Nitrox Diver", subject: "SDI Nitrox Diver Inquiry", group: "courses",
    fields: ["whatsapp", "dates", "partySize", "certification"], partyLabel: "Number of students" },
  { value: "sdi-rescue", label: "SDI Rescue Diver", subject: "SDI Rescue Diver Inquiry", group: "courses",
    fields: ["whatsapp", "dates", "partySize", "certification", "loggedDives"], partyLabel: "Number of students" },
  { value: "sdi-divemaster", label: "SDI Divemaster", subject: "SDI Divemaster Inquiry", group: "courses",
    fields: ["whatsapp", "dates", "partySize", "certification", "loggedDives"], partyLabel: "Number of students" },
  { value: "tdi-technical", label: "TDI Technical Diving", subject: "TDI Technical Diving Inquiry", group: "courses",
    fields: ["whatsapp", "dates", "partySize", "certification", "loggedDives"], partyLabel: "Number of students" },
  { value: "general", label: "General Question", subject: "General Question", group: "general",
    fields: ["whatsapp"] },
  { value: "book-diving", label: "Book Diving", subject: "Book Diving Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize", "certification", "loggedDives"], partyLabel: "Number of divers" },
  { value: "course-inquiry", label: "Course Inquiry", subject: "Course Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize", "certification"], partyLabel: "Number of students" },
  { value: "private-charter", label: "Private Charter", subject: "Private Charter Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Group size" },
  { value: "group-travel", label: "Group Travel", subject: "Group Travel Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Group size" },
  { value: "sunset-cruise", label: "Sunset Cruise", subject: "Sunset Cruise Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Number of guests" },
  { value: "saba-lace", label: "Saba Lace", subject: "Saba Lace Inquiry", group: "general",
    fields: ["whatsapp", "dates"] },
  { value: "jewelry-making", label: "Jewelry Making", subject: "Jewelry Making Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Number of participants" },
  { value: "glass-art", label: "Glass Art", subject: "Glass Art Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Number of participants" },
  { value: "transportation", label: "Transportation", subject: "Transportation Inquiry", group: "general",
    fields: ["whatsapp", "dates", "partySize"], partyLabel: "Group size" },
  { value: "other", label: "Other", subject: "Other Inquiry", group: "general",
    fields: ["whatsapp"] },
] as const;

export const COURSE_INQUIRIES = INQUIRY_TYPES.filter((i) => i.group === "courses");
export const GENERAL_INQUIRIES = INQUIRY_TYPES.filter((i) => i.group === "general");

/** Look up an inquiry type by its `?interest=` slug. */
export function inquiryFor(value: string | undefined): InquiryType | undefined {
  return INQUIRY_TYPES.find((i) => i.value === value);
}
