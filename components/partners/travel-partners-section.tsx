import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Partner } from "@/data/partners";

interface TravelPartnersSectionProps {
  partners: Partner[];
}

export function TravelPartnersSection({ partners }: TravelPartnersSectionProps) {
  return (
    <section id="travel-partners" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Travel & Tour Operators</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sea Saba works with travel agencies, wholesalers, and group organizers to make planning dive vacations easy.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {partners.map((partner) => {
          const isInternal = partner.website.startsWith("/");
          return (
            <div
              key={partner.name}
              className="flex flex-col rounded-xl border border-border/50 bg-background p-5"
            >
              <h3 className="text-base font-semibold text-foreground">{partner.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
              <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
                <Link
                  href={partner.website}
                  target={isInternal ? undefined : "_blank"}
                  rel={isInternal ? undefined : "noopener noreferrer"}
                  aria-label={isInternal ? `Contact Sea Saba about ${partner.name}` : `Visit ${partner.name} website, opens in a new tab`}
                >
                  {isInternal ? (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Us
                    </>
                  ) : (
                    "Visit Website"
                  )}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
