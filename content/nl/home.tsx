import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { ImageCard } from "@/components/image-card";
import { FeatureImage } from "@/components/feature-image";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { diveSiteAnchors, planYourTripAnchors } from "@/lib/anchors";
import { localeHref, type TranslationReview } from "@/lib/locale";

/**
 * Dutch draft of `app/(en)/page.tsx` (#151). Draft only — human review
 * required before this may be published. Terminology follows
 * `content/nl/GLOSSARY.md`. Structure mirrors the English source; section
 * anchors and image assets are shared.
 */
export const review: TranslationReview = {
  status: "draft",
  reviewedBy: null,
  reviewedAt: null,
  source: "app/(en)/page.tsx",
  sourceHash: "59f04ad3f270b1c79dffb5978589a424fc6835f4",
};

export const nlMetadata = {
  title: "Professioneel scuba duiken op Saba",
  description:
    "Professioneel scuba duiken op Saba, Caribisch Nederland. Duiken onder deskundige begeleiding, brevetteringen en geweldige duikervaringen op een van de best bewaarde “geheimen” van het Caraïbisch gebied.",
};

const WHY_SABA_FEATURED = [
  {
    heading: "Wereldberoemde pinnacles",
    body: "Saba's vulkanische oorsprong creëerde dramatische onderwater pinnacles die je nergens anders in het Caraïbisch gebied vindt. Deze onderzeese bergen of rotsformaties rijzen op uit de diepte en leveren een duik ervaring waar duikers jaren over napraten.",
    image: "/images/optimized/divers-above-pinnacle-saba.webp",
    imageAlt: "Duikers hangen boven een met koraal bedekte vulkanische pinnacle in het Saba Marine Park.",
    bgPosition: "top",
  },
  {
    heading: "Bewust kleinschalig",
    body: "Saba is anders!. Geen grote resorts, geen massa toerisme van cruiseschepen en geen drukke duikboten waar je je een plek moet bemachtigen. Dit alles resulteert in een rustigere, persoonlijkere ervaring, zowel boven als onder water.",
    image: "/images/optimized/fin-and-tonic-boat-diamond-rock.webp",
    imageAlt: "Sea Saba duikboot “Fin & Tonic” aan de mooring bij Diamond Rock, voor de kust van Saba.",
    bgPosition: "center",
  },
  {
    heading: "Klein Eiland, Hartverwarmend",
    body: "Ons grootste goed ligt niet onder water. Het is de lokale bevolking. De vriendelijke gezichten, de gastvrije gemeenschap en de oprechte gastvrijheid op het eiland, zorgen ervoor dat bezoekers zich vanaf het eerste moment thuis voelen.",
    image: "/images/optimized/windwardside-village-saba.webp",
    imageAlt: "Kleurrijke huisjes met de bekende rode daken in Windwardside op de groene heuvels van Saba.",
    bgPosition: "center",
  },
] as const;

const WHY_SABA_SECONDARY = [
  {
    heading: "Beschermd Sinds 1987",
    body: "Het Saba Marine Park beschermt de lokale wateren al sinds 1987 actief. Gezonde riffen en een overvloed aan zeeleven zijn het directe resultaat van tientallen jaren consequent beheer.",
  },
  {
    heading: "Duik Belevenissen In Het “Wild”",
    body: "Door het relatief rustige duik toerisme gedraagt het zeeleven zich vaak natuurlijk. Haaien, schildpadden en roggen komen vaak dichtbij, niet omdat ze aan duikers gewend zijn, maar omdat ze hier ongestoord kunnen leven.",
  },
  {
    heading: "Actieve Natuurbescherming",
    body: "Natuurbescherming is op Saba onderdeel van het dagelijks leven. Koraalduivels worden actief beheerd. De Saba onderwater rijkdom is beschermd. De toewijding van het eiland aan natuurbehoud is wat het duiken zo bijzonder maakt en houdt.",
  },
] as const;

const DIVE_EXPERIENCES = [
  {
    anchor: diveSiteAnchors.pinnacles,
    title: "The Pinnacles",
    subtitle: "De Duiken Die Saba Beroemd Maakten.",
    image: "/images/optimized/diver-volcanic-pinnacle-saba.webp",
    imageAlt: "Duiker boven een met koraal bedekte vulkanische “pinnacle” in het Saba Marine Park.",
    objectPosition: "center",
    body: "Torenhoge vulkanische pinnacles rijzen op uit het diepe blauw en trekken haaien, schildpadden en scholen vissen aan. Het zijn deze onvergetelijke duik ervaringen in open zee, die het duiken op Saba bepalen.",
    sites: ["Third Encounter", "Twilight Zone", "Outer Limits", "Mt. Michel", "Shark Shoals"],
  },
  {
    anchor: diveSiteAnchors.tentReef,
    title: "Tent Reef",
    subtitle: "Elke duik stek is weer anders.",
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imageAlt: "Groene schildpad glijdt over een gezond koraalrif met zeewaaiers en sponzen op Saba.",
    objectPosition: "center",
    body: "Een gevarieerde mix van koraaltuinen, kleine wanden, canyons, swim-throughs en spectaculaire drop-offs, op slechts een paar minuten van Fort Bay Harbor.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "Tedran Wall"],
  },
  {
    anchor: diveSiteAnchors.ladderBay,
    title: "Ladder Bay",
    subtitle: "Geschiedenis ontmoet vulkanische geologie.",
    image: "/images/optimized/nurse-shark-ladder-bay-saba.webp",
    imageAlt: "Verpleegsterhaai rust op de zandbodem bij Ladder Bay, Saba.",
    objectPosition: "center",
    body: "Verken de lavaformaties, onderwater warmwaterbronnen, met koraal begroeide rotsblokken, rustende schildpadden en een van het beste macro leven van het Caraïbisch gebied.",
    sites: ["Rays n’ Anchors", "Ladder Labyrinth", "Hot Springs", "50/50", "Porites Point", "Customs House", "Babylon"],
  },
  {
    anchor: diveSiteAnchors.wellsBay,
    title: "Wells Bay",
    subtitle: "Authentiek Caribisch rifduiken.",
    image: "/images/optimized/wells-bay-dive-site-saba.webp",
    imageAlt: "Wells Bay, langs de ruige noordwestkust van Saba, Caribisch Nederland.",
    objectPosition: "center",
    body: "Gezonde koraalriffen, Diamond Rock, Man O' War Shoals, schildpadden, rifhaaien en lange ontspannen duiken zorgen voor een spectaculair decor, boven én onder water.",
    sites: ["Otto's Limits", "Torrens Point", "Diamond Rock", "Man O'War Shoals"],
  },
  {
    anchor: diveSiteAnchors.windwardside,
    title: "Windwardside",
    subtitle: "Een heel andere kant van Saba.",
    image: "/images/optimized/windwardside-dive-site-saba.webp",
    imageAlt: "Dramatische kustlijn langs Windwardside op Saba, Caribisch Nederland.",
    objectPosition: "center",
    body: "Duiken aan de oostkant van Saba biedt unieke, kalkstenen koraalriffen en hagelwitte zandbodems die sterk afwijken van de rest van het vulkanische eiland.",
    sites: ["Green Island", "Big Rock Market", "Core Gut", "Cove Bay", "Abrams Hole", "Hole in the Corner"],
  },
] as const;

export function NlHome() {
  return (
    <>
      {/* 1. Hero — static image, trust indicators, primary Book CTA */}
      <Hero locale="nl" />

      {/* 2. Why Saba */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Saba is gewoon uniek.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              De meeste bezoekers kunnen lastig uitleggen waarom. Saba voelt gewoon heel anders aan dan de andere eilanden van het Caraïbisch gebied. Zowel boven als onder water.
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
              De Duiken Die Saba Beroemd Maakten.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Oeroude vulkanische krachten creëerden een van de meest spectaculaire onderwaterlandschappen van het Caraïbisch gebied. Van torenhoge pinnacles en dramatische wanden tot bloeiende koraalriffen en vulkanische lavaformaties, ieder afzonderlijk deel rondom Saba biedt een heel eigen duikervaring.
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
                  <p className="mt-1 text-sm text-white/60 uppercase tracking-wide">
                    {exp.subtitle}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-white/70">
                    {exp.body}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {exp.sites.map((site) => (
                      <span
                        key={site}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60"
                      >
                        {site}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/dive-sites#${exp.anchor}`}
                    className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4 transition-colors hover:text-white/80"
                  >
                    Ontdek de duikplekken van {exp.title} →
                  </Link>
                </div>
              </FeatureImage>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base font-semibold">
              <Link href="/dive-sites">Ontdek Alle Duikplekken</Link>
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
              Plan Je Reis.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Reizen naar Saba vraagt wat planning maar je wordt beloond met een van de meest onvergetelijke bestemmingen van het Caraïbisch gebied.
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-16">

            <FeatureImage
              src="/images/optimized/saba-212.webp"
              alt="Luchtfoto van Saba genomen vanuit een naderend vliegtuig."
              imageRight
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reizen naar Saba</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Dichterbij dan je denkt.</h3>
                <p className="mt-1 text-sm text-muted-foreground">Slechts 15 minuten vliegen vanaf St. Maarten.</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  De meeste bezoekers komen via St. Maarten en reizen door naar Saba met Winair of de snelle veerboot. De reis is onderdeel van het avontuur met onvergetelijke uitzichten.
                </p>
                <Link href={localeHref("nl", `/plan-your-trip#${planYourTripAnchors.gettingHere}`)} className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  Vluchten en veerboten →
                </Link>
              </div>
            </FeatureImage>

            <FeatureImage
              src="/images/optimized/saba-024.webp"
              alt="Caribische rifhaai boven het rif in het Saba Marine Park."
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overnachten op Saba</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Kleinschalige hotels. Gulle gastvrijheid.</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Van charmante cottages tot boetiekhotels, de accommodaties op Saba weerspiegelen het relaxte tempo en de gastvrijheid van het eiland.
                </p>
                <Link href={localeHref("nl", `/plan-your-trip#${planYourTripAnchors.whereToStay}`)} className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  Accommodaties bekijken →
                </Link>
              </div>
            </FeatureImage>

            <FeatureImage
              src="/images/optimized/green-turtle-with-diver-saba.webp"
              alt="Groene zeeschildpad zwemt aan de oppervlakte met een duiker op de achtergrond, Saba."
              imageRight
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Beste reistijd</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Het hele jaar door geweldig duiken.</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Elk seizoen heeft iets bijzonders, en er is geen slechte tijd om Saba te bezoeken. Warm water, gezonde riffen en wisselend zeeleven maken elke maand de moeite waard.
                </p>
                <Link href={localeHref("nl", `/plan-your-trip#${planYourTripAnchors.whenToVisit}`)} className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  Beste reistijd →
                </Link>
              </div>
            </FeatureImage>

            <FeatureImage
              src="/images/optimized/cove-bay-saba.webp"
              alt="Cove Bay op Saba, omringd door vulkanische heuvels, Caribisch Nederland."
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Het Eilandleven</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Klein eiland. Warm welkom.</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Rustige, veilige dorpjes en vriendelijke mensen. Je verliest een deel van je hart aan Saba, dit is waarom zoveel bezoekers ieder jaar terugkomen. Saba voelt als een tweede thuis.
                </p>
                <Link href={localeHref("nl", `/plan-your-trip#${planYourTripAnchors.history}`)} className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                  Ontdek Saba →
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
          alt="Saba rijst op uit de Caribische Zee tijdens het gouden uur, omringd door diepblauw water (luchtfoto)."
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0F3B]/60 to-[#0B0F3B]/75" />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ben jij klaar voor jouw duiken op Saba?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Boek direct bij Sea Saba. Kleine groepen, ervaren gidsen en duikplekken waarvoor gasten jaar na jaar terugkomen.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <TrackedInternalButton
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-base font-semibold"
              href={localeHref("nl", "/book")}
              eventName="book_now_click"
              buttonText="Book Diving"
              buttonLocation="homepage_final_cta"
            >
              Boek je duiken
            </TrackedInternalButton>
            <Button asChild variant="outline" size="lg" className="border-white/40 bg-transparent text-white hover:bg-white/10 text-base font-semibold">
              <Link href={localeHref("nl", "/plan-your-trip")}>Plan je reis</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
