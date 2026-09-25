"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import type { DonationRecipient } from "@/data/donations";

const CATEGORY_LABELS: Record<NonNullable<DonationRecipient["category"]>, string> = {
  conservation: "Conservation",
  community: "Community",
  animals: "Animals",
  youth: "Youth",
  culture: "Culture",
};

interface DonationsSectionProps {
  recipients: DonationRecipient[];
}

/**
 * Recipient grid for /donate (#171). While DONATION_RECIPIENTS is empty the
 * section renders a graceful in-progress note — no fabricated organizations
 * may appear publicly. Cards always send visitors to the recipient's own
 * site; Sea Saba never processes donations.
 */
export function DonationsSection({ recipients }: DonationsSectionProps) {
  if (recipients.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-border/60 bg-muted/20 p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We&apos;re assembling a short list of Saba organizations we can
          wholeheartedly recommend. Until it&apos;s ready, the most reliable
          route is also the simplest:{" "}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ask us
          </Link>
          . We live here, and we&apos;re happy to point you at a cause that fits.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipients.map((recipient) => (
        <DonationCard key={recipient.name} recipient={recipient} />
      ))}
    </div>
  );
}

function DonationCard({ recipient }: { recipient: DonationRecipient }) {
  return (
    <article className="group flex flex-col rounded-xl border border-border/50 bg-background p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      {recipient.image && (
        <Image
          src={recipient.image}
          alt={recipient.imageAlt ?? ""}
          width={160}
          height={48}
          className="h-12 w-auto object-contain"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{recipient.name}</h3>
        {recipient.category && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {CATEGORY_LABELS[recipient.category]}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {recipient.description}
      </p>
      {recipient.funds && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Helps fund:</span>{" "}
          {recipient.funds}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
        {recipient.donationUrl && (
          <TrackedOutboundLink
            href={recipient.donationUrl}
            eventName="donation_click"
            buttonText={`Donate to ${recipient.name}`}
            ariaLabel={`Donate directly to ${recipient.name} on their own website, opens in a new tab`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Donate directly
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </TrackedOutboundLink>
        )}
        <TrackedOutboundLink
          href={recipient.website}
          eventName="social_click"
          buttonText={`Visit ${recipient.name}`}
          ariaLabel={`Visit ${recipient.name}'s website, opens in a new tab`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {recipient.donationUrl ? "Visit website" : "Visit their website"}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </TrackedOutboundLink>
      </div>
    </article>
  );
}
