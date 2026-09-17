import { CONTACT } from "@/lib/constants";
import { inquiryFor } from "@/data/operations";

/**
 * Client-email handoff for the contact form. The site builds a
 * pre-populated `mailto:` draft; the visitor's own email application sends
 * it, so Respond.io sees the visitor's real From address and each inquiry
 * lands on the correct contact. (Server-side sending from a common
 * verified address collapsed all visitors into one Respond.io contact —
 * see issue #104 for the deferred Custom Channel architecture.)
 *
 * Pure functions — no Next.js or provider imports — so the email contract
 * is unit-testable in isolation.
 */

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  whatsapp: 40,
  dates: 100,
  students: 30,
  certification: 100,
  loggedDives: 30,
  // mailto: URIs degrade badly past a few KB in common email clients, so
  // the message cap is enforced by the field itself (maxLength + a visible
  // counter) — the visitor's text is never silently truncated.
  message: 2000,
} as const;

/** Everything needed to build the visitor's inquiry email. */
export interface InquiryDraft {
  name: string;
  email: string;
  whatsapp: string;
  dates: string;
  /** Party size under whatever label the inquiry uses (divers/guests/…). */
  students: string;
  certification: string;
  loggedDives: string;
  /** Explicit visitor opt-in only — a WhatsApp number alone stays "email". */
  preferredContact: "email" | "whatsapp";
  /** `INQUIRY_TYPES` slug. */
  inquiryType: string;
  message: string;
}

/** Single-line fields must not carry CR/LF into headers or label lines. */
const stripNewlines = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** Canonical inquiry context plus the visitor's name. */
export function contactEmailSubject(draft: InquiryDraft): string {
  const base = inquiryFor(draft.inquiryType)?.subject ?? "Website Inquiry";
  const name = stripNewlines(draft.name);
  return (name ? `${base} — ${name}` : base).slice(0, 200);
}

/**
 * Human-readable structured body. Only fields with values appear — a
 * Sunset Cruise inquiry never mentions certification, and so on.
 */
export function contactEmailBody(draft: InquiryDraft): string {
  const inquiry = inquiryFor(draft.inquiryType);
  const line = (label: string, value: string) => `${label}: ${stripNewlines(value)}`;

  const lines = [
    "Sea Saba Website Inquiry",
    "",
    line("Name", draft.name),
    line("Email", draft.email),
    line("Inquiry", inquiry?.label ?? draft.inquiryType),
    `Preferred contact method: ${draft.preferredContact === "whatsapp" ? "WhatsApp" : "Email"}`,
  ];
  if (draft.whatsapp.trim()) lines.push(line("WhatsApp", draft.whatsapp));
  if (draft.dates.trim()) lines.push(line("Planned travel dates", draft.dates));
  if (draft.students.trim()) lines.push(line(inquiry?.partyLabel ?? "Group size", draft.students));
  if (draft.certification.trim()) lines.push(line("Certification level", draft.certification));
  if (draft.loggedDives.trim()) lines.push(line("Logged dives", draft.loggedDives));
  lines.push("", "Message:", draft.message.trim());
  return lines.join("\n");
}

/**
 * `mailto:` URI for the draft. Recipient is always the canonical inbox;
 * subject/body are URI-encoded (non-ASCII, punctuation, and line breaks —
 * normalized to CRLF, the most broadly accepted mailto newline form).
 */
export function buildContactMailto(draft: InquiryDraft): string {
  const subject = encodeURIComponent(contactEmailSubject(draft));
  const body = encodeURIComponent(contactEmailBody(draft).replace(/\n/g, "\r\n"));
  return `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
}
