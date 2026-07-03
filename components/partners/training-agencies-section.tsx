import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PartnerLogo } from "./partner-logo";
import type { Partner } from "@/data/partners";

interface TrainingAgenciesSectionProps {
  partners: Partner[];
}

export function TrainingAgenciesSection({ partners }: TrainingAgenciesSectionProps) {
  return (
    <section id="training-agencies" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Training Agencies</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sea Saba teaches under the agencies that set the standard for recreational, technical, and public-safety diving.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {partners.map((partner) => (
          <Link
            key={partner.name}
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${partner.name} website, opens in a new tab`}
            className="group flex flex-col items-center rounded-xl border border-border/50 bg-background p-6 text-center transition-colors hover:border-primary/30"
          >
            <PartnerLogo name={partner.name} className="h-16 w-16 text-lg" />
            <h3 className="mt-4 text-base font-semibold text-foreground">{partner.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Learn More
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
