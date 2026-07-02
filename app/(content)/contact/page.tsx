import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { FindSeaSaba } from "@/components/find-sea-saba";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/constants";
import { MapPin, Phone, MessageCircle, Mail, Luggage, ChevronRight } from "lucide-react";

interface ContactPageProps {
  searchParams: Promise<{ interest?: string }>;
}

export async function generateMetadata({
  searchParams,
}: ContactPageProps): Promise<Metadata> {
  const params = await searchParams;
  return createMetadata({
    title: "Contact",
    description:
      "Get in touch with Sea Saba. Questions about diving, courses, or booking. We are here to help.",
    path: "/contact",
    searchParams: params,
  });
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { interest } = await searchParams;

  const inquiryLabels: Record<string, string> = {
    "try-scuba": "Try Scuba Inquiry",
    "sdi-open-water": "SDI Open Water Diver Inquiry",
    "sdi-advanced-specialty": "SDI Advanced & Specialty Training Inquiry",
    "sdi-nitrox": "SDI Nitrox Diver Inquiry",
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

        {/* Visit Sea Saba */}
        <div className="flex h-full flex-col rounded-xl border border-border/60 bg-card px-6 pt-0 pb-6">
          <h2 className="text-lg font-semibold text-foreground">Visit Sea Saba</h2>

          <div className="mt-0 flex flex-1 flex-col justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Sea Saba Dive Center</p>
                {CONTACT.address.displayLines.map((line) => (
                  <p key={line} className="text-sm text-muted-foreground">{line}</p>
                ))}
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="h-px bg-border/60" />

              <a
                href={CONTACT.phoneHref}
                className="group flex items-center gap-3 no-underline"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {CONTACT.phone}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>

              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 no-underline"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">WhatsApp</span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {CONTACT.whatsapp}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="group flex items-center gap-3 no-underline"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">Email</span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {CONTACT.email}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>
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
            <Button asChild variant="destructive" className="font-semibold no-underline">
              <Link href="/plan-your-trip">Plan Your Trip →</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
