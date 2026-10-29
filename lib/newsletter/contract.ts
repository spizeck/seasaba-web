/**
 * The Newsletter wire contract shared with contract-builder
 * (`src/shared/newsletter/*` — see NEWSLETTER.md there).
 *
 * Field names, enums, and limits mirror that module exactly — the backend
 * rejects unknown fields/values, so a drift here is a runtime failure, not
 * a type error. Bump NEWSLETTER_SCHEMA_VERSION only in lockstep with the
 * backend.
 *
 * PURE module: no env access, no secrets, no fetch — safe to import from
 * client bundles.
 */

export const NEWSLETTER_SCHEMA_VERSION = 1;

/** `source` value identifying this deployment to the backend audit trail. */
export const NEWSLETTER_SOURCE = "seasaba-web";

/**
 * Consent wording version — must match the backend's accepted value.
 * Bump (with the backend) when the signup wording changes materially.
 */
export const NEWSLETTER_CONSENT_VERSION = "newsletter-consent-v1";

/** Exact wording rendered beside the consent checkbox — stored server-side
 * as consent evidence. Keep in sync with the checkbox label in
 * components/newsletter-signup-form.tsx. */
export const NEWSLETTER_CONSENT_TEXT =
  "I agree to receive the Sea Saba newsletter by email. I can unsubscribe at any time.";

export const NEWSLETTER_LIMITS = {
  email: 254,
  organization: 120,
  attribution: 40,
} as const;

export const NEWSLETTER_AUDIENCES = ["individual", "group"] as const;
export type NewsletterAudience = (typeof NEWSLETTER_AUDIENCES)[number];

// Backend-enforced idempotency-key shape.
const IDEMPOTENCY_KEY_RE = /^[\w:.-]+$/;

export function isValidIdempotencyKey(key: unknown): key is string {
  return (
    typeof key === "string" &&
    key.length >= 8 &&
    key.length <= 128 &&
    IDEMPOTENCY_KEY_RE.test(key)
  );
}

export function newIdempotencyKey(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the non-crypto form.
  }
  return `nl.${Date.now()}.${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Acquisition attribution. campaign/source/placement are bounded
 * lowercase slugs — anything else is dropped to null so junk URL params
 * never reach Firestore or analytics. New campaigns need no code change.
 */
export interface NewsletterAttribution {
  campaign: string | null;
  source: string | null;
  placement: string | null;
  /** The audience preselected by the campaign link — not consent. */
  audience: NewsletterAudience | null;
}

const ATTRIBUTION_RE = /^[a-z0-9][a-z0-9-]*$/;

export function sanitizeAttributionValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v.length < 1 || v.length > NEWSLETTER_LIMITS.attribution) return null;
  return ATTRIBUTION_RE.test(v) ? v : null;
}

export function sanitizeAttributionAudience(
  value: unknown
): NewsletterAudience | null {
  return NEWSLETTER_AUDIENCES.includes(value as NewsletterAudience)
    ? (value as NewsletterAudience)
    : null;
}

/** Parse the ?campaign=&source=&placement=&audience= URL parameters. */
export function attributionFromSearchParams(params: {
  campaign?: string;
  source?: string;
  placement?: string;
  audience?: string;
}): NewsletterAttribution {
  return {
    campaign: sanitizeAttributionValue(params.campaign),
    source: sanitizeAttributionValue(params.source),
    placement: sanitizeAttributionValue(params.placement),
    audience: sanitizeAttributionAudience(params.audience),
  };
}

/** Public form draft — validated client-side and again server-side. */
export interface NewsletterSubscriptionDraft {
  email: string;
  audiences: NewsletterAudience[];
  organization: string;
  consent: boolean;
  consentVersion: string;
  consentText: string;
}

export interface NewsletterSubscribePayload {
  schemaVersion: number;
  idempotencyKey: string;
  source: string;
  submittedAt?: string;
  subscription: NewsletterSubscriptionDraft;
  attribution: NewsletterAttribution;
}

export interface NewsletterTokenPayload {
  token: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client-side validation mirror of the backend's draft rules. */
export function validateNewsletterDraft(draft: {
  email: string;
  audiences: NewsletterAudience[];
  organization: string;
  consent: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const email = draft.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (email.length > NEWSLETTER_LIMITS.email || !EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (draft.audiences.length < 1) {
    errors.audiences = "Choose at least one option.";
  }
  if (draft.organization.trim().length > NEWSLETTER_LIMITS.organization) {
    errors.organization = `Must be at most ${NEWSLETTER_LIMITS.organization} characters.`;
  }
  if (!draft.consent) errors.consent = "Please confirm you'd like to subscribe.";
  return errors;
}
