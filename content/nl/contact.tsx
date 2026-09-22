import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { FindSeaSaba } from "@/components/find-sea-saba";
import { Button } from "@/components/ui/button";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import { CONTACT } from "@/lib/constants";
import { inquiryFor } from "@/data/operations";
import { inquiryCopy } from "@/lib/contact";
import { uiFor } from "@/content/ui";
import { localeHref, type TranslationReview } from "@/lib/locale";
import { MapPin, Phone, MessageCircle, Mail, Luggage, ChevronRight } from "lucide-react";

/**
 * Dutch draft of `app/(en)/(content)/contact/page.tsx` (#151). Inquiry slugs,
 * `?interest=` handling, analytics events, and the mailto/WhatsApp handoff
 * are unchanged — only the visitor-facing copy is localized.
 */
export const review: TranslationReview = {
  status: "draft",
  reviewedBy: null,
  reviewedAt: null,
  source: "app/(en)/(content)/contact/page.tsx",
  sourceHash: "c39c08f89c6b0c2e26e014f43b4650be0eeb3808",
};

export const nlMetadata = {
  title: "Contact",
  description:
    "Neem contact op met Sea Saba. Vragen over duiken, cursussen of boeken? We helpen je graag.",
};

export function NlContact({ interest }: { interest?: string }) {
  const ui = uiFor("nl");
  const cp = ui.contactPage;

  const inquiry = interest ? inquiryFor(interest) : undefined;
  const dictInquiry = inquiry && inquiryCopy(ui.contactForm, inquiry.value);
  const headline = dictInquiry?.subject ?? cp.defaultHeadline;
  const subtitle = inquiry?.group === "courses" ? cp.coursesSubtitle : cp.defaultSubtitle;

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {headline}
      </h1>

      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {subtitle}
      </p>

      <div className="mt-8 rounded-lg border border-border/60 bg-card p-6">
        <ContactForm initialInterest={interest} locale="nl" />
      </div>

      {/* Contact Info + Find Sea Saba */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">

        {/* Visit Sea Saba */}
        <div className="flex h-full flex-col rounded-xl border border-border/60 bg-card px-6 pt-0 pb-6">
          <h2 className="text-lg font-semibold text-foreground">{cp.visitHeading}</h2>

          <div className="mt-0 flex flex-1 flex-col justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{cp.visitName}</p>
                {CONTACT.address.displayLines.map((line) => (
                  <p key={line} className="text-sm text-muted-foreground">{line}</p>
                ))}
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="h-px bg-border/60" />

              <TrackedContactLink
                href={CONTACT.phoneHref}
                eventName="phone_click"
                buttonText="Phone"
                className="group flex items-center gap-3 no-underline"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">{cp.phoneLabel}</span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {CONTACT.phone}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </TrackedContactLink>

              <TrackedContactLink
                href={CONTACT.whatsappHref}
                eventName="whatsapp_click"
                buttonText="WhatsApp"
                external
                className="group flex items-center gap-3 no-underline"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">{cp.whatsappLabel}</span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {CONTACT.whatsapp}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </TrackedContactLink>

              <TrackedContactLink
                href={`mailto:${CONTACT.email}`}
                eventName="email_click"
                buttonText="Email"
                className="group flex items-center gap-3 no-underline"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">{cp.emailLabel}</span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {CONTACT.email}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </TrackedContactLink>
            </div>
          </div>
        </div>

        {/* Find Sea Saba map card */}
        <FindSeaSaba locale="nl" />

      </div>

      {/* Planning Your Trip */}
      <div className="mt-6 rounded-xl border border-border/40 bg-muted/20 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Luggage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{cp.planningHeading}</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {cp.planningBody}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Button asChild variant="destructive" className="font-semibold no-underline">
              <Link href={localeHref("nl", "/plan-your-trip")}>{cp.planningCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
