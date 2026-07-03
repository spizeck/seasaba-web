import Image from "next/image";
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
    <section id="local-partners" className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Local Partners</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Trusted hotels, restaurants, transportation, and activities we recommend while you are visiting Saba.
      </p>

      <div className="mt-8 flex flex-col gap-14">
        {subcategories.map((subcategory) => {
          const items = partners.filter((p) => p.subcategory === subcategory);
          if (items.length === 0) return null;

          return (
            <div key={subcategory}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">{subcategory}</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((partner) => (
                  <div
                    key={partner.name}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background"
                  >
                    {partner.image ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={partner.image}
                          alt={partner.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <PartnerLogo name={partner.name} className="h-full w-full text-base" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h4 className="text-base font-semibold text-foreground">{partner.name}</h4>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
                      {partner.website !== "#" ? (
                        <Link
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${partner.name} website, opens in a new tab`}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          Visit Website
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <span className="mt-4 text-xs text-muted-foreground/50 italic">Website coming soon</span>
                      )}
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
