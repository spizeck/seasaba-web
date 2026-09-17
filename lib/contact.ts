import { inquiryFor } from "@/data/operations";

/**
 * Shared validation and email construction for the server-side contact
 * endpoint (`app/api/contact/route.ts`). Pure functions — no Next.js or
 * provider imports — so the contract is unit-testable in isolation and the
 * route handler stays a thin transport/provider boundary.
 */

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  whatsapp: 40,
  dates: 100,
  students: 30,
  certification: 100,
  loggedDives: 30,
  message: 5000,
  submissionId: 100,
} as const;

export interface ContactSubmission {
  name: string;
  email: string;
  whatsapp: string;
  dates: string;
  students: string;
  certification: string;
  loggedDives: string;
  preferredContact: "email" | "whatsapp";
  inquiryType: string;
  inquiryLabel: string;
  inquirySubject: string;
  /** Canonical party-size label for this inquiry (e.g. "Number of divers"). */
  partyLabel: string;
  message: string;
  /** Client-generated idempotency key; forwarded to the email provider. */
  submissionId: string;
}

export type ContactValidation =
  | { ok: true; data: ContactSubmission }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Strips CR/LF so a field can never inject extra email headers or subject lines. */
const stripNewlines = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function overLimit(field: string, limit: number): string {
  return `Please keep the ${field} under ${limit} characters.`;
}

/**
 * Validate and normalize a contact-form payload. Any field that fails is
 * reported under the same key the client uses for its own errors, so server
 * rejections can be surfaced in place.
 */
export function validateContactSubmission(input: unknown): ContactValidation {
  const body = (input ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = stripNewlines(asString(body.name));
  if (!name) errors.name = "Please enter your name.";
  else if (name.length > CONTACT_LIMITS.name) errors.name = overLimit("name", CONTACT_LIMITS.name);

  const email = stripNewlines(asString(body.email));
  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(email))
    errors.email = "Please enter a valid email address.";

  const inquiry = inquiryFor(asString(body.inquiryType));
  if (!inquiry) errors.inquiryType = "Please select an inquiry type.";

  const message = asString(body.message).trim();
  if (!message) errors.message = "Please enter a message.";
  else if (message.length > CONTACT_LIMITS.message)
    errors.message = overLimit("message", CONTACT_LIMITS.message);

  const optional = {
    whatsapp: stripNewlines(asString(body.whatsapp)),
    dates: stripNewlines(asString(body.dates)),
    students: stripNewlines(asString(body.students)),
    certification: stripNewlines(asString(body.certification)),
    loggedDives: stripNewlines(asString(body.loggedDives)),
  };
  for (const [field, value] of Object.entries(optional)) {
    const limit = CONTACT_LIMITS[field as keyof typeof optional];
    if (value.length > limit) errors[field] = overLimit(field, limit);
  }

  // WhatsApp-preferred is only meaningful when a number was supplied;
  // normalize otherwise so the email never claims a WhatsApp-first
  // preference without a reachable channel.
  const preferredContact =
    body.preferredContact === "whatsapp" && optional.whatsapp ? "whatsapp" : "email";
  const submissionId = stripNewlines(asString(body.submissionId)).slice(0, CONTACT_LIMITS.submissionId);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      email,
      ...optional,
      preferredContact,
      inquiryType: inquiry!.value,
      inquiryLabel: inquiry!.label,
      inquirySubject: inquiry!.subject,
      partyLabel: inquiry!.partyLabel ?? "Number of divers/students",
      message,
      submissionId,
    },
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Staff-facing subject: canonical inquiry context plus the visitor's name. */
export function contactSubject(data: ContactSubmission): string {
  return `${data.inquirySubject} — ${data.name}`.slice(0, 200);
}

export function contactEmailText(data: ContactSubmission): string {
  const lines = [
    `New inquiry via the Sea Saba website contact form.`,
    ``,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Inquiry: ${data.inquiryLabel}`,
  ];
  if (data.whatsapp) lines.push(`WhatsApp: ${data.whatsapp}`);
  if (data.dates) lines.push(`Planned travel dates: ${data.dates}`);
  if (data.students) lines.push(`${data.partyLabel}: ${data.students}`);
  if (data.certification) lines.push(`Certification level: ${data.certification}`);
  if (data.loggedDives) lines.push(`Logged dives: ${data.loggedDives}`);
  lines.push(`Preferred contact method: ${data.preferredContact === "whatsapp" ? "WhatsApp" : "Email"}`);
  lines.push(``, `Message:`, data.message, ``, `— Sent from seasaba.com (inquiry: ${data.inquiryType})`);
  return lines.join("\n");
}

export function contactEmailHtml(data: ContactSubmission): string {
  const esc = escapeHtml;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${label}</td><td style="padding:4px 0">${esc(value)}</td></tr>`;
  const emailRow = `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">Email</td><td style="padding:4px 0"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>`;
  const rows = [
    row("Name", data.name),
    emailRow,
    row("Inquiry", data.inquiryLabel),
    data.whatsapp ? row("WhatsApp", data.whatsapp) : "",
    data.dates ? row("Travel dates", data.dates) : "",
    data.students ? row(data.partyLabel, data.students) : "",
    data.certification ? row("Certification", data.certification) : "",
    data.loggedDives ? row("Logged dives", data.loggedDives) : "",
    row("Prefers", data.preferredContact === "whatsapp" ? "WhatsApp" : "Email"),
  ].join("");
  return [
    `<p>New inquiry via the Sea Saba website contact form.</p>`,
    `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows}</table>`,
    `<p style="margin-top:16px;font-family:sans-serif;font-size:14px;white-space:pre-wrap">${esc(data.message)}</p>`,
    `<p style="color:#999;font-size:12px">Sent from seasaba.com (inquiry: ${esc(data.inquiryType)})</p>`,
  ].join("");
}
