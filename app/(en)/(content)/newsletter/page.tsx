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
  }>;
}

export async function generateMetadata({
  searchParams,
}: NewsletterPageProps): Promise<Metadata> {
  const params = await searchParams;
  return createMetadata({
    title: "Newsletter",
    description:
      "Subscribe to the Sea Saba newsletter for dive travel tips, Saba updates, and group or trade news. Confirm by email; unsubscribe anytime.",
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

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Stay Connected to Saba
      </h1>

      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Get occasional updates from Sea Saba, including diving conditions,
        island news, travel tips, and special opportunities. Organizing a
        group? Select Group Organizer for trip-planning resources, group
        rates, and trade updates.
      </p>

      <div className="not-prose mt-6 rounded-lg border border-border/60 bg-card p-6">
        <NewsletterSignupForm attribution={attribution} />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
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
