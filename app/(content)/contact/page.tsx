import { createMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/contact-form";

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

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Email</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            For general inquiries, booking questions, or course information:
          </p>
          <a
            href="mailto:info@seasaba.com"
            className="mt-2 inline-block text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            info@seasaba.com
          </a>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Location</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Saba, Dutch Caribbean
            <br />
            Netherlands Antilles
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-border/40 bg-muted/20 p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Before You Visit
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba is accessible by small aircraft from St. Maarten (SXM) or by
          ferry. We recommend booking your dives in advance, especially during
          peak season (December through April). We are happy to help with
          logistics and planning.
        </p>
      </div>
    </>
  );
}
