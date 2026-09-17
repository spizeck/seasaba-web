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
} from "@/data/operations";



interface ContactFormProps {
  initialInterest?: string;
}

type SendStatus = "idle" | "sending" | "sent" | "failed";

export function ContactForm({ initialInterest }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState(initialInterest && inquiryFor(initialInterest) ? initialInterest : "");
  const [whatsapp, setWhatsapp] = useState("");
  const [dates, setDates] = useState("");
  const [students, setStudents] = useState("");
  const [certification, setCertification] = useState("");
  const [loggedDives, setLoggedDives] = useState("");
  const [preferredContact, setPreferredContact] = useState("email");
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
    if (inquiry && COURSE_INQUIRIES.some((c) => c.value === value)) {
      setMessage(buildInitialMessage(value));
    }
  }, []);

  const buildPayload = useCallback(() => ({
    name,
    email,
    whatsapp,
    dates,
    students,
    certification,
    loggedDives,
    preferredContact,
    inquiryType,
    message,
    website: honeypot,
  }), [name, email, whatsapp, dates, students, certification, loggedDives, preferredContact, inquiryType, message, honeypot]);

  const buildWhatsAppMessage = useCallback(() => {
    const parts: string[] = [];
    parts.push(`Hi Sea Saba, my name is ${name.trim()}.`);
    if (selectedInquiry) parts.push(`I am interested in ${selectedInquiry.label}.`);
    if (dates.trim()) parts.push(`My planned travel dates are ${dates.trim()}.`);
    if (students.trim()) parts.push(`There are ${students.trim()} student(s).`);
    if (certification.trim()) parts.push(`My certification level is ${certification.trim()}.`);
    if (loggedDives.trim()) parts.push(`I have ${loggedDives.trim()} logged dives.`);
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
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void handleEmail(); }} noValidate>
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
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
            {touched.name && errors.name ? errors.name : "\u00A0"}
          </p>
        </div>

        <div className="space-y-2">
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
            {touched.email && errors.email ? errors.email : "\u00A0"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="whatsapp" className="text-sm font-medium text-foreground">
            WhatsApp phone number
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dates" className="text-sm font-medium text-foreground">
            Planned travel dates
          </label>
          <input
            id="dates"
            name="dates"
            type="text"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. March 10 - 17, 2027"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="students" className="text-sm font-medium text-foreground">
            Number of divers/students
          </label>
          <input
            id="students"
            name="students"
            type="text"
            value={students}
            onChange={(e) => setStudents(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="1"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="certification" className="text-sm font-medium text-foreground">
            Certification level
          </label>
          <input
            id="certification"
            name="certification"
            type="text"
            value={certification}
            onChange={(e) => setCertification(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Open Water, Advanced"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="logged-dives" className="text-sm font-medium text-foreground">
            Logged dives
          </label>
          <input
            id="logged-dives"
            name="logged-dives"
            type="text"
            value={loggedDives}
            onChange={(e) => setLoggedDives(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. 25"
          />
        </div>
      </div>

      <div className="space-y-2">
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
          {touched.inquiryType && errors.inquiryType ? errors.inquiryType : "\u00A0"}
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Preferred contact method</span>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="preferred-contact"
              value="email"
              checked={preferredContact === "email"}
              onChange={() => setPreferredContact("email")}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="preferred-contact"
              value="whatsapp"
              checked={preferredContact === "whatsapp"}
              onChange={() => setPreferredContact("whatsapp")}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            WhatsApp
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => handleBlur("message")}
          aria-invalid={touched.message && !!errors.message}
          aria-describedby={touched.message && errors.message ? "message-error" : undefined}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tell us about your plans, questions, or anything we should know."
        />
        <p id="message-error" className={`min-h-5 text-xs text-destructive${touched.message && errors.message ? "" : " invisible"}`}>
          {touched.message && errors.message ? errors.message : "\u00A0"}
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

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          type="submit"
          variant={preferredContact === "email" ? "default" : "outline"}
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
          className={
            preferredContact === "whatsapp"
              ? "w-full border-green-700 bg-green-700 text-white hover:bg-green-800 hover:text-white sm:w-auto"
              : "w-full border-green-700 text-green-700 hover:bg-green-50 hover:text-green-800 sm:w-auto"
          }
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
