import Link from "next/link";
import { Hero } from "@/components/hero";
import { VideoSection } from "@/components/video-section";
import { ReviewsSection } from "@/components/reviews-section";
import { Button } from "@/components/ui/button";

const WHY_SABA = [
  {
    heading: "No Cruise Ships. No Mass Tourism.",
    body: "Saba receives no cruise ship traffic. The island has intentionally kept development small, preserving its authenticity and protecting its marine environment.",
  },
  {
    heading: "Protected Marine Park",
    body: "The Saba Marine Park was one of the first in the Caribbean. Over 43 protected dive sites, carefully managed, with exceptional visibility and healthy reef systems.",
  },
  {
    heading: "Volcanic Island Topography",
    body: "Saba rises sharply from the ocean floor. Underwater, that means dramatic pinnacles, sheer walls, and seamounts that draw open-ocean pelagic species year-round.",
  },
  {
    heading: "World-Famous Pinnacles",
    body: "Saba's underwater pinnacles are internationally recognized as some of the most spectacular dive structures in the Atlantic. Nothing else in the Caribbean compares.",
  },
  {
    heading: "Authentic Caribbean Culture",
    body: "One of the few remaining unspoiled Caribbean islands. Saba is quiet, genuine, and unlike anything you will find on the tourist circuit.",
  },
  {
    heading: "Extraordinary Marine Life",
    body: "Reef sharks, nurse sharks, green and hawksbill turtles, eagle rays, frogfish, seahorses, and some of the healthiest coral in the region.",
  },
] as const;

const PINNACLES = [
  {
    name: "Third Encounter",
    aka: "The Needle",
    description: "One of the most celebrated pinnacle dives in the Caribbean. An open-ocean seamount rising from depth, surrounded by sharks, rays, and pelagic life.",
  },
  {
    name: "Twilight Zone",
    description: "A dramatic deep pinnacle dive with extraordinary coral formations and consistently impressive pelagic encounters. A site that defines Saba diving.",
  },
  {
    name: "Outer Limits",
    description: "Remote and wild, Outer Limits rewards experienced divers with open-ocean exposure, large schools of fish, and the sense of diving at the edge of something vast.",
  },
  {
    name: "Mt. Michel",
    description: "A towering seamount that breaks the surface, diving deep with walls covered in coral growth and consistent shark activity in the blue water beyond.",
  },
  {
    name: "Shark Shoals",
    description: "Named for a reason. Consistently reliable shark encounters in a spectacular setting — one of the most requested sites on the Sea Saba schedule.",
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
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Why dive Saba?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Saba is not a typical Caribbean dive destination. It is one of the
              region&apos;s most rewarding — and least crowded — underwater environments.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_SABA.map((item) => (
              <div key={item.heading}>
                <h3 className="text-base font-semibold text-foreground">
                  {item.heading}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Dive Saba's World Famous Pinnacles */}
      <section className="bg-[#0B0F3B] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Dive Saba&apos;s world-famous pinnacles.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Saba&apos;s underwater pinnacles are internationally recognized as some of
              the most spectacular dive structures in the Atlantic. These seamounts
              rise from the deep, attract open-ocean pelagic life, and deliver
              encounters found nowhere else in the Caribbean.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PINNACLES.map((site) => (
              <div
                key={site.name}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-base font-semibold text-white">
                  {site.name}
                  {"aka" in site && (
                    <span className="ml-2 text-sm font-normal text-white/50">
                      ({site.aka})
                    </span>
                  )}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {site.description}
                </p>
              </div>
            ))}
          </div>
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
