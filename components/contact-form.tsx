"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

interface InquiryType {
  value: string;
  label: string;
  subject: string;
}

const COURSE_INQUIRIES: InquiryType[] = [
  { value: "try-scuba", label: "Try Scuba", subject: "Try Scuba Inquiry" },
  { value: "sdi-open-water", label: "SDI Open Water Diver", subject: "SDI Open Water Diver Inquiry" },
  { value: "sdi-advanced-specialty", label: "SDI Advanced & Specialty Training", subject: "SDI Advanced & Specialty Training Inquiry" },
  { value: "sdi-rescue", label: "SDI Rescue Diver", subject: "SDI Rescue Diver Inquiry" },
  { value: "sdi-divemaster", label: "SDI Divemaster", subject: "SDI Divemaster Inquiry" },
  { value: "tdi-technical", label: "TDI Technical Diving", subject: "TDI Technical Diving Inquiry" },
];

const GENERAL_INQUIRIES: InquiryType[] = [
  { value: "general", label: "General Question", subject: "General Question" },
  { value: "book-diving", label: "Book Diving", subject: "Book Diving Inquiry" },
  { value: "course-inquiry", label: "Course Inquiry", subject: "Course Inquiry" },
  { value: "private-charter", label: "Private Charter", subject: "Private Charter Inquiry" },
  { value: "group-travel", label: "Group Travel", subject: "Group Travel Inquiry" },
  { value: "transportation", label: "Transportation", subject: "Transportation Inquiry" },
  { value: "other", label: "Other", subject: "Other Inquiry" },
];

const ALL_INQUIRIES: InquiryType[] = [...COURSE_INQUIRIES, ...GENERAL_INQUIRIES];

const EMAIL_TO = "info@seasaba.com";
const WHATSAPP_NUMBER = "5994162246";

interface ContactFormProps {
  initialInterest?: string;
}

export function ContactForm({ initialInterest }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState(initialInterest && ALL_INQUIRIES.some((i) => i.value === initialInterest) ? initialInterest : "");
  const [whatsapp, setWhatsapp] = useState("");
  const [dates, setDates] = useState("");
  const [students, setStudents] = useState("");
  const [certification, setCertification] = useState("");
  const [loggedDives, setLoggedDives] = useState("");
  const [preferredContact, setPreferredContact] = useState("email");
  const [message, setMessage] = useState(() => buildInitialMessage(initialInterest));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const selectedInquiry = useMemo(
    () => ALL_INQUIRIES.find((i) => i.value === inquiryType),
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
    const inquiry = ALL_INQUIRIES.find((i) => i.value === value);
    if (inquiry && COURSE_INQUIRIES.some((c) => c.value === value)) {
      setMessage(buildInitialMessage(value));
    }
  }, []);

  const buildEmailBody = useCallback(() => {
    const lines: string[] = [];
    lines.push(`Name: ${name.trim()}`);
    lines.push(`Email: ${email.trim()}`);
    if (selectedInquiry) lines.push(`Inquiry: ${selectedInquiry.label}`);
    if (whatsapp.trim()) lines.push(`WhatsApp: ${whatsapp.trim()}`);
    if (dates.trim()) lines.push(`Planned travel dates: ${dates.trim()}`);
    if (students.trim()) lines.push(`Number of students: ${students.trim()}`);
    if (certification.trim()) lines.push(`Certification level: ${certification.trim()}`);
    if (loggedDives.trim()) lines.push(`Logged dives: ${loggedDives.trim()}`);
    lines.push(`Preferred contact method: ${preferredContact === "whatsapp" ? "WhatsApp" : "Email"}`);
    lines.push("");
    lines.push(message.trim() || "No additional message provided.");
    return lines.join("\n");
  }, [name, email, selectedInquiry, whatsapp, dates, students, certification, loggedDives, preferredContact, message]);

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

  const handleEmail = useCallback(() => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, email: true, inquiryType: true, message: true });
    if (Object.keys(validationErrors).length > 0) return;

    const subject = selectedInquiry ? selectedInquiry.subject : "Contact Inquiry";
    const body = buildEmailBody();
    window.location.href = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [validate, selectedInquiry, buildEmailBody]);

  const handleWhatsApp = useCallback(() => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, email: true, inquiryType: true, message: true });
    if (Object.keys(validationErrors).length > 0) return;

    const text = buildWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }, [validate, buildWhatsAppMessage]);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()} noValidate>
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
          {touched.name && errors.name && (
            <p id="name-error" className="text-xs text-destructive">
              {errors.name}
            </p>
          )}
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
          {touched.email && errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
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
        {touched.inquiryType && errors.inquiryType && (
          <p id="inquiry-type-error" className="text-xs text-destructive">
            {errors.inquiryType}
          </p>
        )}
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
        {touched.message && errors.message && (
          <p id="message-error" className="text-xs text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          type="button"
          variant={preferredContact === "email" ? "default" : "outline"}
          onClick={handleEmail}
          className="w-full sm:w-auto"
          aria-label="Send inquiry by email"
        >
          <Mail className="h-4 w-4" />
          Email Sea Saba
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleWhatsApp}
          className={
            preferredContact === "whatsapp"
              ? "w-full border-green-600 bg-green-600 text-white hover:bg-green-700 hover:text-white sm:w-auto"
              : "w-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 sm:w-auto"
          }
          aria-label="Send inquiry by WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp Sea Saba
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Email is best for detailed trip planning. WhatsApp is great for quick questions.
      </p>
    </form>
  );
}

function buildInitialMessage(interest?: string): string {
  const inquiry = COURSE_INQUIRIES.find((i) => i.value === interest);
  if (!inquiry) return "";
  return `Hi Sea Saba, I am interested in ${inquiry.label}. Please send me more information about availability, schedule, and pricing.`;
}
