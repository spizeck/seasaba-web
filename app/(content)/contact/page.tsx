import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Contact",
  description:
    "Get in touch with Sea Saba. Questions about diving, courses, or booking — we're here to help.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Contact Us
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Have questions about diving in Saba, course availability, or anything
        else? We&apos;re happy to help.
      </p>

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
          peak season (December through April). We&apos;re happy to help with
          logistics and planning.
        </p>
      </div>
    </>
  );
}
