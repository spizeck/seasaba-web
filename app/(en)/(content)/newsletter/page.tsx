import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { attributionFromSearchParams } from "@/lib/newsletter/contract";

interface NewsletterPageProps {
  searchParams: Promise<{
    campaign?: string;
    source?: string;
    placement?: string;
    audience?: string;
    email?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: NewsletterPageProps): Promise<Metadata> {
  const params = await searchParams;
  return createMetadata({
    title: "Newsletter",
    description:
      "Subscribe to the Sea Saba newsletter — dive travel tips, Saba updates, and group/trade news. Confirm by email; unsubscribe anytime.",
    path: "/newsletter",
    searchParams: params,
  });
}

/**
 * Public newsletter signup (DEMA 2026 launch).
 *
 * Campaign URLs preselect the audience but never lock it:
 *   /newsletter?campaign=dema-2026&source=qr&placement=group-flyer&audience=group
 *   /newsletter?campaign=dema-2026&source=qr&placement=individual-flyer&audience=individual
 * Attribution travels to the API and is stored once at first signup —
 * a repeat visit can never overwrite the original acquisition.
 */
export default async function NewsletterPage({ searchParams }: NewsletterPageProps) {
  const params = await searchParams;
  const attribution = attributionFromSearchParams(params);
  const initialEmail =
    typeof params.email === "string" ? params.email.slice(0, 254) : "";

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        The Sea Saba Newsletter
      </h1>

      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Occasional, genuinely useful email from Saba — dive conditions,
        trip-planning tips, schedule news, and (for organizers) group and
        trade updates. No noise, and you can unsubscribe anytime.
      </p>

      <div className="not-prose mt-8 rounded-lg border border-border/60 bg-card p-6">
        <NewsletterSignupForm
          attribution={attribution}
          initialEmail={initialEmail}
        />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        We use double opt-in: after subscribing you&apos;ll get a confirmation
        email, and you&apos;re only on the list once you click it. Read how we
        handle your information in our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          privacy policy
        </a>
        .
      </p>
    </>
  );
}
