"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
  newIdempotencyKey,
  validateNewsletterDraft,
  type NewsletterAttribution,
  type NewsletterAudience,
} from "@/lib/newsletter/contract";

interface NewsletterSignupFormProps {
  /** Campaign attribution parsed from the page URL (DEMA 2026 etc.). */
  attribution: NewsletterAttribution;
}

/* Inputs render at text-base (16px) below lg so iOS Safari doesn't auto-zoom
   on focus; desktop keeps the denser text-sm. */
const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:text-sm";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function NewsletterSignupForm({
  attribution,
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState(() => {
    // Footer handoff prefill arrives via sessionStorage (never the URL).
    // A lazy initializer reads it before first paint — no remount race —
    // and the mount effect below clears the one-shot marker. The input
    // carries suppressHydrationWarning for the intentional client-only
    // initial value.
    if (typeof window === "undefined") return "";
    try {
      return sessionStorage.getItem("nl-prefill-email") ?? "";
    } catch {
      return "";
    }
  });
  const [individual, setIndividual] = useState(
    attribution.audience === "individual"
  );
  const [group, setGroup] = useState(attribution.audience === "group");
  const [organization, setOrganization] = useState("");
  const [consent, setConsent] = useState(false);
  // Honeypot — invisible and unreachable to humans.
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  // One idempotency key per form mount: a retried identical draft replays
  // server-side instead of producing a second confirmation email.
  const idempotencyKey = useRef(newIdempotencyKey());
  const viewTracked = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  const attributionParams = useMemo(
    () => ({
      campaign: attribution.campaign ?? undefined,
      source: attribution.source ?? undefined,
      placement: attribution.placement ?? undefined,
      audience: attribution.audience ?? undefined,
    }),
    [attribution]
  );

  // Page view fires once on mount — the campaign params travel with it so
  // signup funnel reports can segment by acquisition link.
  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackEvent("newsletter_signup_view", attributionParams);
    // Clear the one-shot prefill marker — the value itself was already
    // claimed by the lazy state initializer.
    try {
      sessionStorage.removeItem("nl-prefill-email");
    } catch {
      // Storage unavailable.
    }
  }, [attributionParams]);

  useEffect(() => {
    if (state.kind === "success") successRef.current?.focus();
  }, [state.kind]);

  const audiences: NewsletterAudience[] = [
    ...(individual ? (["individual"] as const) : []),
    ...(group ? (["group"] as const) : []),
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === "submitting") return;

    const draft = { email, audiences, organization, consent };
    const errs = validateNewsletterDraft(draft);
    setErrors(errs);
    trackEvent("newsletter_signup_submit", attributionParams);
    if (Object.keys(errs).length > 0) {
      setState({ kind: "idle" });
      return;
    }

    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subscription: {
            email,
            audiences,
            organization,
            consent,
            consentVersion: NEWSLETTER_CONSENT_VERSION,
            consentText: NEWSLETTER_CONSENT_TEXT,
          },
          attribution,
          idempotencyKey: idempotencyKey.current,
          submittedAt: new Date().toISOString(),
          website,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        kind?: string;
        fields?: Record<string, string>;
      } | null;

      if (res.ok && body?.ok) {
        // Accepted signup — confirmation still pending; do NOT claim a
        // confirmed subscription here.
        trackEvent("newsletter_signup_success", attributionParams);
        setState({ kind: "success" });
        return;
      }

      const fields = body?.fields ?? {};
      if (body?.kind === "validation") {
        setErrors((prev) => ({ ...prev, ...fields }));
        trackEvent("newsletter_signup_error", {
          ...attributionParams,
          reason: "validation",
        });
        setState({ kind: "idle" });
        return;
      }
      trackEvent("newsletter_signup_error", {
        ...attributionParams,
        reason: body?.kind ?? "unknown",
      });
      setState({
        kind: "error",
        message:
          body?.kind === "rate_limited"
            ? "Too many attempts. Please try again in a minute."
            : "Something went wrong on our side. Please try again, or email us at info@seasaba.com.",
      });
    } catch {
      trackEvent("newsletter_signup_error", {
        ...attributionParams,
        reason: "network",
      });
      setState({
        kind: "error",
        message:
          "We couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  if (state.kind === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-lg border border-border/60 bg-card p-6 focus:outline-none"
      >
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-semibold text-foreground">Check your inbox</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a confirmation email to <strong>{email}</strong>. Click the
              link inside to finish subscribing. You won&apos;t receive the
              newsletter until you confirm.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot — off-screen, unreachable by keyboard, rejected server-side. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="nl-website">Website</label>
        <input
          id="nl-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="nl-email" className="block text-sm font-medium text-foreground">
          Email address <span aria-hidden="true">*</span>
        </label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${fieldClass} mt-1.5`}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "nl-email-error" : undefined}
          suppressHydrationWarning
        />
        {errors.email && (
          <p id="nl-email-error" role="alert" className="mt-1.5 text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          I&apos;m signing up as <span aria-hidden="true">*</span>
        </legend>
        <div className="mt-2 space-y-2">
          <label className="flex items-start gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={individual}
              onChange={(e) => setIndividual(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
            />
            <span>
              <strong>Individual Diver / Traveler</strong>
              <span className="block text-muted-foreground">
                Dive travel tips, Saba conditions, and trip-planning news.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={group}
              onChange={(e) => setGroup(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
            />
            <span>
              <strong>Group Organizer / Travel Professional</strong>
              <span className="block text-muted-foreground">
                Group bookings, trade rates, and partner updates.
              </span>
            </span>
          </label>
        </div>
        {errors.audiences && (
          <p role="alert" className="mt-1.5 text-sm text-destructive">
            {errors.audiences}
          </p>
        )}
      </fieldset>

      {group && (
        <div>
          <label htmlFor="nl-organization" className="block text-sm font-medium text-foreground">
            Organization / company <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="nl-organization"
            name="organization"
            type="text"
            autoComplete="organization"
            maxLength={120}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={`${fieldClass} mt-1.5`}
            aria-invalid={Boolean(errors.organization)}
            aria-describedby={errors.organization ? "nl-organization-error" : undefined}
          />
          {errors.organization && (
            <p id="nl-organization-error" role="alert" className="mt-1.5 text-sm text-destructive">
              {errors.organization}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="flex items-start gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "nl-consent-error" : "nl-consent-note"}
          />
          <span>{NEWSLETTER_CONSENT_TEXT}</span>
        </label>
        <p id="nl-consent-note" className="mt-1.5 text-xs text-muted-foreground">
          We&apos;ll email you a confirmation link first. You&apos;re only
          subscribed once you click it. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            privacy policy
          </Link>
          .
        </p>
        {errors.consent && (
          <p id="nl-consent-error" role="alert" className="mt-1.5 text-sm text-destructive">
            {errors.consent}
          </p>
        )}
      </div>

      {state.kind === "error" && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={state.kind === "submitting"} className="w-full sm:w-auto">
        {state.kind === "submitting" ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
