import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FeatureImage } from "@/components/feature-image";
import type { Partner } from "@/data/partners";

interface ConservationPartnersSectionProps {
  partners: Partner[];
}

export function ConservationPartnersSection({ partners }: ConservationPartnersSectionProps) {
  return (
    <section id="conservation-partners" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Conservation & Community</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Organizations protecting and promoting the extraordinary marine and terrestrial environments around Saba.
      </p>

      <div className="mt-8 flex flex-col gap-16 lg:gap-20">
        {partners.map((partner, index) => (
          <FeatureImage
            key={partner.name}
            src={partner.image || "/images/optimized/cove-bay-saba.webp"}
            alt={partner.name}
            imageRight={index % 2 === 1}
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">{partner.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
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
            </div>
          </FeatureImage>
        ))}
      </div>
    </section>
  );
}
