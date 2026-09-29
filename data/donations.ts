/**
 * Registry of the Saba organizations and causes featured on /donate (#171).
 *
 * STATUS: two recipients populated from organization-supplied material
 * (Sea & Learn Foundation and Saba Conservation Foundation, September 2026).
 * Both organizations asked to review the final rendered card wording before
 * publication, so this registry must not go live until the owner confirms
 * each organization has signed off. Until then, entries may be edited in
 * place — do not add placeholder, sample, or unverified entries to make the
 * list look complete, and do not add pending recipients early.
 *
 * To add a recipient, append one entry here — no page or layout changes are
 * needed. Every entry must be owner-confirmed: name, description, and website
 * come from the organization itself, and `donationUrl` (optional) must be the
 * recipient's own donation page. Sea Saba never collects, processes, or
 * retains donations, so there is no checkout or payment field here by design.
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

export interface DonationRecipient {
  /** Organization or cause name, as the organization itself styles it. */
  name: string;
  /** One or two sentences on who they are and what they do on Saba. */
  description: string;
  /** Plain-language summary of what a donation helps fund — from the recipient's own materials only. */
  funds?: string;
  /** The organization's own website — required; doubles as the fallback destination when no donationUrl exists. */
  website: string;
  /**
   * Direct donation page on the recipient's own site, when one exists.
   * First-party recipient URLs only — never an intermediary and never a
   * Sea Saba checkout (none exists; do not build one). Store the canonical
   * page URL bare, without tracking parameters.
   */
  donationUrl?: string;
  /** Optional grouping label shown as a small pill on the card. */
  category?: DonationCategory;
  /** Approved local asset under public/images — never a hotlinked third-party logo. */
  image?: string;
  /** Alt text for `image`; required when `image` is set. */
  imageAlt?: string;
}

export const DONATION_RECIPIENTS: DonationRecipient[] = [
  {
    // Sea & Learn Foundation: a year-round foundation, not just the October
    // event. Copy below condenses their supplied description; final wording
    // pending their review. They supplied a logo and graphic — wire `image`
    // up once the owner drops the files into public/images.
    name: "Sea & Learn Foundation",
    description:
      "A year-round foundation running hands-on science, environmental education, youth development, and cultural heritage programs that connect Saba's community with the island's extraordinary natural and cultural resources.",
    funds:
      "Year-round programs on Saba, or a specific Sea & Learn Foundation project the donor chooses.",
    website: "https://www.seaandlearn.org/",
    donationUrl: "https://www.seaandlearn.org/donate",
    category: "science-education",
  },
  {
    // Saba Conservation Foundation: keep visitor-facing copy on marine
    // conservation per their request — the National Marine Park and coral
    // restoration. Donations go to their own donate page (the direct PayPal
    // URL they also supplied is intentionally not used). Their color logo
    // was supplied — wire `image` up once the owner adds it to
    // public/images.
    name: "Saba Conservation Foundation",
    description:
      "The organization working to protect and restore the beautiful reefs around Saba.",
    funds:
      "Conservation of Saba's National Marine Park and ongoing projects such as coral restoration.",
    website: "https://sabapark.org/saba-conservation-foundation/",
    donationUrl: "https://sabapark.org/saba-conservation-foundation/donate-support/",
    category: "marine-conservation",
  },
];
