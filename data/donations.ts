/**
 * Registry of the Saba organizations and causes featured on /donate (#171).
 *
 * STATUS: three recipients — Sea & Learn Foundation and Saba Conservation
 * Foundation from organization-supplied material (September 2026; final
 * card wording pending their review before publication), and Child Focus
 * Foundation added per owner request with owner-supplied copy, logo, and
 * direct bank details (#195).
 *
 * To add a recipient, append one entry here — no page or layout changes are
 * needed. Every entry must be owner-confirmed: name and description come
 * from the organization itself, `website` and `donationUrl` (both optional)
 * must be the recipient's own pages, and `bankDetails` (optional) must be
 * the recipient's own account — never a Sea Saba account. Sea Saba never
 * collects, processes, or retains donations, so there is no checkout or
 * payment field here by design.
 *
 * Fields that must never be guessed: nonprofit/tax status, percentages or
 * fee breakdowns, and any charitable claim. Leave `funds` unset unless the
 * organization itself states what a gift supports.
 */
export type DonationCategory =
  | "conservation"
  | "community"
  | "animals"
  | "youth"
  | "culture"
  | "marine-conservation"
  | "science-education";

/**
 * Direct bank-transfer details, shown on the card when a recipient takes
 * donations by bank transfer instead of (or alongside) a website. Every
 * field is the recipient's own account information — never Sea Saba's —
 * and must come from the organization or owner directly.
 */
export interface DonationBankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  swift: string;
}

interface DonationRecipientBase {
  /** Organization or cause name, as the organization itself styles it. */
  name: string;
  /** One or two sentences on who they are and what they do on Saba. */
  description: string;
  /** Plain-language summary of what a donation helps fund — from the recipient's own materials only. */
  funds?: string;
  /** The organization's own website; doubles as the fallback destination when no donationUrl exists. Omit when the recipient has none. */
  website?: string;
  /** Direct bank-transfer details — the recipient's own account, shown on the card so donors can copy them. */
  bankDetails?: DonationBankDetails;
  /**
   * Direct donation page on the recipient's own site, when one exists.
   * First-party recipient URLs only — never an intermediary and never a
   * Sea Saba checkout (none exists; do not build one). Store the canonical
   * page URL bare, without tracking parameters.
   */
  donationUrl?: string;
  /** Optional grouping label shown as a small pill on the card. */
  category?: DonationCategory;
}

/**
 * Card logo pairing: `image` and `imageAlt` are all-or-nothing. Making the
 * alt text a required field alongside `image` keeps it an explicit
 * editorial/accessibility decision — a future entry cannot compile with a
 * logo and no deliberate alt text, and the renderer never invents one.
 */
type DonationRecipientImage =
  | {
      /** Approved local asset under public/images — never a hotlinked third-party logo. */
      image: string;
      /** Alt text for `image`; required when `image` is set. */
      imageAlt: string;
      /**
       * Optional height override for the card logo (Tailwind height class,
       * default "h-14"). Portrait marks need more height than wide marks to
       * hold comparable visual weight — set only where the default reads
       * small, e.g. "h-20" for a portrait logo.
       */
      imageClassName?: string;
    }
  | {
      image?: undefined;
      imageAlt?: undefined;
      imageClassName?: undefined;
    };

export type DonationRecipient = DonationRecipientBase & DonationRecipientImage;

export const DONATION_RECIPIENTS: DonationRecipient[] = [
  {
    // Sea & Learn Foundation: a year-round foundation, not just the October
    // event. Copy below condenses their supplied description; final wording
    // pending their review. Card uses their supplied horizontal transparent
    // logo; the vertical variant stays in public/images/optimized as an
    // alternate.
    name: "Sea & Learn Foundation",
    description:
      "A year-round foundation running hands-on science, environmental education, youth development, and cultural heritage programs that connect Saba's community with the island's extraordinary natural and cultural resources.",
    funds:
      "Year-round programs on Saba, or a specific Sea & Learn Foundation project the donor chooses.",
    website: "https://www.seaandlearn.org/",
    donationUrl: "https://www.seaandlearn.org/donate",
    category: "science-education",
    image: "/images/optimized/sea-and-learn-foundation-logo-horizontal.webp",
    imageAlt: "Sea & Learn Foundation logo",
  },
  {
    // Saba Conservation Foundation: description covers their full mission
    // on land and at sea — both national parks — per their review request;
    // the "helps fund" line keeps the visitor-donation emphasis on the
    // National Marine Park and coral restoration. Donations go to their
    // own donate page (the direct PayPal URL they also supplied is
    // intentionally not used). Card uses their supplied full-color logo on
    // the light card; the white variant stays in public/images/optimized
    // as an alternate for dark backgrounds.
    name: "Saba Conservation Foundation",
    description:
      "The foundation works to protect and restore Saba's natural environment on land and at sea by managing the Saba National Marine Park and Mt. Scenery National Park.",
    funds:
      "Conservation of Saba's National Marine Park and ongoing projects such as coral restoration.",
    website: "https://sabapark.org/saba-conservation-foundation/",
    donationUrl: "https://sabapark.org/saba-conservation-foundation/donate-support/",
    category: "marine-conservation",
    image: "/images/optimized/saba-conservation-foundation-logo-color.webp",
    imageAlt: "Saba Conservation Foundation logo",
  },
  {
    // Child Focus Foundation: added per owner request (#195) with
    // owner-supplied copy and the provided logo. CFF has no website and
    // takes donations by direct bank transfer, so the card renders their
    // own RBC account details instead of outbound links.
    name: "Child Focus Foundation",
    description:
      "An after-school program dedicated to creating meaningful opportunities for children ages 4-12 on Saba, with educational, recreational, cultural, creative, and sports activities that help children learn, grow, build confidence, and develop positive relationships within their community. Together, we can create opportunities for our children to learn, explore, create, and thrive.",
    funds:
      "The resources, equipment, instructors, and materials that keep these programs active, safe, engaging, and accessible to children after school.",
    bankDetails: {
      accountName: "Child Focus Foundation",
      accountNumber: "8600002172025517",
      bankName: "RBC",
      swift: "RBTTBQSAXXX",
    },
    category: "youth",
    image: "/images/child-focus-foundation-logo.jpg",
    imageAlt: "Child Focus Foundation logo",
    // Portrait mark: the default h-14 reads noticeably smaller than the two
    // wide logos beside it, so it gets a taller slot. The supplied image is
    // untouched — only the displayed height changes.
    imageClassName: "h-24",
  },
];
