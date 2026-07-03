import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PartnerLogo } from "./partner-logo";
import type { Partner, PartnerSubcategory } from "@/data/partners";

interface LocalPartnersSectionProps {
  partners: Partner[];
  subcategories: PartnerSubcategory[];
}

export function LocalPartnersSection({ partners, subcategories }: LocalPartnersSectionProps) {
  return (
    <section id="local-partners" className="mt-14 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Local Partners</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Trusted restaurants, transportation, and activities we recommend while you are visiting Saba.
      </p>

      <div className="mt-8 flex flex-col gap-12">
        {subcategories.map((subcategory) => {
          const items = partners.filter((p) => p.subcategory === subcategory);
          if (items.length === 0) return null;

          return (
            <div key={subcategory}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">{subcategory}</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((partner) => (
                  <div
                    key={partner.name}
                    className="group flex flex-col rounded-xl border border-border/50 bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start gap-3">
                        <PartnerLogo name={partner.name} className="h-10 w-10 shrink-0 rounded-lg text-xs" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-foreground">{partner.name}</h4>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-4">
                        {partner.website !== "#" ? (
                          <Link
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={"Visit " + partner.name + " website, opens in a new tab"}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            Visit Website
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">Website coming soon</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
