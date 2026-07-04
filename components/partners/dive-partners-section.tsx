import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import type { Partner } from "@/data/partners";

interface DivePartnersSectionProps {
  partners: Partner[];
}

export function DivePartnersSection({ partners }: DivePartnersSectionProps) {
  return (
    <section id="dive-partners" className="mt-16 scroll-mt-32">
      <h2 className="text-xl font-semibold text-foreground">Caribbean Dive Partners</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Dive operators that regularly work with Sea Saba or complement trips to the island.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="group flex flex-col rounded-xl border border-border/50 bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex flex-1 flex-col">
              <h3 className="text-sm font-semibold text-foreground">{partner.name}</h3>

              {partner.island && (
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {partner.island}
                </span>
              )}

              <div className="mt-auto pt-4">
                <Link
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${partner.name} website, opens in a new tab`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Visit Website
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
