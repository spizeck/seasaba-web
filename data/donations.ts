/**
 * Registry of the Saba organizations and causes featured on /donate (#171).
 *
 * STATUS: intentionally empty pending owner-approved content. The public page
 * renders a graceful "list in progress" state while this array is empty — do
 * not add placeholder, sample, or unverified entries to make it look complete.
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
  | "culture";

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
   * Sea Saba checkout (none exists; do not build one).
   */
  donationUrl?: string;
  /** Optional grouping label shown as a small pill on the card. */
  category?: DonationCategory;
  /** Approved local asset under public/images — never a hotlinked third-party logo. */
  image?: string;
  /** Alt text for `image`; required when `image` is set. */
  imageAlt?: string;
}

export const DONATION_RECIPIENTS: DonationRecipient[] = [];
