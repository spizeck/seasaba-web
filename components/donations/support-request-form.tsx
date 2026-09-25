"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MailCheck, MessageCircle } from "lucide-react";
import { trackEvent, trackLinkClick } from "@/lib/analytics";
import { CONTACT } from "@/lib/constants";
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

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const labelClass = "text-sm font-medium text-foreground";

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className={`min-h-5 text-xs text-destructive${message ? "" : " invisible"}`}>
      {message || " "}
    </p>
  );
}

/**
 * "Request Support from Sea Saba" form (#171). Same submission mechanism as
 * the contact form: the visitor's own email app (or WhatsApp) sends the
 * request, so Respond.io files it under the visitor's real address — no
 * shared-sender collapse, no server-side submission, no third-party form
 * provider. Analytics receive only generic started/submitted events; field
 * contents never leave the page except in the visitor's own handoff.
 */
export function SupportRequestForm() {
  const [draft, setDraft] = useState<SupportRequestDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<SupportRequestErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // The mailto: href built for the most recent handoff — rendered as a
  // "reopen" link in the notice so a missed protocol handoff is retryable.
  const [handoffHref, setHandoffHref] = useState("");
  const handoffRef = useRef<HTMLDivElement>(null);
  // Per-method duplicate-click guards — the window is short so deliberate
  // resubmission (and switching between email and WhatsApp) still works.
  const lastEmailAt = useRef(0);
  const lastWhatsAppAt = useRef(0);
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
    return Object.keys(validationErrors).length === 0;
  }, [draft, touchAll]);

  // Client-email handoff: build the structured request and open it in the
  // visitor's own email app via mailto:. The visitor reviews and sends it
  // themselves, so their real address reaches info@seasaba.com and
  // Respond.io attaches the request to the correct contact — a shared
  // server-side sender collapsed every visitor into one contact (#104).
  const handleEmail = useCallback(() => {
    if (!validateAll()) return;
    if (Date.now() - lastEmailAt.current < 1000) return;
    lastEmailAt.current = Date.now();

    const href = buildSupportRequestMailto(draft);
    const eventParams = { method: "email", button_location: "donate_request_form" };
    // Handoff events only — no request details, names, or amounts.
    trackEvent("donation_request_submitted", eventParams);
    trackLinkClick("email_click", href, "Continue to Email", eventParams);
    setHandoffHref(href);
    window.open(href, "_self");
    requestAnimationFrame(() => handoffRef.current?.focus());
  }, [validateAll, draft]);

  const handleWhatsApp = useCallback(() => {
    if (!validateAll()) return;
    if (Date.now() - lastWhatsAppAt.current < 1000) return;
    lastWhatsAppAt.current = Date.now();

    const href = buildSupportRequestWhatsAppUrl(draft);
    const eventParams = { method: "whatsapp", button_location: "donate_request_form" };
    trackEvent("donation_request_submitted", eventParams);
    trackLinkClick("whatsapp_click", href, "WhatsApp Sea Saba", eventParams);
    window.open(href, "_blank", "noopener,noreferrer");
  }, [validateAll, draft]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleEmail();
      }}
      onFocusCapture={markStarted}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sr-name" className={labelClass}>
            Your name <span className="text-destructive">*</span>
          </label>
          <input
            id="sr-name"
            name="sr-name"
            type="text"
            value={draft.name}
            maxLength={SUPPORT_REQUEST_LIMITS.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? "sr-name-error" : undefined}
            className={inputClass}
            placeholder="Your full name"
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
            value={draft.organization}
            maxLength={SUPPORT_REQUEST_LIMITS.organization}
            onChange={(e) => setField("organization", e.target.value)}
            className={inputClass}
            placeholder="e.g. Saba youth football club"
          />
          <FieldError id="sr-organization-error" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sr-email" className={labelClass}>
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="sr-email"
            name="sr-email"
            type="email"
            value={draft.email}
            maxLength={SUPPORT_REQUEST_LIMITS.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "sr-email-error" : undefined}
            className={inputClass}
            placeholder="you@example.com"
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
            value={draft.phone}
            maxLength={SUPPORT_REQUEST_LIMITS.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={inputClass}
            placeholder="+599 416 0000"
          />
          <FieldError id="sr-phone-error" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sr-category" className={labelClass}>
          Category <span className="text-destructive">*</span>
        </label>
        <select
          id="sr-category"
          name="sr-category"
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
          Type of support needed <span className="text-destructive">*</span>{" "}
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
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary focus:ring-1 focus:ring-primary"
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
            <span className="text-destructive">*</span>
          ) : (
            <span className="font-normal text-muted-foreground">(optional)</span>
          )}
        </label>
        <input
          id="sr-amount"
          name="sr-amount"
          type="text"
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
        />
        <p id="sr-amount-hint" className="text-xs text-muted-foreground">
          Required when asking for a financial contribution — a rough figure is fine.
        </p>
        <FieldError id="sr-amount-error" message={touched.amount ? errors.amount : undefined} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sr-request" className={labelClass}>
          What are you asking Sea Saba for? <span className="text-destructive">*</span>
        </label>
        <textarea
          id="sr-request"
          name="sr-request"
          rows={2}
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
          About the project or event <span className="text-destructive">*</span>
        </label>
        <textarea
          id="sr-description"
          name="sr-description"
          rows={4}
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
          <p id="sr-description-limit" className="shrink-0 text-xs text-muted-foreground">
            {draft.description.length} / {SUPPORT_REQUEST_LIMITS.description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sr-beneficiaries" className={labelClass}>
            Who benefits? <span className="text-destructive">*</span>
          </label>
          <input
            id="sr-beneficiaries"
            name="sr-beneficiaries"
            type="text"
            value={draft.beneficiaries}
            maxLength={SUPPORT_REQUEST_LIMITS.beneficiaries}
            onChange={(e) => setField("beneficiaries", e.target.value)}
            onBlur={() => handleBlur("beneficiaries")}
            aria-invalid={touched.beneficiaries && !!errors.beneficiaries}
            aria-describedby={touched.beneficiaries && errors.beneficiaries ? "sr-beneficiaries-error" : undefined}
            className={inputClass}
            placeholder="e.g. About 30 kids aged 8–14"
          />
          <FieldError id="sr-beneficiaries-error" message={touched.beneficiaries ? errors.beneficiaries : undefined} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sr-timing" className={labelClass}>
            When is it happening? <span className="text-destructive">*</span>
          </label>
          <input
            id="sr-timing"
            name="sr-timing"
            type="text"
            value={draft.timing}
            maxLength={SUPPORT_REQUEST_LIMITS.timing}
            onChange={(e) => setField("timing", e.target.value)}
            onBlur={() => handleBlur("timing")}
            aria-invalid={touched.timing && !!errors.timing}
            aria-describedby={touched.timing && errors.timing ? "sr-timing-error" : undefined}
            className={inputClass}
            placeholder="e.g. October 2026, or ongoing"
          />
          <FieldError id="sr-timing-error" message={touched.timing ? errors.timing : undefined} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sr-use" className={labelClass}>
          How would Sea Saba&apos;s contribution be used?{" "}
          <span className="text-destructive">*</span>
        </label>
        <textarea
          id="sr-use"
          name="sr-use"
          rows={2}
          value={draft.useOfSupport}
          maxLength={SUPPORT_REQUEST_LIMITS.useOfSupport}
          onChange={(e) => setField("useOfSupport", e.target.value)}
          onBlur={() => handleBlur("useOfSupport")}
          aria-invalid={touched.useOfSupport && !!errors.useOfSupport}
          aria-describedby={touched.useOfSupport && errors.useOfSupport ? "sr-use-error" : undefined}
          className={inputClass}
          placeholder="e.g. Uniforms and league fees for the season — quote available"
        />
        <FieldError id="sr-use-error" message={touched.useOfSupport ? errors.useOfSupport : undefined} />
      </div>

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
              — often the simplest way for us to help, and it keeps everything accountable.
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
            <span className="text-destructive">*</span>
          </span>
        </label>
        <FieldError id="sr-ack-error" message={touched.acknowledged ? errors.acknowledged : undefined} />
      </div>

      {handoffHref && (
        <div
          ref={handoffRef}
          tabIndex={-1}
          role="status"
          className="rounded-md border border-primary/30 bg-primary/5 p-4 outline-none"
        >
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Your email app should open with your request ready to send.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Review it and press Send — it goes to {CONTACT.email} from your own email address. If
                nothing opened,{" "}
                <a href={handoffHref} className="font-medium text-primary underline-offset-2 hover:underline">
                  try opening it again
                </a>{" "}
                or email us directly at{" "}
                <a href={`mailto:${CONTACT.email}`} className="font-medium text-primary underline-offset-2 hover:underline">
                  {CONTACT.email}
                </a>
                . You can edit anything above first — your entries are kept.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <Button type="submit" className="w-full sm:w-auto" aria-label="Continue to email">
          <Mail className="h-4 w-4" />
          Continue to Email
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleWhatsApp}
          className="w-full border-green-700 text-green-700 hover:bg-green-50 hover:text-green-800 sm:w-auto"
          aria-label="Send request by WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp Sea Saba
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        The form opens your email app (or WhatsApp) with the request ready to send — nothing is
        stored on this website, and you can attach supporting documents in your email app before
        sending. Prefer to just talk it through? Reach us on WhatsApp or at {CONTACT.email}.
      </p>
    </form>
  );
}
