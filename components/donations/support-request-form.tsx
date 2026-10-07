"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, Send, TriangleAlert } from "lucide-react";
import { trackEvent, trackLinkClick } from "@/lib/analytics";
import { CONTACT } from "@/lib/constants";
import { newIdempotencyKey } from "@/lib/community-support/contract";
import {
  buildSupportRequestMailto,
  buildSupportRequestWhatsAppUrl,
  validateSupportRequest,
  SUPPORT_REQUEST_LIMITS,
  type SupportRequestDraft,
  type SupportRequestErrors,
} from "@/lib/support-request";
import { SUPPORT_REQUEST_CATEGORIES, SUPPORT_TYPES } from "@/data/community-support";

const EMPTY_DRAFT: SupportRequestDraft = {
  name: "",
  organization: "",
  email: "",
  phone: "",
  category: "",
  supportTypes: [],
  amount: "",
  request: "",
  description: "",
  beneficiaries: "",
  timing: "",
  useOfSupport: "",
  vendorPayment: false,
  referenceUrl: "",
  acknowledged: false,
};

// text-base (16px) below lg so iOS Safari doesn't auto-zoom on focus.
const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:text-sm";
const labelClass = "text-sm font-medium text-foreground";

function FieldError({ id, message }: { id: string; message?: string }) {
  // Mounts only with a message. A permanently reserved slot pads every
  // untouched field in this long form; a small local expansion when a
  // message appears is the better trade. `aria-describedby` points here
  // only under the same condition, so the reference never dangles.
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  );
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; reference: string }
  | { status: "error"; kind: "validation" | "rate_limited" | "unavailable" };

/** Wire shape of POST /api/support-requests — the first-party boundary. */
interface SubmitResponseBody {
  ok?: boolean;
  reference?: string;
  kind?: string;
  fields?: Record<string, string>;
}

// Backend field errors use the same field names as the draft — only those
// may be merged into the form's per-field error state.
const DRAFT_FIELD_NAMES = new Set(Object.keys(EMPTY_DRAFT));

// Client-side bound on the boundary request: comfortably above the
// server's own backend timeout so a normal slow response still lands.
const CLIENT_TIMEOUT_MS = 20_000;

/** Validatable controls in visual order — the first invalid one gets focus. */
const FIELD_IDS: Record<string, string> = {
  name: "sr-name",
  email: "sr-email",
  category: "sr-category",
  // A checkbox group can't take focus itself; land on its first option.
  supportTypes: `sr-type-${SUPPORT_TYPES[0].value}`,
  amount: "sr-amount",
  request: "sr-request",
  description: "sr-description",
  beneficiaries: "sr-beneficiaries",
  timing: "sr-timing",
  useOfSupport: "sr-use",
  referenceUrl: "sr-url",
  acknowledged: "sr-ack",
};

/**
 * "Request Support from Sea Saba" form (#171, persistence boundary #189).
 * Submits to the Sea Saba-owned route /api/support-requests, which persists
 * the request in the Community Support system and returns a human-friendly
 * reference — success is shown only after that persistence succeeds. The
 * visitor's own email app / WhatsApp remain as an explicit fallback when
 * the system can't be reached, so no request is ever stranded. Analytics
 * receive only generic started/submitted/succeeded/failed events; field
 * contents never leave the page in an analytics payload.
 */
export function SupportRequestForm() {
  const [draft, setDraft] = useState<SupportRequestDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<SupportRequestErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  // Honeypot — invisible and unreachable to humans (aria-hidden, offscreen,
  // tabIndex -1, no autocomplete). Any value means a bot.
  const [honeypot, setHoneypot] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);
  // One idempotency key per distinct draft: retries of an unchanged draft
  // replay safely on the backend; any edit mints a fresh key so a follow-up
  // request is a new record, never a conflict.
  const idempotencyRef = useRef<{ key: string; fingerprint: string } | null>(null);
  const startedRef = useRef(false);

  const wantsFinancial = useMemo(
    () => draft.supportTypes.includes("financial"),
    [draft.supportTypes]
  );

  // Generic funnel signal only — never field contents. Fires once, when the
  // requester first focuses a field.
  const markStarted = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("donation_request_started", {
      button_location: "donate_request_form",
    });
  }, []);

  // `errors` always describes the current draft; a field's message renders
  // only once it's been touched (or after a submit attempt touches all).
  const setField = <K extends keyof SupportRequestDraft>(
    key: K,
    value: SupportRequestDraft[K]
  ) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    setErrors(validateSupportRequest(next));
  };

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors(validateSupportRequest(draft));
    },
    [draft]
  );

  const toggleSupportType = (value: string) => {
    const next = {
      ...draft,
      supportTypes: draft.supportTypes.includes(value)
        ? draft.supportTypes.filter((t) => t !== value)
        : [...draft.supportTypes, value],
    };
    setDraft(next);
    setErrors(validateSupportRequest(next));
    setTouched((prev) => ({ ...prev, supportTypes: true }));
  };

  const touchAll = useCallback(() => {
    setTouched({
      name: true,
      email: true,
      category: true,
      supportTypes: true,
      amount: true,
      request: true,
      description: true,
      beneficiaries: true,
      timing: true,
      useOfSupport: true,
      referenceUrl: true,
      acknowledged: true,
    });
  }, []);

  const validateAll = useCallback(() => {
    const validationErrors = validateSupportRequest(draft);
    setErrors(validationErrors);
    touchAll();
    // Move focus to the first invalid field so the error is announced in
    // context instead of leaving the requester hunting for it.
    const firstInvalid = Object.keys(FIELD_IDS).find(
      (key) => validationErrors[key]
    );
    if (firstInvalid) {
      // Focus after React commits — otherwise the control is announced
      // before its aria-invalid/aria-describedby attributes reach the DOM.
      const id = FIELD_IDS[firstInvalid];
      requestAnimationFrame(() => document.getElementById(id)?.focus());
      return false;
    }
    return true;
  }, [draft, touchAll]);

  // Move focus to the status panel whenever one appears — the announce-
  // first-then-focus order keeps screen readers on the message itself.
  useEffect(() => {
    if (submitState.status === "success" || submitState.status === "error") {
      statusRef.current?.focus();
    }
  }, [submitState.status]);

  // Persistence-first submit: the draft goes to the Sea Saba-owned
  // /api/support-requests route, which forwards it server-to-server into
  // the Community Support system. Success is shown only when the backend
  // confirms a persisted reference — a transport failure, validation
  // rejection, or timeout keeps every entry and offers the email/WhatsApp
  // handoff as the explicit fallback.
  const handleSendRequest = useCallback(async () => {
    if (!validateAll()) return;
    if (submitState.status === "submitting") return;

    const fingerprint = JSON.stringify(draft);
    if (!idempotencyRef.current || idempotencyRef.current.fingerprint !== fingerprint) {
      idempotencyRef.current = { key: newIdempotencyKey(), fingerprint };
    }

    setSubmitState({ status: "submitting" });
    // Generic funnel signal only — never field contents.
    trackEvent("donation_request_submitted", {
      method: "server",
      button_location: "donate_request_form",
    });

    const fail = (kind: "validation" | "rate_limited" | "unavailable") => {
      setSubmitState({ status: "error", kind });
      trackEvent("donation_request_failed", {
        reason: kind,
        button_location: "donate_request_form",
      });
    };

    let body: SubmitResponseBody | null = null;
    // Bound the whole request: without a client-side abort, a stalled
    // connection could leave the form disabled indefinitely. A timeout is
    // an uncertain outcome — the idempotency key above is preserved so a
    // retry of the unchanged draft replays against the same key.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
    try {
      const res = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          request: draft,
          idempotencyKey: idempotencyRef.current.key,
          submittedAt: new Date().toISOString(),
          website: honeypot,
        }),
        signal: controller.signal,
      });
      body = (await res.json().catch(() => null)) as SubmitResponseBody | null;
    } catch {
      fail("unavailable");
      return;
    } finally {
      clearTimeout(timeout);
    }

    if (body?.ok === true && typeof body.reference === "string" && body.reference) {
      setSubmitState({ status: "success", reference: body.reference });
      trackEvent("donation_request_succeeded", {
        button_location: "donate_request_form",
      });
      return;
    }

    if (body?.kind === "validation") {
      const serverFields = body.fields ?? {};
      const known: SupportRequestErrors = {};
      for (const [field, message] of Object.entries(serverFields)) {
        if (DRAFT_FIELD_NAMES.has(field) && typeof message === "string") {
          known[field] = message;
        }
      }
      if (Object.keys(known).length > 0) {
        setErrors((prev) => ({ ...prev, ...known }));
        setTouched((prev) => ({
          ...prev,
          ...Object.fromEntries(Object.keys(known).map((f) => [f, true])),
        }));
      }
      fail("validation");
      return;
    }
    fail(body?.kind === "rate_limited" ? "rate_limited" : "unavailable");
  }, [validateAll, draft, honeypot, submitState.status]);

  // ---- success: the request is persisted; replace the form so an
  // accidental resubmit cannot create a second record.
  if (submitState.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-md border border-primary/30 bg-primary/5 p-4 outline-none"
      >
        <div className="flex items-start gap-3">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Your request has been received.
            </p>
            <p className="mt-1 text-sm text-foreground">
              Reference: <strong className="font-semibold">{submitState.reference}</strong>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Keep the reference somewhere handy: it&apos;s how we find your request if you
              contact us. We read every request against the ground rules above and may come
              back with a follow-up question or two at the email address you gave. If you
              need to add anything, email{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {CONTACT.email}
              </a>{" "}
              or message us on{" "}
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                WhatsApp
              </a>{" "}
              and mention your reference.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSendRequest();
      }}
      onFocusCapture={markStarted}
      noValidate
    >
      {/* Honeypot — bots fill anything; humans never reach this field. */}
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="sr-website">Website</label>
        <input
          id="sr-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sr-name" className={labelClass}>
            Your name <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <input
            id="sr-name"
            name="sr-name"
            type="text"
            required
            autoComplete="name"
            value={draft.name}
            maxLength={SUPPORT_REQUEST_LIMITS.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? "sr-name-error" : undefined}
            className={inputClass}
            placeholder="Your full name"
            enterKeyHint="next"
          />
          <FieldError id="sr-name-error" message={touched.name ? errors.name : undefined} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-organization" className={labelClass}>
            Organization, group, or project{" "}
            <span className="font-normal text-muted-foreground">(if applicable)</span>
          </label>
          <input
            id="sr-organization"
            name="sr-organization"
            type="text"
            autoComplete="organization"
            value={draft.organization}
            maxLength={SUPPORT_REQUEST_LIMITS.organization}
            onChange={(e) => setField("organization", e.target.value)}
            className={inputClass}
            placeholder="e.g. Saba youth football club"
            enterKeyHint="next"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sr-email" className={labelClass}>
            Email <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <input
            id="sr-email"
            name="sr-email"
            type="email"
            required
            autoComplete="email"
            value={draft.email}
            maxLength={SUPPORT_REQUEST_LIMITS.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "sr-email-error" : undefined}
            className={inputClass}
            placeholder="you@example.com"
            enterKeyHint="next"
          />
          <FieldError id="sr-email-error" message={touched.email ? errors.email : undefined} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-phone" className={labelClass}>
            Phone or WhatsApp{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="sr-phone"
            name="sr-phone"
            type="tel"
            autoComplete="tel"
            value={draft.phone}
            maxLength={SUPPORT_REQUEST_LIMITS.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={inputClass}
            placeholder="+599 416 0000"
            enterKeyHint="next"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sr-category" className={labelClass}>
          Category <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <select
          id="sr-category"
          name="sr-category"
          required
          value={draft.category}
          onChange={(e) => setField("category", e.target.value)}
          onBlur={() => handleBlur("category")}
          aria-invalid={touched.category && !!errors.category}
          aria-describedby={touched.category && errors.category ? "sr-category-error" : undefined}
          className={inputClass}
        >
          <option value="" disabled>
            Choose the closest fit
          </option>
          {SUPPORT_REQUEST_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <FieldError id="sr-category-error" message={touched.category ? errors.category : undefined} />
      </div>

      <fieldset className="space-y-1.5">
        <legend className={labelClass}>
          Type of support needed{" "}
          <span aria-hidden="true" className="text-destructive">*</span>
          {/* The group needs at least one choice but no single checkbox can
              be `required`, so the cue is spoken here instead. */}
          <span className="sr-only"> required</span>{" "}
          <span className="font-normal text-muted-foreground">(choose all that apply)</span>
        </legend>
        <div className="grid gap-2 pt-1 sm:grid-cols-2">
          {SUPPORT_TYPES.map((type) => (
            <label
              key={type.value}
              htmlFor={`sr-type-${type.value}`}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <input
                id={`sr-type-${type.value}`}
                name={`sr-type-${type.value}`}
                type="checkbox"
                checked={draft.supportTypes.includes(type.value)}
                onChange={() => toggleSupportType(type.value)}
                aria-invalid={touched.supportTypes && !!errors.supportTypes}
                aria-describedby={
                  // Focus lands on a checkbox, not the fieldset — the group
                  // error must be associated with the box itself to be read.
                  touched.supportTypes && errors.supportTypes ? "sr-types-error" : undefined
                }
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary focus-visible:ring-1 focus-visible:ring-primary"
              />
              {type.label}
            </label>
          ))}
        </div>
        <FieldError id="sr-types-error" message={touched.supportTypes ? errors.supportTypes : undefined} />
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="sr-amount" className={labelClass}>
          Estimated amount or value{" "}
          {wantsFinancial ? (
            <span aria-hidden="true" className="text-destructive">*</span>
          ) : (
            <span className="font-normal text-muted-foreground">(optional)</span>
          )}
        </label>
        <input
          id="sr-amount"
          name="sr-amount"
          type="text"
          required={wantsFinancial}
          value={draft.amount}
          maxLength={SUPPORT_REQUEST_LIMITS.amount}
          onChange={(e) => setField("amount", e.target.value)}
          onBlur={() => handleBlur("amount")}
          aria-invalid={touched.amount && !!errors.amount}
          aria-describedby={
            touched.amount && errors.amount ? "sr-amount-error sr-amount-hint" : "sr-amount-hint"
          }
          className={inputClass}
          placeholder="e.g. USD 250, or two sets of snorkel gear"
          enterKeyHint="next"
        />
        <p id="sr-amount-hint" className="text-xs text-muted-foreground">
          Required when asking for financial support or sponsorship. A rough figure is fine.
        </p>
        <FieldError id="sr-amount-error" message={touched.amount ? errors.amount : undefined} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sr-request" className={labelClass}>
          What are you asking Sea Saba for? <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <textarea
          id="sr-request"
          name="sr-request"
          rows={2}
          required
          value={draft.request}
          maxLength={SUPPORT_REQUEST_LIMITS.request}
          onChange={(e) => setField("request", e.target.value)}
          onBlur={() => handleBlur("request")}
          aria-invalid={touched.request && !!errors.request}
          aria-describedby={touched.request && errors.request ? "sr-request-error" : undefined}
          className={inputClass}
          placeholder="e.g. Sponsorship of team uniforms for the upcoming season"
        />
        <FieldError id="sr-request-error" message={touched.request ? errors.request : undefined} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sr-description" className={labelClass}>
          About the project or event <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <textarea
          id="sr-description"
          name="sr-description"
          rows={4}
          required
          value={draft.description}
          maxLength={SUPPORT_REQUEST_LIMITS.description}
          onChange={(e) => setField("description", e.target.value)}
          onBlur={() => handleBlur("description")}
          aria-invalid={touched.description && !!errors.description}
          aria-describedby={
            touched.description && errors.description ? "sr-description-error" : "sr-description-limit"
          }
          className={inputClass}
          placeholder="What it is, who's organizing it, and why it matters for Saba."
        />
        <div className="flex items-baseline justify-between gap-3">
          <FieldError id="sr-description-error" message={touched.description ? errors.description : undefined} />
          <p id="sr-description-limit" className="ml-auto shrink-0 text-xs text-muted-foreground">
            {draft.description.length} / {SUPPORT_REQUEST_LIMITS.description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sr-beneficiaries" className={labelClass}>
            Who benefits? <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <input
            id="sr-beneficiaries"
            name="sr-beneficiaries"
            type="text"
            required
            value={draft.beneficiaries}
            maxLength={SUPPORT_REQUEST_LIMITS.beneficiaries}
            onChange={(e) => setField("beneficiaries", e.target.value)}
            onBlur={() => handleBlur("beneficiaries")}
            aria-invalid={touched.beneficiaries && !!errors.beneficiaries}
            aria-describedby={touched.beneficiaries && errors.beneficiaries ? "sr-beneficiaries-error" : undefined}
            className={inputClass}
            placeholder="e.g. About 30 kids aged 8–14"
            enterKeyHint="next"
          />
          <FieldError id="sr-beneficiaries-error" message={touched.beneficiaries ? errors.beneficiaries : undefined} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-timing" className={labelClass}>
            When is it happening? <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <input
            id="sr-timing"
            name="sr-timing"
            type="text"
            required
            value={draft.timing}
            maxLength={SUPPORT_REQUEST_LIMITS.timing}
            onChange={(e) => setField("timing", e.target.value)}
            onBlur={() => handleBlur("timing")}
            aria-invalid={touched.timing && !!errors.timing}
            aria-describedby={touched.timing && errors.timing ? "sr-timing-error" : undefined}
            className={inputClass}
            placeholder="e.g. October 2026, or ongoing"
            enterKeyHint="next"
          />
          <FieldError id="sr-timing-error" message={touched.timing ? errors.timing : undefined} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sr-use" className={labelClass}>
          How would Sea Saba&apos;s contribution be used?{" "}
          <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <textarea
          id="sr-use"
          name="sr-use"
          rows={2}
          required
          value={draft.useOfSupport}
          maxLength={SUPPORT_REQUEST_LIMITS.useOfSupport}
          onChange={(e) => setField("useOfSupport", e.target.value)}
          onBlur={() => handleBlur("useOfSupport")}
          aria-invalid={touched.useOfSupport && !!errors.useOfSupport}
          aria-describedby={touched.useOfSupport && errors.useOfSupport ? "sr-use-error" : undefined}
          className={inputClass}
          placeholder="e.g. Uniforms and league fees for the season (quote available)"
        />
        <FieldError id="sr-use-error" message={touched.useOfSupport ? errors.useOfSupport : undefined} />
      </div>

      {/* Options and send — a looser step than the field rows above. */}
      <div className="space-y-4 pt-3">
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
          <label htmlFor="sr-vendor" className="flex items-start gap-2 text-sm text-foreground">
            <input
              id="sr-vendor"
              name="sr-vendor"
              type="checkbox"
              checked={draft.vendorPayment}
              onChange={(e) => setField("vendorPayment", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary focus:ring-1 focus:ring-primary"
            />
            <span>
              Sea Saba may pay a supplier directly or purchase the needed goods{" "}
              <span className="text-muted-foreground">
                (often the simplest way for us to help, and it keeps everything accountable)
              </span>
            </span>
          </label>
  
          <div className="space-y-1.5">
            <label htmlFor="sr-url" className={labelClass}>
              Link to more info{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="sr-url"
              name="sr-url"
              type="url"
              value={draft.referenceUrl}
              maxLength={SUPPORT_REQUEST_LIMITS.referenceUrl}
              onChange={(e) => setField("referenceUrl", e.target.value)}
              onBlur={() => handleBlur("referenceUrl")}
              aria-invalid={touched.referenceUrl && !!errors.referenceUrl}
              aria-describedby={touched.referenceUrl && errors.referenceUrl ? "sr-url-error" : undefined}
              className={inputClass}
              placeholder="https://… event page, club site, or social post"
              enterKeyHint="next"
            />
            <FieldError id="sr-url-error" message={touched.referenceUrl ? errors.referenceUrl : undefined} />
          </div>
        </div>
  
        <div className="space-y-1.5">
          <label htmlFor="sr-ack" className="flex items-start gap-2 text-sm text-foreground">
            <input
              id="sr-ack"
              name="sr-ack"
              type="checkbox"
              required
              checked={draft.acknowledged}
              onChange={(e) => setField("acknowledged", e.target.checked)}
              onBlur={() => handleBlur("acknowledged")}
              aria-invalid={touched.acknowledged && !!errors.acknowledged}
              aria-describedby={touched.acknowledged && errors.acknowledged ? "sr-ack-error" : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary focus:ring-1 focus:ring-primary"
            />
            <span>
              The information above is accurate, and I understand Sea Saba may ask
              for supporting information before deciding.{" "}
              <span aria-hidden="true" className="text-destructive">*</span>
            </span>
          </label>
          <FieldError id="sr-ack-error" message={touched.acknowledged ? errors.acknowledged : undefined} />
        </div>
  
        {submitState.status === "error" && (
          <div
            ref={statusRef}
            tabIndex={-1}
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/5 p-4 outline-none"
          >
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {submitState.kind === "validation"
                    ? "We couldn't check your request. Please review the highlighted fields and send it again."
                    : submitState.kind === "rate_limited"
                      ? "We're receiving a lot of requests right now. Please wait a moment and send it again."
                      : "We couldn't confirm whether our system saved your request. Your entries are still here; please try sending it again first."}
                </p>
                {submitState.kind !== "validation" && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {submitState.kind === "unavailable"
                      ? "If retries keep failing, the same request can still reach us the old way; sending it again through email or WhatsApp may create a duplicate if the first attempt was saved: "
                      : "If it keeps failing, the same request can still reach us the old way; nothing you typed is lost: "}
                    <a
                      href={buildSupportRequestMailto(draft)}
                      onClick={() =>
                        trackLinkClick("email_click", buildSupportRequestMailto(draft), "Send by email instead", {
                          method: "email_fallback",
                          button_location: "donate_request_form",
                        })
                      }
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      send it by email
                    </a>{" "}
                    or{" "}
                    <a
                      href={buildSupportRequestWhatsAppUrl(draft)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackLinkClick("whatsapp_click", buildSupportRequestWhatsAppUrl(draft), "Send by WhatsApp instead", {
                          method: "whatsapp_fallback",
                          button_location: "donate_request_form",
                        })
                      }
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      send it by WhatsApp
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={submitState.status === "submitting"}
          >
            <Send className="h-4 w-4" />
            {submitState.status === "submitting" ? "Sending..." : "Send request"}
          </Button>
          {/* Pending announcement — the disabled button itself isn't
              announced, so this polite live text carries the state. The region
              stays mounted empty so the text change is announced; inserting a
              live region with content already inside is not reliably spoken.
              Deliberately not role="status": that role belongs to the success
              panel. */}
          <p aria-live="polite" className="sr-only">
            {submitState.status === "submitting"
              ? "Sending your request, please wait."
              : ""}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Your request goes straight to Sea Saba and is saved so our team can track it, and you&apos;ll
          get a reference to keep. Nothing you enter here is sent to analytics or advertisers.
          Prefer to just talk it through? Reach us on WhatsApp or at {CONTACT.email}.
        </p>
      </div>
    </form>
  );
}
