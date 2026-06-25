import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { FindSeaSaba } from "@/components/find-sea-saba";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/constants";
import { MapPin, Phone, MessageCircle, Mail, Luggage } from "lucide-react";

export const metadata = createMetadata({
  title: "Contact",
  description:
    "Get in touch with Sea Saba. Questions about diving, courses, or booking. We are here to help.",
  path: "/contact",
});

interface ContactPageProps {
  searchParams: Promise<{ interest?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { interest } = await searchParams;

  const inquiryLabels: Record<string, string> = {
    "try-scuba": "Try Scuba Inquiry",
    "sdi-open-water": "SDI Open Water Diver Inquiry",
    "sdi-advanced-specialty": "SDI Advanced & Specialty Training Inquiry",
    "sdi-rescue": "SDI Rescue Diver Inquiry",
    "sdi-divemaster": "SDI Divemaster Inquiry",
    "tdi-technical": "TDI Technical Diving Inquiry",
  };

  const isCourseInquiry = interest && inquiryLabels[interest];
  const headline = isCourseInquiry ? inquiryLabels[interest] : "Contact Us";
  const subtitle = isCourseInquiry
    ? "Tell us a little about your plans and our team will help you choose the best schedule."
    : "Have questions about diving in Saba, course availability, or anything else? We are happy to help.";

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {headline}
      </h1>

      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {subtitle}
      </p>

      <div className="mt-8 rounded-lg border border-border/60 bg-card p-6">
        <ContactForm initialInterest={interest} />
      </div>

      {/* Contact Info + Find Sea Saba */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">

        {/* Contact Information */}
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-foreground">Sea Saba Dive Center</p>
              {CONTACT.address.displayLines.map((line) => (
                <p key={line} className="text-muted-foreground">{line}</p>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Phone</p>
                <a
                  href={CONTACT.phoneHref}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {CONTACT.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">WhatsApp</p>
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {CONTACT.whatsapp}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Email</p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {CONTACT.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Find Sea Saba map card */}
        <FindSeaSaba />

      </div>

      {/* Planning Your Trip */}
      <div className="mt-6 rounded-xl border border-border/40 bg-muted/20 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Luggage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Planning Your Trip?</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Looking for flights, ferry schedules, accommodations, rental cars, weather, FAQs, or travel insurance?
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Button asChild variant="destructive" className="font-semibold">
              <Link href="/plan-your-trip">Plan Your Trip →</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
