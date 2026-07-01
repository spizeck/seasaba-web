import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { ImageCard } from "@/components/image-card";
import { FeatureImage } from "@/components/feature-image";
import { createMetadata } from "@/lib/metadata";

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
    id: "pinnacles",
    title: "The Pinnacles",
    subtitle: "The dives that made Saba famous.",
    image: "/images/optimized/diver-volcanic-pinnacle-saba.webp",
    imageAlt: "Diver above a coral-covered volcanic pinnacle in the Saba Marine Park.",
    objectPosition: "center",
    body: "Towering volcanic seamounts rise from the deep blue, attracting sharks, turtles, schooling fish, and unforgettable pelagic encounters that define Saba diving.",
    sites: ["Third Encounter", "The Needle", "Twilight Zone", "Outer Limits", "Mt. Michel", "Shark Shoals"],
  },
  {
    id: "tent-reef",
    title: "Tent Reef",
    subtitle: "Something different on every dive.",
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imageAlt: "Green turtle gliding over healthy coral reef with sea fans and sponges, Saba.",
    objectPosition: "center",
    body: "A diverse mix of coral gardens, mini walls, canyons, swim-throughs, and dramatic drop-offs sits just minutes from Fort Bay Harbor.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "Tedran Wall"],
  },
  {
    id: "ladder-bay",
    title: "Ladder Bay",
    subtitle: "History meets volcanic geology.",
    image: "/images/optimized/nurse-shark-ladder-bay-saba.webp",
    imageAlt: "Nurse shark resting on the sandy bottom at Ladder Bay, Saba.",
    objectPosition: "center",
    body: "Explore lava formations, underwater hot springs, coral-covered boulders, resting turtles, and some of the best macro life in the Caribbean.",
    sites: ["Rays n\u2019 Anchors", "Ladder Labyrinth", "Hot Springs", "50/50", "Porites Point", "Customs House", "Babylon"],
  },
  {
    id: "wells-bay",
    title: "Wells Bay",
    subtitle: "Classic Caribbean reef diving.",
    image: "/images/optimized/wells-bay-dive-site-saba.webp",
    imageAlt: "Wells Bay along Saba's rugged northwest coast, Caribbean Netherlands.",
    objectPosition: "center",
    body: "Healthy coral reefs, Diamond Rock, Man O' War Shoals, turtles, reef sharks, and long relaxing dives create spectacular scenery above and below.",
    sites: ["Otto's Limits", "Torrens Point", "Diamond Rock", "Man O'War Shoals"],
  },
  {
    id: "windwardside",
    title: "Windwardside",
    subtitle: "A completely different side of Saba.",
    image: "/images/optimized/windwardside-dive-site-saba.webp",
    imageAlt: "Dramatic coastline along Saba's Windwardside, Caribbean Netherlands.",
    objectPosition: "center",
    body: "White sand, thriving hard corals, and Saba's only true coral reefs create a vibrant underwater landscape unlike anywhere else around the island.",
    sites: ["Green Island", "Big Rock Market", "Core Gut", "Cove Bay", "Abrams Hole", "Hole in the Corner"],
  },
] as const;



export const metadata = createMetadata({
  title: "Professional Scuba Diving in Saba",
  description:
    "Professional scuba diving in Saba, Dutch Caribbean. Expert-guided dives, certifications, and underwater experiences on one of the Caribbean's best-kept secrets.",
  path: "/",
});

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
              Ancient volcanic forces created one of the Caribbean&apos;s most spectacular
              underwater landscapes. From towering seamounts and dramatic walls to thriving
              coral reefs and volcanic lava formations, every corner of Saba offers a distinctly
              different diving experience.
            </p>
          </div>

          {/* Experience rows — alternating image/text magazine layout */}
          <div className="flex flex-col gap-20">
            {DIVE_EXPERIENCES.map((exp, i) => (
              <FeatureImage
                key={exp.title}
                src={exp.image}
                alt={exp.imageAlt}
                objectPosition={exp.objectPosition}
                imageRight={i % 2 === 1}
                centerText
              >
                <div>
                  <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                    {exp.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/45 uppercase tracking-wide">
                    {exp.subtitle}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-white/70">
                    {exp.body}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {exp.sites.map((site) => (
                      <Link
                        key={site}
                        href={`/dive-sites#${exp.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                      >
                        {site}
                      </Link>
                    ))}
                  </div>
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
              src="/images/optimized/cove-bay-saba.webp"
              alt="Cove Bay, Saba, framed by volcanic hills, Caribbean Netherlands."
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
