import { CONTACT } from "@/lib/constants";
import {
  supportRequestCategoryLabel,
  supportTypeLabels,
} from "@/data/community-support";

/**
 * Client-email handoff for the /donate "Request Support from Sea Saba" form —
 * the same submission mechanism as the contact form. The site builds a
 * pre-populated `mailto:` draft (or a WhatsApp message); the visitor's own
 * email app sends it, so Respond.io sees the visitor's real From address and
 * the request lands on the correct contact. Server-side sending was removed
 * site-wide because a common `From` address collapsed all visitors into one
 * Respond.io contact — see issue #104 for the deferred Custom Channel
 * architecture. Do not reintroduce a shared-sender server endpoint here.
 *
 * Pure functions — no Next.js or provider imports — so the submission
 * contract is unit-testable in isolation.
 */

export const SUPPORT_REQUEST_LIMITS = {
  name: 100,
  organization: 150,
  email: 254,
  phone: 40,
  amount: 80,
  request: 400,
  description: 1500,
  beneficiaries: 300,
  timing: 150,
  useOfSupport: 500,
  referenceUrl: 300,
} as const;

/** Everything needed to evaluate and deliver a community-support request. */
export interface SupportRequestDraft {
  name: string;
  /** Organization, group, or project name — optional for individuals. */
  organization: string;
  email: string;
  /** Optional phone or WhatsApp number for follow-up questions. */
  phone: string;
  /** `SUPPORT_REQUEST_CATEGORIES` slug. */
  category: string;
  /** `SUPPORT_TYPES` slugs — one or more kinds of help being asked for. */
  supportTypes: readonly string[];
  /**
   * Estimated amount or value, required only when "financial" is among
   * `supportTypes` — a money request without a number can't be evaluated.
   */
  amount: string;
  /** What is being requested, in the requester's own words. */
  request: string;
  /** What the project or event is. */
  description: string;
  /** Who benefits. */
  beneficiaries: string;
  /** When the project or event happens / the timeline. */
  timing: string;
  /** How Sea Saba's contribution would be used. */
  useOfSupport: string;
  /**
   * Whether Sea Saba may pay a supplier/vendor directly or purchase goods
   * instead of handing over cash — the accountability-friendly option the
   * program prefers.
   */
  vendorPayment: boolean;
  /** Optional link to project/event information. */
  referenceUrl: string;
  /**
   * Required acknowledgement: the information is accurate and Sea Saba may
   * request supporting information before deciding.
   */
  acknowledged: boolean;
}

export type SupportRequestErrors = Partial<Record<string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Client-side validation shared by the form and tests. Returns a map of
 * field → message; empty means submittable. This is the same trust level as
 * the contact form — the email is reviewed and sent by the visitor, and Sea
 * Saba staff evaluate the content, so validation exists to produce a
 * complete request, not to gatekeep.
 */
export function validateSupportRequest(
  draft: SupportRequestDraft
): SupportRequestErrors {
  const errors: SupportRequestErrors = {};
  if (!draft.name.trim()) errors.name = "Please enter your name.";
  if (!draft.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(draft.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!draft.category) errors.category = "Please choose a category.";
  if (draft.supportTypes.length === 0)
    errors.supportTypes = "Please choose at least one type of support.";
  if (draft.supportTypes.includes("financial") && !draft.amount.trim())
    errors.amount =
      "Please give an estimated amount so we can evaluate the request.";
  if (!draft.request.trim())
    errors.request = "Please tell us what you're asking Sea Saba for.";
  if (!draft.description.trim())
    errors.description = "Please describe the project, event, or cause.";
  if (!draft.beneficiaries.trim())
    errors.beneficiaries = "Please tell us who benefits.";
  if (!draft.timing.trim())
    errors.timing = "Please tell us when it happens or your timeline.";
  if (!draft.useOfSupport.trim())
    errors.useOfSupport = "Please tell us how our contribution would be used.";
  if (draft.referenceUrl.trim() && !/^https?:\/\/\S+$/.test(draft.referenceUrl.trim()))
    errors.referenceUrl = "Please enter a full URL starting with http:// or https://.";
  if (!draft.acknowledged)
    errors.acknowledged = "Please confirm the information is accurate before sending.";
  return errors;
}

/** Single-line fields must not carry CR/LF into headers or label lines. */
const stripNewlines = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** Canonical subject — searchable in the inbox alongside other inquiries. */
export function supportRequestSubject(draft: SupportRequestDraft): string {
  const who =
    stripNewlines(draft.organization) || stripNewlines(draft.name) || "";
  return ("Community Support Request" + (who ? `: ${who}` : "")).slice(0, 200);
}

/**
 * Human-readable structured body. Every labeled line is a field Sea Saba
 * uses to evaluate the request; optional fields appear only when filled so
 * the request reads cleanly.
 */
export function supportRequestEmailBody(draft: SupportRequestDraft): string {
  const line = (label: string, value: string) =>
    `${label}: ${stripNewlines(value)}`;

  const lines = [
    "Sea Saba Community Support Request",
    "",
    line("Name", draft.name),
    line("Email", draft.email),
  ];
  if (draft.organization.trim())
    lines.push(line("Organization / group / project", draft.organization));
  if (draft.phone.trim()) lines.push(line("Phone / WhatsApp", draft.phone));
  lines.push(
    line("Category", supportRequestCategoryLabel(draft.category)),
    line("Type of support requested", supportTypeLabels(draft.supportTypes).join(", "))
  );
  if (draft.amount.trim())
    lines.push(line("Estimated amount or value", draft.amount));
  lines.push(
    "",
    "What we're asking for:",
    draft.request.trim(),
    "",
    "About the project or event:",
    draft.description.trim(),
    "",
    line("Who benefits", draft.beneficiaries),
    line("When / timeline", draft.timing),
    "",
    "How Sea Saba's contribution would be used:",
    draft.useOfSupport.trim()
  );
  lines.push(
    "",
    `Open to Sea Saba paying a supplier directly or purchasing goods: ${
      draft.vendorPayment ? "Yes" : "No"
    }`
  );
  if (draft.referenceUrl.trim())
    lines.push(line("Link to project/event info", draft.referenceUrl));
  lines.push(
    "",
    "The requester confirmed the information above is accurate and understands Sea Saba may ask for supporting information before deciding."
  );
  return lines.join("\n");
}

/**
 * `mailto:` URI for the draft. Recipient is always the canonical inbox;
 * subject/body are URI-encoded (line breaks normalized to CRLF, the most
 * broadly accepted mailto newline form). Because the visitor's own email
 * app sends it, Respond.io files the request under the visitor's real
 * address — not a shared website sender.
 */
export function buildSupportRequestMailto(draft: SupportRequestDraft): string {
  const subject = encodeURIComponent(supportRequestSubject(draft));
  const body = encodeURIComponent(
    supportRequestEmailBody(draft).replace(/\n/g, "\r\n")
  );
  return `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
}

/**
 * WhatsApp handoff — the same structured request as a text message. WhatsApp
 * is how much of Saba communicates; the message lands in the same Respond.io
 * inbox under the sender's own number.
 */
export function buildSupportRequestWhatsAppUrl(
  draft: SupportRequestDraft
): string {
  const text = `Hi Sea Saba, I'd like to request community support.\n\n${supportRequestEmailBody(draft)}`;
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
