import {
  SUPPORT_REQUEST_CATEGORIES,
  SUPPORT_TYPES,
} from "@/data/community-support";
import type { DonationRecipient } from "@/data/donations";
import type { SupportRequestDraft } from "@/lib/support-request";

/**
 * The Community Support wire contract shared with contract-builder
 * (spizeck/contract-builder#148, `src/shared/communitySupport/*` @ bd3badb).
 *
 * Field names, enums, and limits mirror that module exactly — the backend
 * rejects unknown fields/values, so a drift here is a runtime failure, not
 * a type error. Bump SUPPORT_REQUEST_SCHEMA_VERSION only in lockstep with
 * the backend.
 *
 * PURE module: no env access, no secrets, no fetch — safe to import from
 * client bundles.
 */

export const SUPPORT_REQUEST_SCHEMA_VERSION = 1;

/** `source` value identifying this deployment to the backend audit trail. */
export const COMMUNITY_SUPPORT_SOURCE = "seasaba-web";

// Backend-enforced idempotency-key shape (types.ts @ bd3badb).
export const IDEMPOTENCY_KEY_MIN_LENGTH = 8;
export const IDEMPOTENCY_KEY_MAX_LENGTH = 128;
const IDEMPOTENCY_KEY_RE = /^[\w:.-]+$/;

export function isValidIdempotencyKey(key: unknown): key is string {
  return (
    typeof key === "string" &&
    key.length >= IDEMPOTENCY_KEY_MIN_LENGTH &&
    key.length <= IDEMPOTENCY_KEY_MAX_LENGTH &&
    IDEMPOTENCY_KEY_RE.test(key)
  );
}

/**
 * Caller-generated key making retries safe. crypto.randomUUID where
 * available; the fallback stays inside the backend's [\w:.-]+ shape.
 */
export function newIdempotencyKey(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the non-crypto form.
  }
  return `sr.${Date.now()}.${Math.random().toString(36).slice(2, 14)}`;
}

// ---------------------------------------------------------------------------
// POST /api/community-support/requests (ingestion)
// ---------------------------------------------------------------------------

/**
 * Body of the backend ingestion endpoint. `request` is the public form
 * draft verbatim — every field present, optional strings sent as "".
 */
export interface SupportRequestIngestPayload {
  schemaVersion: number;
  /** Caller-generated key making retries safe — required. */
  idempotencyKey: string;
  /** "seasaba-web" — identifies the calling deployment. */
  source: string;
  /** Optional ISO-8601 client submission timestamp. */
  submittedAt?: string;
  request: SupportRequestDraft;
}

/** 201/200 success body: `duplicate` marks an idempotent replay. */
export interface SupportRequestIngestResult {
  requestId: string;
  /** Human-friendly reference — "CSR-YYYY-NNNN". */
  reference: string;
  duplicate: boolean;
}

/**
 * The backend error vocabulary (communitySupportErrorResponse). Error
 * bodies are `{ error: <code>, fields?: Record<string,string> }` — the
 * field map carries names/messages only, never submitted values.
 */
export type CommunitySupportErrorCode =
  | "invalid_payload"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "idempotency_conflict"
  | "invalid_transition"
  | "rate_limited"
  | "not_configured"
  | "validation_failed"
  | "internal"
  | "unavailable";

// ---------------------------------------------------------------------------
// GET /api/public/community-support/recipients (public read)
// ---------------------------------------------------------------------------

export const DONATION_CATEGORIES = [
  "conservation",
  "community",
  "animals",
  "youth",
  "culture",
  "marine-conservation",
  "science-education",
] as const;

/**
 * The backend's public DTO — an explicit allowlist. Internal fields
 * (staffNotes, reviewStatus, publication, lastVerifiedAt, timestamps,
 * audit history) are never emitted by the endpoint and must never be
 * added here.
 */
export interface PublicDonationRecipient {
  slug: string;
  name: string;
  description: string;
  funds: string | null;
  category: (typeof DONATION_CATEGORIES)[number] | null;
  website: string;
  donationUrl: string | null;
  image: string | null;
  imageAlt: string | null;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Wire readers — structural validation shared by the API route and tests
// ---------------------------------------------------------------------------

const DRAFT_STRING_FIELDS = [
  "name",
  "organization",
  "email",
  "phone",
  "category",
  "amount",
  "request",
  "description",
  "beneficiaries",
  "timing",
  "useOfSupport",
  "referenceUrl",
] as const;

const KNOWN_CATEGORIES = new Set<string>(
  SUPPORT_REQUEST_CATEGORIES.map((c) => c.value)
);
const KNOWN_SUPPORT_TYPES = new Set<string>(
  SUPPORT_TYPES.map((t) => t.value)
);

/**
 * Read a submitted `request` object into a SupportRequestDraft, or null
 * when the wire shape is wrong. Every string field must be present as a
 * string — a missing field is a contract violation, not an empty value.
 * Optional fields stay ""-valued; the backend contract wants them present.
 */
export function readSupportRequestDraft(
  value: unknown
): SupportRequestDraft | null {
  if (typeof value !== "object" || value === null) return null;
  const r = value as Record<string, unknown>;

  const draft = {} as Record<(typeof DRAFT_STRING_FIELDS)[number], string>;
  for (const f of DRAFT_STRING_FIELDS) {
    if (typeof r[f] !== "string") return null;
    draft[f] = r[f] as string;
  }
  if (
    !Array.isArray(r.supportTypes) ||
    r.supportTypes.some((t) => typeof t !== "string")
  ) {
    return null;
  }
  if (typeof r.vendorPayment !== "boolean") return null;
  if (typeof r.acknowledged !== "boolean") return null;

  return {
    ...draft,
    supportTypes: r.supportTypes as string[],
    vendorPayment: r.vendorPayment,
    acknowledged: r.acknowledged,
  };
}

/**
 * Enum-level checks the local validator doesn't do (it only checks
 * presence). The backend rejects unknown categories/types — catching them
 * here keeps the error local and avoids a pointless round trip.
 */
export function draftEnumErrors(
  draft: SupportRequestDraft
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!KNOWN_CATEGORIES.has(draft.category)) {
    errors.category = "Please choose a category.";
  }
  if (
    draft.supportTypes.some((t) => !KNOWN_SUPPORT_TYPES.has(t)) ||
    new Set(draft.supportTypes).size !== draft.supportTypes.length
  ) {
    errors.supportTypes = "Please choose at least one type of support.";
  }
  return errors;
}

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const nullableString = (v: unknown): string | null =>
  typeof v === "string" && v.trim().length > 0 ? v : null;

/**
 * Parse the public recipients response body `{ schemaVersion, recipients }`
 * into validated DTOs. Returns null when the body is malformed at the top
 * level; individual records that violate the contract are dropped rather
 * than published (e.g. an image without alt text can never render).
 */
export function parsePublicRecipients(
  body: unknown
): PublicDonationRecipient[] | null {
  if (typeof body !== "object" || body === null) return null;
  const recipients = (body as Record<string, unknown>).recipients;
  if (!Array.isArray(recipients)) return null;

  const parsed: PublicDonationRecipient[] = [];
  for (const item of recipients) {
    if (typeof item !== "object" || item === null) return null;
    const r = item as Record<string, unknown>;
    if (
      !isNonEmptyString(r.slug) ||
      !isNonEmptyString(r.name) ||
      !isNonEmptyString(r.description) ||
      !isNonEmptyString(r.website) ||
      typeof r.sortOrder !== "number"
    ) {
      return null;
    }
    const category =
      typeof r.category === "string" &&
      (DONATION_CATEGORIES as readonly string[]).includes(r.category)
        ? (r.category as PublicDonationRecipient["category"])
        : null;
    const image = nullableString(r.image);
    const imageAlt = nullableString(r.imageAlt);
    // Accessibility invariant from the backend contract: an image with no
    // deliberate alt text may not surface publicly.
    if (image !== null && !isNonEmptyString(imageAlt)) continue;
    parsed.push({
      slug: r.slug,
      name: r.name,
      description: r.description,
      funds: nullableString(r.funds),
      category,
      website: r.website,
      donationUrl: nullableString(r.donationUrl),
      image,
      imageAlt,
      sortOrder: r.sortOrder,
    });
  }
  return parsed;
}

// Local card images only — the registry policy requires organization-
// supplied assets under public/images (never a hotlinked third-party URL),
// and next/image has no remotePatterns configured. A backend-supplied
// remote URL renders the card without a logo rather than hotlinking.
const LOCAL_IMAGE_RE = /^\/images\//;

/**
 * Map a validated public DTO onto the DonationRecipient shape the
 * DonationsSection renders. Backend nulls become optional absences; the
 * image/imageAlt pair stays all-or-nothing, and non-local images are
 * dropped (the card renders fine without a logo).
 */
export function toDonationRecipient(
  dto: PublicDonationRecipient
): DonationRecipient {
  const image =
    dto.image !== null && dto.imageAlt !== null && LOCAL_IMAGE_RE.test(dto.image)
      ? { image: dto.image, imageAlt: dto.imageAlt }
      : {};
  return {
    name: dto.name,
    description: dto.description,
    website: dto.website,
    ...(dto.funds !== null ? { funds: dto.funds } : {}),
    ...(dto.category !== null ? { category: dto.category } : {}),
    ...(dto.donationUrl !== null ? { donationUrl: dto.donationUrl } : {}),
    ...image,
  };
}
