import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { ImageCard } from "@/components/image-card";
import { FeatureImage } from "@/components/feature-image";

const WHY_SABA_FEATURED = [
  {
    heading: "World-Famous Pinnacles",
    body: "Volcanic origins created dramatic underwater pinnacles unlike anything else in the Caribbean. These seamounts rise from the deep and deliver encounters that divers remember for years.",
    image: "/images/optimized/divers-above-pinnacle-saba.webp",
    imageAlt: "Scuba divers hovering above a coral-covered volcanic pinnacle in the Saba Marine Park.",
    bgPosition: "top",
  },
  {
    heading: "Uncrowded by Design",
    body: "Saba has chosen a different path. There are no large resorts, no cruise ship crowds, and no busy dive boats competing for space. The result is a quieter, more personal experience both above and below the surface.",
    image: "/images/optimized/fin-and-tonic-boat-diamond-rock.webp",
    imageAlt: "Sea Saba dive boat Fin & Tonic moored beside Diamond Rock off Saba.",
    bgPosition: "center",
  },
  {
    heading: "Small Island, Big Heart",
    body: "Our greatest asset isn't found underwater. It's the people. Friendly faces, welcoming communities, and genuine island hospitality make visitors feel at home from the moment they arrive.",
    image: "/images/optimized/windwardside-village-saba.webp",
    imageAlt: "Colorful red-roofed cottages of Windwardside village on the green hillside of Saba.",
    bgPosition: "center",
  },
] as const;

const WHY_SABA_SECONDARY = [
  {
    heading: "Protected Since 1987",
    body: "The Saba Marine Park has actively protected local waters since 1987. Healthy reefs and abundant marine life are the direct result of decades of consistent stewardship.",
  },
  {
    heading: "Encounters That Feel Wild",
    body: "With relatively low dive pressure, marine life often behaves naturally. Sharks, turtles, and rays provide close encounters not because they are conditioned to divers, but because they are undisturbed.",
  },
  {
    heading: "Active Conservation",
    body: "Conservation is part of daily life on Saba. Lionfish are actively managed. Marine resources are protected. The island's commitment to stewardship preserves what makes the diving exceptional.",
  },
] as const;

const DIVE_EXPERIENCES = [
  {
    title: "The Pinnacles",
    subtitle: "The dives that made Saba famous.",
    image: "/images/optimized/diver-volcanic-pinnacle-saba.webp",
    imageAlt: "Diver above a coral-encrusted volcanic seamount in open blue water, Saba.",
    body: "Volcanic seamounts rise from the deep blue, attracting pelagic life and creating some of the Caribbean's most iconic dives. From Third Encounter to Diamond Rock, these underwater mountains define the Saba diving experience.",
    sites: ["Third Encounter (The Needle)", "Twilight Zone", "Outer Limits", "Diamond Rock", "Man O'War Shoals", "Shark Shoals"],
    note: null,
  },
  {
    title: "Tent Reef",
    subtitle: "Walls, reefs, and endless blue water.",
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imageAlt: "Green turtle gliding over healthy coral reef with sea fans and sponges, Saba.",
    body: "Stretching across multiple dive sites, Tent Reef combines healthy coral growth, dramatic drop-offs, and the famous Three Sisters. It is home to some of Saba's most scenic and accessible wall diving.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "Tedran Wall"],
    note: "Named after Ted and Randy, Tedran Wall marks the southern extent of this remarkable reef system.",
  },
  {
    title: "Ladder Bay",
    subtitle: "Volcanic landscapes and hidden treasures.",
    image: "/images/optimized/spiny-lobster-ladder-bay.webp",
    imageAlt: "Caribbean spiny lobster sheltering beneath a coral ledge on Saba's volcanic reef.",
    body: "From warm-water vents and nurse sharks to green turtles and flying gurnards, Ladder Bay showcases the diversity that makes Saba special. This area offers some of the island's most unique underwater landscapes.",
    sites: ["Rays n' Anchors","Hot Springs", "50/50", "Ladder Labyrinth", "Babylon", "Porites Point", "Customs House"],
    note: null,
  },
] as const;



export default function Home() {
  return (
    <>
      {/* 1. Hero — static image, trust indicators, primary Book CTA */}
      <Hero />

      {/* 2. Why Saba */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Saba is just different.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Most visitors struggle to explain exactly why. They just know it doesn&apos;t feel
              like anywhere else in the Caribbean, above the surface or below it.
            </p>
          </div>

          {/* Featured three — photo-backed cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            {WHY_SABA_FEATURED.map((item, i) => (
              <ImageCard
                key={item.heading}
                src={item.image}
                alt={item.imageAlt}
                heading={item.heading}
                body={item.body}
                objectPosition={item.bgPosition}
                priority={i === 0}
              />
            ))}
          </div>

          {/* Secondary three — compact text row */}
          <div className="mt-10 grid gap-6 border-t border-border/40 pt-10 sm:grid-cols-3">
            {WHY_SABA_SECONDARY.map((item) => (
              <div key={item.heading}>
                <h3 className="text-sm font-semibold text-foreground">
                  {item.heading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. The Dives That Made Saba Famous */}
      <section className="bg-[#0B0F3B] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-16 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              The Dives That Made Saba Famous.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Saba&apos;s volcanic origins created one of the Caribbean&apos;s most unique
              underwater landscapes. Explore towering pinnacles, dramatic walls, and
              volcanic seascapes found nowhere else in the region.
            </p>
          </div>

          {/* Experience blocks */}
          <div className="flex flex-col gap-16">
            {DIVE_EXPERIENCES.map((exp, i) => (
              <FeatureImage
                key={exp.title}
                src={exp.image}
                alt={exp.imageAlt}
                imageRight={i % 2 === 1}
              >
                <div>
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">
                    {exp.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/45 uppercase tracking-wide">
                    {exp.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                    {exp.body}
                  </p>
                  {/* Site tags */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {exp.sites.map((site) => (
                      <span
                        key={site}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                      >
                        {site}
                      </span>
                    ))}
                  </div>
                  {/* Supporting note */}
                  {exp.note && (
                    <p className="mt-4 text-xs leading-relaxed text-white/45 italic">
                      {exp.note}
                    </p>
                  )}
                </div>
              </FeatureImage>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base font-semibold">
              <Link href="/dive-sites">Explore All Dive Sites</Link>
            </Button>
          </div>

        </div>
      </section>

      {/* 4. Plan Your Trip */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-16 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Plan Your Trip.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Getting to Saba takes a little planning. The reward is one of the
              Caribbean&apos;s most unforgettable destinations.
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-16">

            <FeatureImage
              src="/images/optimized/saba-212.webp"
              alt="Aerial view of Saba island from approaching aircraft."
              imageRight
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Getting Here</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Closer than you think.</h3>
                <p className="mt-1 text-sm text-muted-foreground">Just 15 minutes from St. Maarten.</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Most visitors arrive via St. Maarten, connecting to Saba by Winair or
                  high-speed ferry. The journey is part of the adventure, and the views
                  are unforgettable.
                </p>
                <Link href="/plan-your-trip" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  Flights and Ferries →
                </Link>
              </div>
            </FeatureImage>

            <FeatureImage
              src="/images/optimized/saba-024.webp"
              alt="Caribbean reef shark cruising above the reef in the Saba Marine Park."
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Where to Stay</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Small hotels. Big hospitality.</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  From charming cottages to boutique hotels, Saba&apos;s accommodations
                  reflect the island&apos;s relaxed pace and welcoming spirit.
                </p>
                <Link href="/plan-your-trip" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  Explore accommodations →
                </Link>
              </div>
            </FeatureImage>

            <FeatureImage
              src="/images/optimized/green-turtle-with-diver-saba.webp"
              alt="Green turtle swimming above open water with a diver in the background, Saba."
              imageRight
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">When to Visit</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Great diving year-round.</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Every season brings something different, but there is no bad time to
                  visit Saba. Warm water, healthy reefs, and changing marine life make
                  every month rewarding.
                </p>
                <Link href="/plan-your-trip" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  When to visit →
                </Link>
              </div>
            </FeatureImage>

            <FeatureImage
              src="/images/optimized/fort-bay-harbor-saba.webp"
              alt="Fort Bay harbor framed by Saba's volcanic hills, Caribbean Netherlands."
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Island Life</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Small island. Big welcome.</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Safe villages, friendly people, and no crowds. Many visitors return
                  year after year, and some never really leave.
                </p>
                <Link href="/plan-your-trip" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  Discover Saba →
                </Link>
              </div>
            </FeatureImage>

          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="relative overflow-hidden py-28 -mt-1">
        <Image
          src="/images/optimized/saba-island-aerial-golden-hour.webp"
          alt="Aerial view of Saba rising from the Caribbean Sea at golden hour, surrounded by deep blue water."
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0F3B]/60 to-[#0B0F3B]/75" />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ready to dive Saba?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Book directly with Sea Saba. Small groups, experienced guides, and
            diving that keeps people coming back year after year.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base font-semibold">
              <Link href="/book">Book Diving</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/40 bg-transparent text-white hover:bg-white/10 text-base font-semibold">
              <Link href="/plan-your-trip">Plan Your Trip</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
