import Link from "next/link";
import { PartnerLogo } from "./partner-logo";
import type { Partner } from "@/data/partners";

interface EquipmentPartnersSectionProps {
  partners: Partner[];
}

export function EquipmentPartnersSection({ partners }: EquipmentPartnersSectionProps) {
  return (
    <section id="equipment-partners" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Equipment Partners</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manufacturers and brands we trust and use at Sea Saba.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {partners.map((partner) => (
          <Link
            key={partner.name}
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${partner.name} website, opens in a new tab`}
            className="group flex flex-col items-center rounded-xl border border-border/50 bg-background p-5 text-center transition-colors hover:border-primary/30"
          >
            <PartnerLogo name={partner.name} className="h-14 w-14 text-base" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">{partner.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{partner.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
