import Link from "next/link";
import { Hero } from "@/components/hero";
import { VideoSection } from "@/components/video-section";
import { ReviewsSection } from "@/components/reviews-section";
import { Button } from "@/components/ui/button";

const WHY_SABA_FEATURED = [
  {
    heading: "World-Famous Pinnacles",
    body: "Volcanic origins created dramatic underwater pinnacles unlike anything else in the Caribbean. These seamounts rise from the deep and deliver encounters that divers remember for years.",
    image: "/images/CandiceLandauPinnacleSquare.jpg",
  },
  {
    heading: "Uncrowded by Design",
    body: "Saba has chosen a different path. There are no large resorts, no cruise ship crowds, and no busy dive boats competing for space. The result is a quieter, more personal experience both above and below the surface.",
    image: "/images/FTDiamondRock.jpg",
  },
  {
    heading: "Small Island, Big Heart",
    body: "Our greatest asset isn't found underwater. It's the people. Friendly faces, welcoming communities, and genuine island hospitality make visitors feel at home from the moment they arrive.",
    image: "/images/SabaTidePools.jpg",
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

const PINNACLES_FEATURED = [
  {
    name: "Third Encounter",
    subtitle: "The Needle",
    description: "One of Saba's most celebrated pinnacle dives. An open-ocean seamount rising from depth, surrounded by sharks, rays, and pelagic life.",
  },
  {
    name: "Twilight Zone",
    subtitle: null,
    description: "A dramatic deep pinnacle dive with striking coral formations, blue-water exposure, and frequent pelagic encounters.",
  },
  {
    name: "Outer Limits",
    subtitle: null,
    description: "Remote and wild, Outer Limits rewards experienced divers with open-ocean exposure, large schools of fish, and the feeling of diving at the edge of something vast.",
  },
] as const;

const PINNACLES_SECONDARY = [
  {
    name: "Mt. Michel",
    description: "A deep seamount south of the main pinnacle plateau, known for dramatic structure, coral growth, and blue-water encounters.",
  },
  {
    name: "Shark Shoals",
    description: "A favorite among experienced divers, known for shark encounters, blue water, and its spectacular setting near Diamond Rock.",
  },
  {
    name: "Diamond Rock",
    description: "A dramatic seamount that breaks the surface north of Saba, with deep walls, blue-water exposure, and unforgettable scenery above and below the waterline.",
  },
  {
    name: "Man O'War Shoals",
    description: "Known as Saba's mini-cles, these smaller pinnacles offer dramatic structure, healthy reef life, and an accessible taste of Saba's volcanic underwater terrain.",
  },
] as const;

const MARINE_LIFE = [
  { name: "Reef Sharks" },
  { name: "Nurse Sharks" },
  { name: "Green Turtles" },
  { name: "Hawksbill Turtles" },
  { name: "Eagle Rays" },
  { name: "Frogfish" },
  { name: "Seahorses" },
  { name: "Lobsters" },
  { name: "Healthy Coral Reefs" },
] as const;

const FEATURED_SITES = [
  {
    name: "Third Encounter",
    skillLevel: "Advanced",
    depthRange: "18–40 m",
    marineLife: "Sharks, rays, pelagics",
    photography: "Wide-angle, open ocean",
    href: "/dive-sites",
  },
  {
    name: "Ladder Labyrinth",
    skillLevel: "Beginner – Intermediate",
    depthRange: "9–21 m",
    marineLife: "Turtles, reef fish, eels",
    photography: "Macro, reef portraits",
    href: "/dive-sites",
  },
  {
    name: "Shark Shoals",
    skillLevel: "Intermediate – Advanced",
    depthRange: "15–35 m",
    marineLife: "Reef sharks, schooling fish",
    photography: "Wide-angle, blue water",
    href: "/dive-sites",
  },
  {
    name: "Man O' War Shoals",
    skillLevel: "Intermediate",
    depthRange: "12–30 m",
    marineLife: "Nurse sharks, rays, lobsters",
    photography: "Reef, macro, wide",
    href: "/dive-sites",
  },
] as const;

const SEA_SABA_CREDENTIALS = [
  { stat: "Max 8 Divers", label: "Per Guide" },
  { stat: "Since 1985", label: "Operating" },
  { stat: "PADI 5-Star", label: "IDC Center" },
  { stat: "10–25 min", label: "Boat Rides" },
  { stat: "Local Experts", label: "Your Guides" },
  { stat: "Marine Conservation", label: "Supported" },
] as const;

const FAQ_ITEMS = [
  {
    question: "How do I get to Saba?",
    answer: "Fly via St. Maarten (SXM) on Winair, or take the high-speed ferry from St. Maarten. Both options take under 20 minutes.",
  },
  {
    question: "What certification do I need?",
    answer: "Most dives are available from Open Water level. Some pinnacle and advanced sites require Advanced Open Water or equivalent. Technical dives require appropriate certification.",
  },
  {
    question: "When is the best time to dive?",
    answer: "Saba offers year-round diving. Visibility is consistently excellent. Winter and spring bring calmer seas; summer and fall offer warm water and excellent macro conditions.",
  },
  {
    question: "Can non-divers join?",
    answer: "Saba has excellent snorkeling and land-based activities. Non-diving partners are welcome to travel with dive groups.",
  },
  {
    question: "What marine life can I expect?",
    answer: "Reef sharks, nurse sharks, turtles, eagle rays, frogfish, seahorses, large lobsters, and some of the healthiest coral in the Caribbean.",
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
            {WHY_SABA_FEATURED.map((item) => (
              <div
                key={item.heading}
                className="group relative flex flex-col overflow-hidden rounded-lg"
              >
                {/* Photo */}
                <div
                  className="h-52 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 sm:h-60"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                {/* Content */}
                <div className="flex flex-1 flex-col bg-background p-5">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.heading}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </div>
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

      {/* 3. Dive Saba's Volcanic Seascape */}
      <section className="bg-[#0B0F3B] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Image + heading feature */}
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Image */}
            <div className="overflow-hidden rounded-lg">
              <img
                src="/images/DSC03073.jpg"
                alt="Saba dive boat at Diamond Rock"
                className="h-72 w-full object-cover sm:h-96 lg:h-[28rem]"
              />
            </div>
            {/* Heading + intro */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Dive Saba&apos;s volcanic seascape.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/70">
                Saba&apos;s volcanic peaks continue beneath the sea, creating dramatic
                pinnacles, seamounts, walls, and shoals. These are the dives that
                made Saba famous.
              </p>
            </div>
          </div>

          {/* Primary site cards */}
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {PINNACLES_FEATURED.map((site) => (
              <div
                key={site.name}
                className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-base font-semibold text-white">
                  {site.name}
                  {site.subtitle && (
                    <span className="ml-2 text-sm font-normal text-white/50">
                      ({site.subtitle})
                    </span>
                  )}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">
                  {site.description}
                </p>
              </div>
            ))}
          </div>

          {/* Secondary sites — compact list */}
          <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {PINNACLES_SECONDARY.map((site) => (
              <div key={site.name}>
                <h4 className="text-sm font-semibold text-white">{site.name}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                  {site.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base font-semibold">
              <Link href="/dive-sites">Explore All Dive Sites</Link>
            </Button>
          </div>

        </div>
      </section>

      {/* 4. Marine Life */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Remarkable marine life.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The Saba Marine Park supports one of the healthiest reef ecosystems
              in the Caribbean. Consistent encounters with large marine species are
              a defining feature of diving here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {MARINE_LIFE.map((species) => (
              <span
                key={species.name}
                className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground"
              >
                {species.name}
              </span>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild variant="outline" size="lg" className="text-base font-semibold">
              <Link href="/dive-sites">Discover Marine Life</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Featured Dive Sites */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Featured dive sites.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Over 43 protected sites in the Saba Marine Park — from beginner-friendly
              reefs to world-class open-ocean pinnacles.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURED_SITES.map((site) => (
              <Link
                key={site.name}
                href={site.href}
                className="group flex flex-col rounded-lg border border-border/60 bg-background p-6 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {site.name}
                </h3>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Skill Level</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{site.skillLevel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Depth</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{site.depthRange}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Marine Life</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{site.marineLife}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Photography</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{site.photography}</dd>
                  </div>
                </dl>
                <span className="mt-6 text-sm font-medium text-primary">
                  View site →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild variant="outline" size="lg" className="text-base font-semibold">
              <Link href="/dive-sites">View All Dive Sites</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Why Dive With Sea Saba */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Why dive with Sea Saba?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Sea Saba has been operating since 1985 — one of the longest-running dive
              operations in the Caribbean. Small groups, experienced local guides,
              and a genuine commitment to the marine environment.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SEA_SABA_CREDENTIALS.map((item) => (
              <div
                key={item.stat}
                className="rounded-lg border border-border/60 bg-card p-6"
              >
                <div className="text-2xl font-semibold text-primary">{item.stat}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video section — motion break between credentials and reviews */}
      <VideoSection />

      {/* 7. Reviews & Social Proof */}
      <ReviewsSection />

      {/* 8. Group Travel */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Group travel.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Sea Saba works regularly with dive clubs, dive shops, and tour
                operators bringing groups to Saba. We offer flexible scheduling,
                group coordination, and the local expertise to make a group trip
                work smoothly.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>Dive clubs and membership groups</li>
                <li>Dive shops and retail operators</li>
                <li>Tour operators and travel agents</li>
                <li>Flexible scheduling and group pricing</li>
                <li>Dedicated coordination and local expertise</li>
              </ul>
              <div className="mt-8">
                <Button asChild size="lg" className="text-base font-semibold">
                  <Link href="/contact">Request Group Quote</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-8">
              <h3 className="text-lg font-semibold text-foreground">
                Bringing a group to Saba?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Contact us directly to discuss your group&apos;s needs — size, dates,
                experience levels, and any specific requests. We&apos;ll put together
                a plan that works for your group.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Sea Saba has hosted groups from dive clubs around the world.
                Our boats accommodate larger groups comfortably, and our team
                knows how to run a smooth group operation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Plan Your Trip */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Plan your trip.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Getting to Saba takes a little planning. The island is worth it.
              Here&apos;s what you need to know.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Getting There", body: "Fly via St. Maarten on Winair, or take the Saba Ferry. Both connections are straightforward and take under 20 minutes." },
              { title: "Flights", body: "Most visitors fly into Princess Juliana (SXM) in St. Maarten, then connect to Saba on Winair's short regional hop." },
              { title: "Ferry Options", body: "The high-speed ferry from St. Maarten's Great Bay Marina is a popular and scenic option for reaching Saba." },
              { title: "What to Pack", body: "Light layers, reef-safe sunscreen, and your certification card. Sea Saba provides all dive gear if needed." },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild size="lg" className="text-base font-semibold">
              <Link href="/plan-your-trip">Start Planning</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 10. Where to Stay */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Where to stay.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Saba has a range of accommodation options — from intimate guesthouses
              to boutique hotels — all within easy reach of Sea Saba&apos;s dock.
              We can recommend properties that work well for divers.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Most accommodation is in or around Windwardside, the island&apos;s main
              village, a short drive from the dive center.
            </p>
            <div className="mt-8">
              <Button asChild variant="outline" size="lg" className="text-base font-semibold">
                <Link href="/plan-your-trip">View Accommodations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Frequently asked questions.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <h3 className="text-base font-semibold text-foreground">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final CTA */}
      <section className="border-t border-border/40 bg-[#0B0F3B] py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ready to dive Saba?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Book directly with Sea Saba. Small groups, professional guides, and
            one of the Caribbean&apos;s finest dive operations.
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
