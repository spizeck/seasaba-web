import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { DiveAreaSites } from "@/components/dive-area-sites";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { DIVE_AREAS } from "@/data/dive-areas";
import { divingAnchors } from "@/lib/anchors";

export const metadata = createMetadata({
  title: "Saba Dive Sites",
  description:
    "Explore Saba's world-famous dive sites by area. From The Pinnacles to Diamond Rock, discover volcanic pinnacles, walls, reefs, and seamounts in the Saba Marine Park.",
  path: "/dive-sites",
});

export default function DiveSitesPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/green-turtle-with-diver-saba.webp"
        alt="Green sea turtle swimming with a diver in the Saba Marine Park"
        title="Saba Dive Sites"
        subtitle="30+ protected sites across volcanic pinnacles, walls, and reefs"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        The{" "}
        <TrackedOutboundLink
          href="https://sabapark.org/saba-national-marine-park/"
          eventName="social_click"
          buttonText="Saba National Marine Park"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Saba National Marine Park
        </TrackedOutboundLink>{" "}
        protects more than 30 dive sites around this volcanic island.
        Our dive team selects sites each day based on weather, sea conditions and the experience
        of our divers. If there&apos;s a particular site you&apos;d love to explore, just let us know.
      </p>

      {/* Dive Area Sections */}
      <div className="mt-12 space-y-12 lg:space-y-16">
        {DIVE_AREAS.map((area) => (
          <section key={area.id} id={area.id} className="scroll-mt-24">
            <FeatureImage
              src={area.image}
              alt={`Diving at ${area.title} in the Saba Marine Park`}
              imageRight={area.imagePosition === "right"}
              objectPosition={"imageObjectPosition" in area ? area.imageObjectPosition : "center"}
              caption={"caption" in area ? area.caption : undefined}
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {area.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {area.description}
                </p>

                {/* Known For */}
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Known For</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {area.knownFor.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-border/50 bg-muted/40 px-2.5 py-1 text-xs text-foreground/80"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Site Chips — link to each site's own page */}
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dive Sites</h3>
                  <DiveAreaSites sites={area.sites} />
                </div>

              </div>
            </FeatureImage>
          </section>
        ))}
      </div>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to explore?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Sea Saba&apos;s experienced guides know every site intimately and match conditions to your experience level.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href={`/diving#${divingAnchors.options}`}>View Diving Options</Link>
          </Button>
          <TrackedInternalButton
            variant="outline"
            size="lg"
            className="text-base font-semibold"
            href="/book"
            eventName="book_now_click"
            buttonText="Book Your Dive"
            buttonLocation="dive_sites_footer_cta"
          >
            Book Your Dive
          </TrackedInternalButton>
        </div>
      </section>
    </>
  );
}

