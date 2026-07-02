import { createMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/page-hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle } from "lucide-react";
import { PARTNERS, PARTNER_CATEGORIES } from "@/data/partners";

export const metadata = createMetadata({
  title: "Recommended Partners",
  description:
    "Trusted Sea Saba partners for accommodations, transportation, restaurants, activities, conservation, and planning your Saba trip.",
  path: "/partners",
});

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Accommodation": "Where to stay on Saba — from boutique hotels to private cottages.",
  "Transportation": "How to get to Saba and move around the island.",
  "Restaurants & Cafés": "Dining favorites recommended to Sea Saba guests.",
  "Island Activities": "Make the most of your time above water.",
  "Conservation & Community": "Organizations protecting Saba's extraordinary marine and terrestrial environments.",
};

export default function PartnersPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/windwardside-village-saba.webp"
        alt="Windwardside village on Saba with traditional cottages and lush greenery"
        title="Recommended Partners"
        subtitle="Local businesses and organizations we trust"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        From where to stay to how to get here, these are local businesses and organizations we trust and regularly recommend to Sea Saba guests. Need help choosing the right fit?{" "}
        <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
          Contact us
        </Link>{" "}
        and we are happy to help with personalized advice.
      </p>

      {PARTNER_CATEGORIES.map((category) => {
        const partners = PARTNERS.filter((p) => p.category === category);
        if (partners.length === 0) return null;
        return (
          <section key={category} id={category.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="mt-12 scroll-mt-24">
            <h2 className="text-xl font-semibold text-foreground">{category}</h2>
            {CATEGORY_DESCRIPTIONS[category] && (
              <p className="mt-1 text-sm text-muted-foreground">{CATEGORY_DESCRIPTIONS[category]}</p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex flex-col rounded-lg border border-border/60 bg-card p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {partner.category}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{partner.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {partner.description}
                  </p>
                  {partner.url !== "#" ? (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${partner.name} website, opens in a new tab`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Visit Website
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="mt-4 text-xs text-muted-foreground/50 italic">
                      Website coming soon
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <MessageCircle className="mx-auto h-6 w-6 text-primary" />
        <h2 className="mt-3 text-xl font-semibold text-foreground">Need a Recommendation?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Not sure which accommodation, restaurant, or activity is the right fit for your trip? Our team knows Saba well and is happy to point you in the right direction.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/plan-your-trip">Plan Your Trip</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
