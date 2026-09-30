"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { BankDetailsModal } from "@/components/donations/bank-details-modal";
import { Button } from "@/components/ui/button";
import { TrackedOutboundButton } from "@/components/tracked-outbound-button";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { cn } from "@/lib/utils";
import type { DonationRecipient } from "@/data/donations";

const CATEGORY_LABELS: Record<NonNullable<DonationRecipient["category"]>, string> = {
  conservation: "Conservation",
  community: "Community",
  animals: "Animals",
  youth: "Youth",
  culture: "Culture",
  "marine-conservation": "Marine conservation & coral restoration",
  "science-education": "Science, education, youth & culture",
};

interface DonationsSectionProps {
  recipients: DonationRecipient[];
}

/**
 * Recipient grid for /donate (#171). While DONATION_RECIPIENTS is empty the
 * section renders a graceful in-progress note — no fabricated organizations
 * may appear publicly. Cards send visitors to the recipient's own site, or
 * open the recipient's own bank-transfer details in a dialog when the
 * organization takes donations by transfer instead; Sea Saba never
 * processes donations either way.
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

  // Three columns only once the registry outgrows two entries — with one or
  // two approved recipients a wider card fills the row and keeps the longer
  // focus labels on one line instead of leaving an empty third column.
  return (
    <div
      className={cn(
        "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2",
        recipients.length > 2 && "lg:grid-cols-3"
      )}
    >
      {recipients.map((recipient) => (
        <DonationCard key={recipient.name} recipient={recipient} />
      ))}
    </div>
  );
}

function DonationCard({ recipient }: { recipient: DonationRecipient }) {
  const [bankDetailsOpen, setBankDetailsOpen] = useState(false);
  return (
    <article className="group flex flex-col rounded-xl border border-border/50 bg-background p-5 transition-card hover:border-primary/30 hover:shadow-sm focus-within:border-primary/30 focus-within:shadow-sm">
      {recipient.image && (
        <Image
          src={recipient.image}
          alt={recipient.imageAlt}
          width={160}
          height={48}
          className={cn(
            "mb-3 w-auto self-start object-contain object-left",
            recipient.imageClassName ?? "h-14"
          )}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
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
      {(recipient.donationUrl || recipient.website || recipient.bankDetails) && (
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
          {recipient.donationUrl && (
            <TrackedOutboundButton
              href={recipient.donationUrl}
              eventName="donation_click"
              buttonText={`Donate to ${recipient.name}`}
              ariaLabel={`Donate directly to ${recipient.name} on their own website, opens in a new tab`}
              size="sm"
              className="gap-1.5"
            >
              Donate directly
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </TrackedOutboundButton>
          )}
          {recipient.bankDetails && (
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => setBankDetailsOpen(true)}
            >
              Donate by bank transfer
            </Button>
          )}
          {recipient.website && (
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
          )}
        </div>
      )}
      {bankDetailsOpen && recipient.bankDetails && (
        <BankDetailsModal
          recipient={recipient}
          onClose={() => setBankDetailsOpen(false)}
        />
      )}
    </article>
  );
}
