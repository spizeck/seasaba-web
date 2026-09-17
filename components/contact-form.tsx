"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { trackEvent, trackLinkClick } from "@/lib/analytics";
import { CONTACT } from "@/lib/constants";
import {
  COURSE_INQUIRIES,
  GENERAL_INQUIRIES,
  inquiryFor,
  type ContactField,
} from "@/data/operations";



interface ContactFormProps {
  initialInterest?: string;
}

type SendStatus = "idle" | "sending" | "sent" | "failed";

/** Payload key each contextual field maps to (server-side field name). */
const PAYLOAD_KEY: Record<ContactField, string> = {
  whatsapp: "whatsapp",
  dates: "dates",
  partySize: "students",
  certification: "certification",
  loggedDives: "loggedDives",
};

const FIELD_META: Record<ContactField, { id: string; label: string; type: string; placeholder: string }> = {
  whatsapp: { id: "whatsapp", label: "WhatsApp number", type: "tel", placeholder: "+1 234 567 8900" },
  dates: { id: "dates", label: "Planned travel dates", type: "text", placeholder: "e.g. March 10 - 17, 2027" },
  partySize: { id: "students", label: "Number of people", type: "text", placeholder: "1" },
  certification: { id: "certification", label: "Certification level", type: "text", placeholder: "e.g. Open Water, Advanced" },
  loggedDives: { id: "logged-dives", label: "Logged dives", type: "text", placeholder: "e.g. 25" },
};

export function ContactForm({ initialInterest }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState(initialInterest && inquiryFor(initialInterest) ? initialInterest : "");
  const [whatsapp, setWhatsapp] = useState("");
  // Explicit visitor opt-in only: supplying a number is alternate contact
  // info, not consent to WhatsApp-first outreach (WhatsApp has template
  // restrictions, so Coral/staff must not be told it's preferred by default).
  const [preferWhatsapp, setPreferWhatsapp] = useState(false);
  const [dates, setDates] = useState("");
  const [students, setStudents] = useState("");
  const [certification, setCertification] = useState("");
  const [loggedDives, setLoggedDives] = useState("");
  const [message, setMessage] = useState(() => buildInitialMessage(initialInterest));
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [sendError, setSendError] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  // Idempotency: the server forwards this key to Resend, which deduplicates
  // retries within 24h. Reused only while the payload is unchanged — editing
  // any field after a failed attempt generates a fresh key so the new content
  // is never suppressed by the earlier attempt's key.
  const submission = useRef<{ key: string; payload: string } | null>(null);
  // Guards against a rapid second click opening duplicate WhatsApp tabs; the
  // window is short so deliberate resubmission still works.
  const lastWhatsAppAt = useRef(0);

  const selectedInquiry = useMemo(
    () => inquiryFor(inquiryType),
    [inquiryType]
  );

  const contextualValues: Record<ContactField, string> = {
    whatsapp,
    dates,
    partySize: students,
    certification,
    loggedDives,
  };

  const contextualSetters: Record<ContactField, (value: string) => void> = {
    // Clearing the number must also drop any WhatsApp preference: a checked
    // box with no number is a stale preference that must never be submitted.
    whatsapp: (v) => {
      setWhatsapp(v);
      if (!v.trim()) setPreferWhatsapp(false);
    },
    dates: setDates,
    partySize: setStudents,
    certification: setCertification,
    loggedDives: setLoggedDives,
  };

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Please enter your name.";
    if (!email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!inquiryType) nextErrors.inquiryType = "Please select an inquiry type.";
    if (!message.trim()) nextErrors.message = "Please enter a message.";
    return nextErrors;
  }, [name, email, inquiryType, message]);

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors(validate());
    },
    [validate]
  );

  const handleInquiryChange = useCallback((value: string) => {
    setInquiryType(value);
    const inquiry = inquiryFor(value);
    if (!inquiry) return;
    // Fields the new inquiry doesn't use are dropped from state entirely so
    // stale values (e.g. certification after switching to Sunset Cruise) can
    // never leak into a later submission.
    const keep = new Set<ContactField>(inquiry.fields);
    const clear = (field: ContactField, set: (v: string) => void) => {
      if (keep.has(field)) return;
      set("");
      setErrors((prev) => {
        const key = PAYLOAD_KEY[field];
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };
    clear("whatsapp", (v) => { setWhatsapp(v); if (!v.trim()) setPreferWhatsapp(false); });
    clear("dates", setDates);
    clear("partySize", setStudents);
    clear("certification", setCertification);
    clear("loggedDives", setLoggedDives);
    if (COURSE_INQUIRIES.some((c) => c.value === value)) {
      setMessage(buildInitialMessage(value));
    }
  }, []);

  const buildPayload = useCallback(() => {
    // Only fields relevant to the selected inquiry are submitted; anything
    // else is sent empty so the server/email never sees stale values.
    const keep = new Set<ContactField>(selectedInquiry?.fields ?? []);
    return {
      name,
      email,
      whatsapp: keep.has("whatsapp") ? whatsapp : "",
      dates: keep.has("dates") ? dates : "",
      students: keep.has("partySize") ? students : "",
      certification: keep.has("certification") ? certification : "",
      loggedDives: keep.has("loggedDives") ? loggedDives : "",
      // Explicit opt-in only: a submitted WhatsApp number is alternate
      // contact info; WhatsApp is "preferred" solely when the visitor
      // checked the box AND a number exists — and never when the field
      // itself isn't applicable to the selected inquiry.
      preferredContact:
        keep.has("whatsapp") && whatsapp.trim() && preferWhatsapp ? "whatsapp" : "email",
      inquiryType,
      message,
      website: honeypot,
    };
  }, [selectedInquiry, name, email, whatsapp, preferWhatsapp, dates, students, certification, loggedDives, inquiryType, message, honeypot]);

  const buildWhatsAppMessage = useCallback(() => {
    const keep = new Set<ContactField>(selectedInquiry?.fields ?? []);
    const parts: string[] = [];
    parts.push(`Hi Sea Saba, my name is ${name.trim()}.`);
    if (selectedInquiry) parts.push(`I am interested in ${selectedInquiry.label}.`);
    if (keep.has("dates") && dates.trim()) parts.push(`My planned travel dates are ${dates.trim()}.`);
    if (keep.has("partySize") && students.trim()) {
      parts.push(`${selectedInquiry?.partyLabel ?? "Group size"}: ${students.trim()}.`);
    }
    if (keep.has("certification") && certification.trim()) parts.push(`My certification level is ${certification.trim()}.`);
    if (keep.has("loggedDives") && loggedDives.trim()) parts.push(`I have ${loggedDives.trim()} logged dives.`);
    if (message.trim()) parts.push(message.trim());
    return parts.join(" ");
  }, [name, selectedInquiry, dates, students, certification, loggedDives, message]);

  const handleEmail = useCallback(async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, email: true, inquiryType: true, message: true });
    if (Object.keys(validationErrors).length > 0 || sendStatus === "sending") return;

    const payload = buildPayload();
    const serialized = JSON.stringify({ ...payload, website: undefined });
    if (!submission.current || serialized !== submission.current.payload) {
      submission.current = { key: crypto.randomUUID(), payload: serialized };
    }

    setSendStatus("sending");
    setSendError("");
    const eventParams = { method: "email", inquiry_type: selectedInquiry?.label || "General", button_location: "contact_form" };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submissionId: submission.current.key }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        errors?: Record<string, string>;
      };
      if (response.ok && body.ok) {
        setSendStatus("sent");
        trackEvent("contact_form_submit", eventParams);
        requestAnimationFrame(() => successRef.current?.focus());
      } else {
        setSendStatus("failed");
        if (body.errors) {
          setErrors((prev) => ({ ...prev, ...body.errors }));
          setTouched({ name: true, email: true, inquiryType: true, message: true });
        }
        setSendError(typeof body.error === "string" && body.error ? body.error : "Your message could not be sent right now. Please try again, or reach us on WhatsApp.");
        trackEvent("contact_form_error", eventParams);
      }
    } catch {
      setSendStatus("failed");
      setSendError("Your message could not be sent right now. Please check your connection and try again, or reach us on WhatsApp.");
      trackEvent("contact_form_error", eventParams);
    }
  }, [validate, sendStatus, buildPayload, selectedInquiry]);

  const handleWhatsApp = useCallback(() => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, email: true, inquiryType: true, message: true });
    if (Object.keys(validationErrors).length > 0) return;
    if (Date.now() - lastWhatsAppAt.current < 1000) return;
    lastWhatsAppAt.current = Date.now();

    const text = buildWhatsAppMessage();
    const whatsappHref = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;
    const eventParams = { method: "whatsapp", inquiry_type: selectedInquiry?.label || "General", button_location: "contact_form" };
    trackEvent("contact_form_submit", eventParams);
    trackLinkClick("whatsapp_click", whatsappHref, "WhatsApp Sea Saba", eventParams);
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  }, [validate, selectedInquiry, buildWhatsAppMessage]);

  if (sendStatus === "sent") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-lg border border-primary/30 bg-primary/5 p-6 outline-none"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Your inquiry has been sent.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Thank you{selectedInquiry ? ` — our team will reply about ${selectedInquiry.label}` : ""} as soon as
              possible. For anything urgent, reach us on{" "}
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void handleEmail(); }} noValidate>
      {/* Honeypot: hidden from humans, only bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
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
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? "name-error" : undefined}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Your full name"
          />
          <p id="name-error" className={`min-h-5 text-xs text-destructive${touched.name && errors.name ? "" : " invisible"}`}>
            {touched.name && errors.name ? errors.name : " "}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
          <p id="email-error" className={`min-h-5 text-xs text-destructive${touched.email && errors.email ? "" : " invisible"}`}>
            {touched.email && errors.email ? errors.email : " "}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="inquiry-type" className="text-sm font-medium text-foreground">
          Inquiry Type <span className="text-destructive">*</span>
        </label>
        <select
          id="inquiry-type"
          name="inquiry-type"
          value={inquiryType}
          onChange={(e) => handleInquiryChange(e.target.value)}
          onBlur={() => handleBlur("inquiryType")}
          aria-invalid={touched.inquiryType && !!errors.inquiryType}
          aria-describedby={touched.inquiryType && errors.inquiryType ? "inquiry-type-error" : undefined}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>
            Select an inquiry type
          </option>
          <optgroup label="Courses">
            {COURSE_INQUIRIES.map((inquiry) => (
              <option key={inquiry.value} value={inquiry.value}>
                {inquiry.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="General">
            {GENERAL_INQUIRIES.map((inquiry) => (
              <option key={inquiry.value} value={inquiry.value}>
                {inquiry.label}
              </option>
            ))}
          </optgroup>
        </select>
        <p id="inquiry-type-error" className={`min-h-5 text-xs text-destructive${touched.inquiryType && errors.inquiryType ? "" : " invisible"}`}>
          {touched.inquiryType && errors.inquiryType ? errors.inquiryType : " "}
        </p>
      </div>

      {/* Contextual fields: driven by the inquiry's `fields` list in
          data/operations.ts — nothing here is hardcoded per inquiry. */}
      {selectedInquiry && selectedInquiry.fields.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {selectedInquiry.fields.map((field) => {
            const meta = FIELD_META[field];
            const errorKey = PAYLOAD_KEY[field];
            const error = errors[errorKey];
            return (
              <div key={field} className="space-y-1.5">
                <label htmlFor={meta.id} className="text-sm font-medium text-foreground">
                  {field === "partySize" ? (selectedInquiry.partyLabel ?? meta.label) : meta.label}{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id={meta.id}
                  name={meta.id}
                  type={meta.type}
                  value={contextualValues[field]}
                  onChange={(e) => contextualSetters[field](e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${meta.id}-error` : undefined}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={meta.placeholder}
                />
                {field === "whatsapp" && (
                  <label
                    htmlFor="whatsapp-prefer"
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <input
                      id="whatsapp-prefer"
                      name="whatsapp-prefer"
                      type="checkbox"
                      checked={preferWhatsapp}
                      onChange={(e) => setPreferWhatsapp(e.target.checked)}
                      className="h-4 w-4 shrink-0 rounded border-border accent-primary focus:ring-1 focus:ring-primary"
                    />
                    I prefer to be contacted on WhatsApp
                  </label>
                )}
                <p id={`${meta.id}-error`} className={`min-h-5 text-xs text-destructive${error ? "" : " invisible"}`}>
                  {error || " "}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => handleBlur("message")}
          aria-invalid={touched.message && !!errors.message}
          aria-describedby={touched.message && errors.message ? "message-error" : undefined}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tell us about your plans, questions, or anything we should know."
        />
        <p id="message-error" className={`min-h-5 text-xs text-destructive${touched.message && errors.message ? "" : " invisible"}`}>
          {touched.message && errors.message ? errors.message : " "}
        </p>
      </div>

      {sendStatus === "failed" && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm text-foreground">{sendError}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your message above is unchanged — nothing was lost. You can also email us directly at{" "}
            <a href={`mailto:${CONTACT.email}`} className="font-medium text-primary underline-offset-2 hover:underline">
              {CONTACT.email}
            </a>
            .
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <Button
          type="submit"
          disabled={sendStatus === "sending"}
          aria-busy={sendStatus === "sending"}
          className="w-full sm:w-auto"
          aria-label="Send inquiry by email"
        >
          <Mail className="h-4 w-4" />
          {sendStatus === "sending" ? "Sending…" : "Send Inquiry"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleWhatsApp}
          disabled={sendStatus === "sending"}
          className="w-full border-green-700 text-green-700 hover:bg-green-50 hover:text-green-800 sm:w-auto"
          aria-label="Send inquiry by WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp Sea Saba
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        We reply by email — typically within a day. WhatsApp is great for quick questions.
      </p>
    </form>
  );
}

function buildInitialMessage(interest?: string): string {
  const inquiry = COURSE_INQUIRIES.find((i) => i.value === interest);
  if (!inquiry) return "";
  return `Hi Sea Saba, I am interested in ${inquiry.label}. Please send me more information about availability, schedule, and pricing.`;
}
