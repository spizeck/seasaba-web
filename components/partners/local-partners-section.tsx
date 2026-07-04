import Link from "next/link";
import { ExternalLink, MapPin, Plane, Ship, Helicopter } from "lucide-react";
import type { Partner, PartnerSubcategory } from "@/data/partners";

interface LocalPartnersSectionProps {
  partners: Partner[];
  subcategories: PartnerSubcategory[];
}

export function LocalPartnersSection({ partners, subcategories }: LocalPartnersSectionProps) {
  return (
    <section id="local-partners" className="mt-14 scroll-mt-32">
      <h2 className="text-xl font-semibold text-foreground">Local Partners</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Trusted restaurants and transportation we recommend while you are visiting Saba.
      </p>

      <div className="mt-8 flex flex-col gap-12">
        {subcategories.map((subcategory) => {
          const items = partners.filter((p) => p.subcategory === subcategory);
          if (items.length === 0) return null;

          const isRestaurants = subcategory === "Restaurants";
          const isTransportation = subcategory === "Transportation";
          const subcategoryId = subcategory.toLowerCase().replace(/\s+/g, "-");

          return (
            <div key={subcategory} id={subcategoryId} className="scroll-mt-32">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">{subcategory}</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((partner) => {
                  if (isRestaurants) return <RestaurantCard key={partner.name} partner={partner} />;
                  if (isTransportation) return <TransportationCard key={partner.name} partner={partner} />;
                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RestaurantCard({ partner }: { partner: Partner }) {
  const hasLink = partner.website && partner.website !== "#";
  const linkLabel =
    partner.linkType === "facebook"
      ? "Visit Facebook"
      : partner.linkType === "google"
        ? "Visit Google"
        : "Visit Website";

  return (
    <div className="group flex flex-col rounded-xl border border-border/50 bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="flex flex-1 flex-col">
        <h4 className="text-sm font-semibold text-foreground">{partner.name}</h4>

        {partner.village && (
          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            {partner.village}
          </span>
        )}

        <div className="mt-auto pt-4">
          {hasLink ? (
            <Link
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${linkLabel} for ${partner.name}, opens in a new tab`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              {linkLabel}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TransportationCard({ partner }: { partner: Partner }) {
  const hasLink = partner.website && partner.website !== "#";
  const type = partner.transportationType;
  const TypeIcon = type === "ferry" ? Ship : type === "helicopter" ? Helicopter : Plane;
  const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Transportation";

  return (
    <div className="group flex flex-col rounded-xl border border-border/50 bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="flex flex-1 flex-col">
        <h4 className="text-sm font-semibold text-foreground">{partner.name}</h4>

        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
          <TypeIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {typeLabel}
        </span>

        <div className="mt-auto pt-4">
          {hasLink ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
