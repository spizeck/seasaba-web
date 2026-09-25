/**
 * Sea Saba community-giving program — the "Request Support from Sea Saba"
 * half of /donate (#171). The visitor-donation registry stays in
 * data/donations.ts; this file is the other direction: local organizations
 * and project leads asking Sea Saba for help.
 *
 * CONTENT STATUS: DRAFT pending owner review. Categories, support types,
 * standards, and process wording below are a proposed starting point — edit
 * freely. The page renders straight from this file, so wording changes never
 * touch JSX. Do not add dollar caps, annual budgets, deadlines, guaranteed
 * funding, or response-time promises unless the owner supplies them.
 */

/** Request categories offered in the form and shown on the page. */
export type SupportRequestCategory =
  | "community"
  | "youth"
  | "education"
  | "conservation"
  | "animal-welfare"
  | "sports"
  | "culture"
  | "events"
  | "other";

export interface SupportRequestCategoryOption {
  value: SupportRequestCategory;
  label: string;
}

/**
 * UX groupings, not funding promises — listing a category here does not mean
 * every request in it is approved.
 */
export const SUPPORT_REQUEST_CATEGORIES: readonly SupportRequestCategoryOption[] = [
  { value: "community", label: "Community" },
  { value: "youth", label: "Youth" },
  { value: "education", label: "Education" },
  { value: "conservation", label: "Conservation" },
  { value: "animal-welfare", label: "Animal welfare" },
  { value: "sports", label: "Sports" },
  { value: "culture", label: "Culture" },
  { value: "events", label: "Events" },
  { value: "other", label: "Other" },
];

export function supportRequestCategoryLabel(value: string): string {
  return (
    SUPPORT_REQUEST_CATEGORIES.find((c) => c.value === value)?.label ?? value
  );
}

/** The kinds of help Sea Saba may provide — not only money. */
export type SupportType =
  | "financial"
  | "sponsorship"
  | "goods"
  | "prize"
  | "services"
  | "staff-time"
  | "in-kind";

export interface SupportTypeOption {
  value: SupportType;
  label: string;
  /** One line shown on the page under "What support can look like". */
  description: string;
}

export const SUPPORT_TYPES: readonly SupportTypeOption[] = [
  { value: "financial", label: "Financial contribution", description: "A contribution toward a specific, documented cost." },
  { value: "sponsorship", label: "Sponsorship", description: "Sponsoring a team, event, project, or initiative." },
  { value: "goods", label: "Goods or supplies", description: "Equipment, materials, or supplies purchased by Sea Saba." },
  { value: "prize", label: "Prize or raffle contribution", description: "A dive, course, or item donated as a prize." },
  { value: "services", label: "Sea Saba services", description: "Diving, boat time, courses, or use of our facilities." },
  { value: "staff-time", label: "Staff or community participation", description: "Hands-on help from our team at an event or project." },
  { value: "in-kind", label: "Other in-kind help", description: "Anything else useful that isn't cash." },
];

export function supportTypeLabels(values: readonly string[]): string[] {
  return values.map(
    (v) => SUPPORT_TYPES.find((t) => t.value === v)?.label ?? v
  );
}

/**
 * Who may ask. Rendered as a short bulleted list — the first half of the
 * page's request-side content.
 */
export const WHO_CAN_REQUEST: readonly string[] = [
  "Saba community organizations, clubs, and associations",
  "Schools, youth programs, and sports teams",
  "Conservation and animal-welfare initiatives on the island",
  "Local events, cultural projects, and fundraisers",
  "Individuals leading an identifiable community project",
];

export interface SupportStandard {
  title: string;
  description: string;
}

/**
 * The ground rules. Positive framing on purpose: these exist so Sea Saba can
 * keep saying yes to good projects responsibly — they are not accusations.
 * Order matters; the page renders them in this order.
 */
export const SUPPORT_STANDARDS: readonly SupportStandard[] = [
  {
    title: "A clear benefit to Saba",
    description:
      "The request should benefit the island — its people, environment, youth, culture, events, or community organizations.",
  },
  {
    title: "Someone responsible we can reach",
    description:
      "There is an identifiable person or organization behind the project, and a reliable way for us to contact them.",
  },
  {
    title: "A specific purpose",
    description:
      "Tell us what you're doing, who benefits, what you're asking for, what it will be used for, and when it happens.",
  },
  {
    title: "We can see where support goes",
    description:
      "For monetary requests we need to understand where the money goes. Depending on the request we may ask for a budget, a quote or invoice, organization details, or proof the project or event exists — proportionate to what's being asked.",
  },
  {
    title: "Projects, not personal cash gifts",
    description:
      "We generally don't provide unrestricted cash gifts to individuals for personal use. Individuals are welcome to lead community projects — we just need to see the project and how the support will be used.",
  },
  {
    title: "Direct support where it's cleaner",
    description:
      "Where it makes accountability easier, we prefer to pay a supplier directly, purchase the requested goods ourselves, provide Sea Saba services, or sponsor the documented project rather than hand over cash.",
  },
  {
    title: "A quick follow-up afterward",
    description:
      "We may ask for a receipt, a photo, or a short update once support is used — small requests, small follow-ups.",
  },
];

/** How a request moves through the program. */
export const SUPPORT_REQUEST_STEPS: readonly string[] = [
  "Send your request using the form below — email and WhatsApp work too if that's easier.",
  "We read every request against the ground rules and may come back with a follow-up question or two.",
  "If it's a fit, we coordinate the support — often directly with a supplier or organizer.",
  "Afterward we may ask for a quick confirmation: a receipt, a photo, or a short update.",
];

/**
 * Honest, non-legalistic note shown near the form. Do not soften into a
 * promise, and do not add quotas or deadlines without owner approval.
 */
export const SUPPORT_REQUEST_NO_GUARANTEE =
  "We'd love to say yes to everything, but we can't — submitting a request doesn't guarantee funding or support. If we're unable to help, we'll still try to point you in a useful direction.";
