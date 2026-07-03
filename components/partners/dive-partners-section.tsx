import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PartnerLogo } from "./partner-logo";
import { Button } from "@/components/ui/button";
import type { Partner } from "@/data/partners";

interface DivePartnersSectionProps {
  partners: Partner[];
}

export function DivePartnersSection({ partners }: DivePartnersSectionProps) {
  return (
    <section id="dive-partners" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Caribbean Dive Partners</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Dive operators that regularly work with Sea Saba or complement trips to the island.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex items-start gap-4 rounded-xl border border-border/50 bg-background p-4 transition-colors hover:border-primary/30"
          >
            <PartnerLogo name={partner.name} className="h-12 w-12 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{partner.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm font-medium text-primary">
                <Link
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${partner.name} website, opens in a new tab`}
                >
                  Visit Website
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
