import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, Gauge, Waves } from "lucide-react";
import { createMetadata } from "@/lib/metadata";
import { Button } from "@/components/ui/button";
import { FeatureImage } from "@/components/feature-image";
import { JsonLd } from "@/components/structured-data";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { diveAreaByTitle } from "@/data/dive-areas";
import {
  DIVE_SITES,
  DIVE_SITE_BY_SLUG,
  diveSitePath,
  diveSiteSlug,
} from "@/data/dive-site-videos";
import { divingAnchors } from "@/lib/anchors";
import { SITE_URL } from "@/lib/constants";

export function generateStaticParams() {
  return DIVE_SITES.map((site) => ({ slug: diveSiteSlug(site.name) }));
}

// Sites not in the catalogue never existed — they are genuine 404s, not
// placeholders waiting for content.
export const dynamicParams = false;

function metaDescription(text: string): string {
  if (text.length <= 160) return text;
  const cut = text.slice(0, 160);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = DIVE_SITE_BY_SLUG[slug];
  if (!site) return {};
  return createMetadata({
    title: `${site.name} Dive Site, Saba`,
    description: metaDescription(site.description),
    path: `/dive-sites/${slug}`,
  });
}

export default async function DiveSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = DIVE_SITE_BY_SLUG[slug];
  if (!site) notFound();

  const area = diveAreaByTitle(site.area);
  const siblings =
    area?.sites.filter((name) => name !== site.name) ??
    DIVE_SITES.filter((s) => s.area === site.area && s.name !== site.name).map(
      (s) => s.name
    );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: `${site.name} Dive Site`,
          description: site.description,
          url: `${SITE_URL}/dive-sites/${slug}`,
          ...(area && { image: `${SITE_URL}${area.image}` }),
          touristType: "Scuba divers",
          isPartOf: { "@id": `${SITE_URL}/dive-sites` },
        }}
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {site.name}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Dive site in the {site.area} area of the Saba Marine Park
      </p>

      {/* At a glance */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/dive-sites#${area?.id ?? ""}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/40 px-2.5 py-1 text-xs text-foreground/80 hover:text-foreground"
        >
          <MapPin className="h-3 w-3" />
          {site.area}
        </Link>
        <Link
          href={`/diving#${divingAnchors.marinePark}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/40 px-2.5 py-1 text-xs text-foreground/80 hover:text-foreground"
        >
          <ShieldCheck className="h-3 w-3" />
          Saba Marine Park
        </Link>
        {site.techSuitable && (
          <Link
            href={`/diving#${divingAnchors.technicalDiving}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/40 px-2.5 py-1 text-xs text-foreground/80 hover:text-foreground"
          >
            <Gauge className="h-3 w-3" />
            Suitable for technical profiles
          </Link>
        )}
      </div>

      {/* Video — click-to-play so YouTube is never contacted on load */}
      {site.videoId && (
        <div className="mt-8">
          <YouTubeEmbed
            videoId={site.videoId}
            title={`${site.name} dive site`}
          />
        </div>
      )}

      {/* About this site */}
      <p className="mt-8 text-base leading-relaxed text-muted-foreground">
        {site.description}
      </p>

      <section className="mt-6 rounded-lg border border-border/40 bg-muted/20 p-5">
        <h2 className="text-base font-semibold text-foreground">
          Diving {site.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every Sea Saba dive trip visits sites inside the Saba Marine Park,
          most of them 5–15 minutes by boat from Fort Bay Harbor. Sites are
          chosen each day for the actual conditions and the divers aboard, so
          let us know if there&apos;s a site you&apos;re hoping to visit.
        </p>
        {site.techSuitable && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {site.name} can support deeper and technical profiles. Technical
            dives are planned in advance — tell us what you have in mind and
            we&apos;ll talk through logistics.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" size="sm">
            <Link href={`/diving#${divingAnchors.options}`}>
              View Diving Options
            </Link>
          </Button>
          <TrackedInternalButton
            variant="outline"
            size="sm"
            href="/contact?interest=book-diving"
            eventName="contact_click"
            buttonText={`Ask about ${site.name}`}
            buttonLocation="dive_site_page"
          >
            Ask about {site.name}
          </TrackedInternalButton>
        </div>
      </section>

      {/* Dive area context */}
      {area && (
        <section className="mt-12">
          <FeatureImage
            src={area.image}
            alt={`${area.title} dive area in the Saba Marine Park`}
            imageRight={area.imagePosition === "right"}
          >
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                The {area.title} Dive Area
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {area.description}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={`/dive-sites#${area.id}`}>
                  More about {area.title}
                </Link>
              </Button>
            </div>
          </FeatureImage>
        </section>
      )}

      {/* Sibling sites */}
      {siblings.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">
            More Sites in {site.area}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {siblings.map((name) => (
              <Link
                key={name}
                href={diveSitePath(name)}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 pressable focus-ring"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Explore further */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dive-log"
          className="rounded-lg border border-border/40 bg-muted/20 p-4 pressable hover:border-border"
        >
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Sea Saba Dive Log
            </h2>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            See where our boats have been diving and what they&apos;ve
            spotted lately.
          </p>
        </Link>
        <Link
          href="/dive-sites"
          className="rounded-lg border border-border/40 bg-muted/20 p-4 pressable hover:border-border"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              All Saba dive sites
            </h2>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Browse all five dive areas and more than 30 protected sites in the
            Saba Marine Park.
          </p>
        </Link>
      </section>

      {/* CTA */}
      <section className="mt-14 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to dive Saba?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Tell us your certification and we&apos;ll match you to the right
          sites for the conditions on the day.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <TrackedInternalButton
            size="lg"
            className="text-base font-semibold"
            href="/book"
            eventName="book_now_click"
            buttonText="Book Diving"
            buttonLocation="dive_site_footer_cta"
          >
            Book Diving
          </TrackedInternalButton>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href={`/diving#${divingAnchors.options}`}>
              View Diving Options
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
