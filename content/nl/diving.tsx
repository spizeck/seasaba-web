import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Award, Bus, Droplets, ShieldCheck, Wind, HelpCircle, Mountain, Gauge, Waves, Wrench, Anchor, Heart } from "lucide-react";
import { InsuranceCTAs } from "@/components/insurance-ctas";
import { ExperienceSelector } from "@/components/experience-selector";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import { PageSectionNav } from "@/components/navigation/PageSectionNav";
import { CONTACT } from "@/lib/constants";
import { divingAnchors, coursesAnchors, planYourTripAnchors } from "@/lib/anchors";
import { DIVE_PRODUCTS, OPERATIONS, bookingHref } from "@/data/operations";
import { localeHref, type TranslationReview } from "@/lib/locale";

/**
 * Dutch draft of `app/(en)/(content)/diving/page.tsx` (#151). Section anchors
 * match `divingAnchors`; depths, ratios, certification rules and schedule
 * values come from data/operations.ts, not from translated strings. Safety
 * copy (Nitrox rule, flying/hiking after diving, refresher guidance, park
 * rules) is translated conservatively — see REVIEW.md.
 */
export const review: TranslationReview = {
  status: "draft",
  reviewedBy: null,
  reviewedAt: null,
  source: "app/(en)/(content)/diving/page.tsx",
  sourceHash: "9e90b338895b2ed41c760eacc80da4a462e61ffd",
};

export const nlMetadata = {
  title: "Duiken op Saba",
  description:
    `De praktische gids voor duiken op Saba met Sea Saba: bootduiken in het Marine Park, kleine begeleide groepen, duikopties voor elk brevetniveau en gratis ${OPERATIONS.nitroxBlend} Nitrox.`,
};

const TRUST_SIGNALS = [
  { icon: Users, label: "Kleine groepen", sublabel: `Recreatieve duiken — max. ${OPERATIONS.maxRecreationalDiversPerGuide} per gids` },
  { icon: Bus, label: "Gratis taxishuttle", sublabel: "Overal op Saba" },
  { icon: Droplets, label: `Gratis ${OPERATIONS.nitroxBlend} Nitrox`, sublabel: "Voor gebrevetteerde duikers" },
  { icon: Award, label: `Sinds ${OPERATIONS.establishedYear}`, sublabel: "Saba's enige onafgebroken actieve duikcentrum" },
];

const DIVE_EXPERIENCES = [
  {
    title: DIVE_PRODUCTS.classic.name,
    subtitle: "DE KLASSIEKE SEA SABA-ERVARING",
    description:
      "Twee ontspannen duiken in het Saba Marine Park. Perfect voor de meeste gebrevetteerde duikers en onze populairste optie.",
    details: [
      `Vertrek ${DIVE_PRODUCTS.classic.schedule.departure}`,
      `Terug rond ${DIVE_PRODUCTS.classic.schedule.returns}`,
      "Twee duiken tot ~70 ft / 21 m",
      `Gratis ${OPERATIONS.nitroxBlend} Nitrox`,
      // Owner-confirmed rule — kept as page copy, not a canonical
      // `requirement` (see data/operations.ts and docs/OPERATIONS.md).
      "Minimaal Scuba Diver — privégids vereist",
    ],
    cta: "Boek Classic-duiken",
    href: bookingHref("classic"),
    itemId: DIVE_PRODUCTS.classic.slug,
    featured: true,
  },
  {
    title: DIVE_PRODUCTS.advanced.name,
    subtitle: "VOOR ERVAREN DUIKERS",
    description:
      "Verken diepere pinnacles, wanden en zeemynnen met dramatisch onderwaterterrein.",
    details: [
      `Vertrek ${DIVE_PRODUCTS.advanced.schedule.departure}`,
      `Terug rond ${DIVE_PRODUCTS.advanced.schedule.returns}`,
      "Duik 1 tot ~110 ft / 33 m",
      "Duik 2 tot ~70 ft / 21 m",
      "Gratis Nitrox (verplicht op duik 1)",
      DIVE_PRODUCTS.advanced.requirement,
    ],
    cta: "Boek Advanced-duiken",
    href: bookingHref("advanced"),
    itemId: DIVE_PRODUCTS.advanced.slug,
    featured: false,
  },
  {
    title: DIVE_PRODUCTS.afternoon.name,
    subtitle: "EEN ONTSPANNEN MIDDAGDUIK",
    description:
      "Eén middagduik op een van Saba's bekendste stekken. Ideaal om een extra duik toe te voegen of voor een rustigere dag.",
    details: [
      `Vertrek ${DIVE_PRODUCTS.afternoon.schedule.departure}`,
      `Terug rond ${DIVE_PRODUCTS.afternoon.schedule.returns}`,
      "Tot ~70 ft / 21 m",
      // Owner-confirmed rule — same private-guide requirement as Classic.
      "Minimaal Scuba Diver — privégids vereist",
    ],
    cta: "Boek middagduik",
    href: bookingHref("afternoon"),
    itemId: DIVE_PRODUCTS.afternoon.slug,
    featured: false,
  },
  {
    title: DIVE_PRODUCTS.snorkel.name,
    subtitle: "VERKENNING AAN DE OPPERVLAKTE",
    description:
      "Geniet van Saba's riffen, schildpadden en zeeleven vanaf de oppervlakte terwijl duikers dieper gaan.",
    details: [
      `Vertrek ${DIVE_PRODUCTS.snorkel.schedule.departure}`,
      `Terug rond ${DIVE_PRODUCTS.snorkel.schedule.returns}`,
      "Uitrusting inbegrepen",
      "Voor zekere zwemmers",
      "Onbegeleide ervaring",
    ],
    cta: "Boek snorkelen",
    href: bookingHref("snorkel"),
    itemId: DIVE_PRODUCTS.snorkel.slug,
    featured: false,
  },
  {
    title: DIVE_PRODUCTS.private.name,
    subtitle: "EXCLUSIEVE ERVARINGEN",
    description:
      "Privé duiken aan boord van onze in het Caribisch gebied gebouwde catamarans, met flexibele tijden en een programma op maat.",
    details: [
      "Halve of hele dag",
      DIVE_PRODUCTS.private.capacity,
      "Eigen kapitein",
      "Flexibele vertrektijden",
    ],
    cta: "Boek privécharter",
    href: bookingHref("private"),
    itemId: DIVE_PRODUCTS.private.slug,
    featured: false,
  },
  {
    title: "SDI- / TDI-cursussen",
    subtitle: "PROFESSIONELE INSTRUCTIE",
    description:
      "Van Discover Scuba tot Divemaster — leer van ervaren instructeurs in een van de meest belonende duikomgevingen van het Caraïbisch gebied.",
    details: ["Alle brevetniveaus", "Kleine groepen", "SDI- en TDI-opleidingen", "Privéinstructie mogelijk"],
    cta: "Bekijk cursussen",
    href: localeHref("nl", "/courses"),
    featured: false,
  },
] as const;

const DIVING_FAQS = [
  {
    question: "Welke duiktrip moet ik kiezen?",
    answer: (
      <>
        De meeste gebrevetteerde duikers boeken de {DIVE_PRODUCTS.classic.name}. Voldoe je aan de
        ervaringseis en wil je diepere profielen, dan vaart de {DIVE_PRODUCTS.advanced.name} eerder
        uit. Voor één duik en een rustigere dag kies je de {DIVE_PRODUCTS.afternoon.name}. Nog niet
        gebrevetteerd? Bekijk onze{" "}
        <Link href={localeHref("nl", "/courses")} className="font-medium text-primary hover:underline underline-offset-4">cursussen</Link>.
      </>
    ),
  },
  {
    question: "Kan ik met Sea Saba duiken als ik een Scuba Diver-brevet heb?",
    answer: (
      <>
        Ja. Gasten met een Scuba Diver-brevet kunnen de {DIVE_PRODUCTS.classic.name} of{" "}
        {DIVE_PRODUCTS.afternoon.name} boeken zonder minimum aantal gelogde duiken — je duikt dan met
        een privégids.{" "}
        <Link href={localeHref("nl", "/contact?interest=book-diving")} className="font-medium text-primary hover:underline underline-offset-4">Neem contact op</Link>{" "}
        zodat wij dit kunnen regelen.
      </>
    ),
  },
  {
    question: "Heb ik een eigen duikcomputer nodig?",
    answer: (
      <>
        Ja. Een duikcomputer is verplicht bij elke duik. Heb je er geen? Dan zijn er
        huurcomputers beschikbaar.
      </>
    ),
  },
  {
    question: "Heb ik een Nitrox-brevet nodig?",
    answer: (
      <>
        Nee. Een Nitrox-brevet is niet vereist voor de meeste trips. Gebrevetteerde
        Nitrox-duikers krijgen gratis {OPERATIONS.nitroxBlend} Nitrox. Nitrox is wel verplicht
        op duik 1 van de {DIVE_PRODUCTS.advanced.name} — voor die trip heb je dus een
        Nitrox-brevet nodig.
      </>
    ),
  },
  {
    question: "Kunnen we samen duiken als onze ervaringsniveaus verschillen?",
    answer: (
      <>
        Meestal wel. De beste regeling hangt af van het verschil. Zie{" "}
        <Link href={`#${divingAnchors.mixedExperience}`} className="font-medium text-primary hover:underline underline-offset-4">Samen duiken met verschillende ervaringsniveaus</Link>{" "}
        hierboven, of vraag het ons gewoon.
      </>
    ),
  },
  {
    question: "Wat gebeurt er als een geplande stek door de omstandigheden niet kan?",
    answer: (
      <>
        De stekken worden elke dag gekozen op basis van het actuele weer en de stroming, dus de
        crew kan een geplande stek verruilen voor een betere. Je krijgt dezelfde trip en
        hetzelfde aantal duiken.
      </>
    ),
  },
  {
    question: "Wat moet ik meenemen?",
    answer: (
      <>
        Brevetkaart, duikcomputer, logboek, zwemkleding en een handdoek; al het andere is te
        huur. Volledige lijst:{" "}
        <Link href={localeHref("nl", `/plan-your-trip#${planYourTripAnchors.whatToBring}`)} className="font-medium text-primary hover:underline underline-offset-4">Wat neem je mee</Link>.
      </>
    ),
  },
  {
    question: "Duiken jullie altijd vanaf een mooring?",
    answer: (
      <>
        De meeste duiken gebruiken de moorings van het Marine Park, maar niet allemaal. We
        maken ook driftduiken als de omstandigheden daarom vragen of als dat een betere duik
        oplevert. Een drift kan lopen van mooring naar mooring, van een mooring naar een live
        pickup, of met zowel een live drop als een live pickup.
      </>
    ),
  },
] as const;

export function NlDiving() {
  return (
    <>
      <PageHero
        src="/images/optimized/diving-hero.webp"
        alt="Duikers verkennen het rif in het Saba Marine Park"
        title="Duiken met Sea Saba"
        subtitle={`Professionele bootduiken in het Marine Park van Saba sinds ${OPERATIONS.establishedYear}`}
        objectPosition="center bottom"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Sea Saba laat duikers al sinds {OPERATIONS.establishedYear} kennismaken met Saba. Als het enige
        onafgebroken actieve duikcentrum van het eiland combineren we tientallen jaren lokale
        kennis met kleine groepen, comfortabele boten en persoonlijke service.
      </p>

      {/* Trust Signals */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TRUST_SIGNALS.map((signal) => (
          <div
            key={signal.label}
            className="flex flex-col rounded-lg border border-border/40 bg-muted/20 p-4"
          >
            <div className="flex items-center gap-2">
              <signal.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">{signal.label}</span>
            </div>
            <span className="mt-1 text-xs text-muted-foreground">{signal.sublabel}</span>
          </div>
        ))}
      </div>

      {/* On This Page */}
      <PageSectionNav
        className="mt-8"
        offset={0}
        items={[
          { id: divingAnchors.options, label: "Duikopties" },
          { id: divingAnchors.sabaDiving, label: "Duiken op Saba" },
          { id: divingAnchors.diveDay, label: "Een duikdag" },
          { id: divingAnchors.certification, label: "Brevetten" },
          { id: divingAnchors.mixedExperience, label: "Gemengde groepen" },
          { id: divingAnchors.juniorDivers, label: "Kinderen & junioren" },
          { id: divingAnchors.equipment, label: "Uitrusting" },
          { id: divingAnchors.nitrox, label: "Nitrox" },
          { id: divingAnchors.marinePark, label: "Marine Park" },
          { id: divingAnchors.faq, label: "FAQ" },
        ]}
      />

      {/* Dive Experience Intro */}
      <section className="mt-12">
        <FeatureImage
          src="/images/optimized/guests-on-bow-saba.webp"
          alt="Gasten zitten op de boeg van een boot van Sea Saba en kijken naar Saba."
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">De Sea Saba-ervaring</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Sinds {OPERATIONS.establishedYear} verkennen generaties duikers Saba met Sea Saba. Onze
              op maat gemaakte 38-voets catamarans zijn gebouwd voor Caribische omstandigheden en
              ontworpen rond het comfort van de duiker, met ruime overdekte dekken, cameratafels,
              zoetwater-spoelbakken, grote ladders en ervaren lokale crews.
            </p>
          </div>
        </FeatureImage>

        {/* Feature checklist — full-width 2-col grid below the media row */}
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Gratis taxipickup overal op Saba</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Gratis {OPERATIONS.nitroxBlend} Nitrox voor gebrevetteerde duikers</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Saba&apos;s enige onafgebroken actieve duikcentrum sinds {OPERATIONS.establishedYear}</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Maximaal {OPERATIONS.maxRecreationalDiversPerGuide} duikers per gids op recreatieve duiken</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Grote stabiele catamarans met schaduw en marinetoiletten</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Uitrusting gespoeld en terugbezorgd bij je accommodatie</span></li>
        </ul>
      </section>

      {/* Dive Options Grid */}
      <section id={divingAnchors.options} className="mt-14 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Duikopties</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kies de ervaring die past bij je brevetniveau en je planning.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {DIVE_EXPERIENCES.map((option) => (
            <div
              key={option.title}
              className={`relative flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-primary/30 ${
                option.featured
                  ? "border-primary/50 ring-1 ring-primary/20"
                  : "border-border/60"
              }`}
            >
              {option.featured && (
                <span className="absolute -top-3 left-6 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  Meest gekozen
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{option.title}</h3>
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {option.subtitle}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {option.details.map((detail) => (
                  <span
                    key={detail}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {detail}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-6">
                {"itemId" in option ? (
                  <TrackedInternalButton
                    variant={option.featured ? "default" : "outline"}
                    className="w-full"
                    href={option.href}
                    eventName="book_now_click"
                    buttonText={option.cta}
                    buttonLocation="diving_option_card"
                    bookingItem={option.itemId}
                  >
                    {option.cta}
                  </TrackedInternalButton>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={option.href}>{option.cta}</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What Diving Saba Is Like */}
      <section id={divingAnchors.sabaDiving} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Waves className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Hoe duiken op Saba eruitziet</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba is een slapende vulkaan die recht uit diep water omhoogkomt, en dat merk je aan het
          duiken. In plaats van vlakke koraaltuinen bestaan de stekken uit vulkanisch gesteente:
          pinnacles die richting de oppervlakte klimmen, wanden, rotsblokvelden en lavaruggen.
          Alles waar we duiken ligt binnen het Saba Marine Park, een korte boottocht vanuit{" "}
          {OPERATIONS.harbor}.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Vulkanisch terrein, echte variatie</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              De duikstekken van Saba omvatten pinnacles voor de kust, wanden, rotsblokvelden en
              lavaruggen. Third Encounter, Shark Shoal en Twilight Zone behoren tot de diepere
              stekken, terwijl stekken dichter bij de kust, zoals Tent Reef, ondiep beginnen en
              afzakken naar richels en wanden. Man O&apos; War Shoals en Diamond Rock rijzen net zo
              dramatisch op, hoewel beide vlak bij de kust liggen. De dieptes en profielen variëren
              genoeg om een week duiken nooit te laten herhalen.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Omstandigheden verschillen per stek en per dag</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Saba ligt in open oceaan, dus de omstandigheden zijn echt. Exposed pinnacles kunnen
              stroming hebben, stekken aan de lijzijde zijn meestal rustiger en de oostkant is
              alleen duikbaar bij rustig weer. Onze crew kiest de stekken per dag op basis van de
              werkelijke omstandigheden en de ervaring aan boord. Niet elke stek past bij elke
              duiker of elke dag.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              De meeste duiken gebruiken de moorings van het Marine Park, maar we maken ook
              driftduiken als de omstandigheden daarom vragen of als dat een betere duik oplevert.
              Dat kan betekenen: driften van mooring naar mooring, starten bij een mooring met een
              live pickup, of zowel een live drop als een live pickup. Het water in gaan gebeurt
              altijd vanaf de boot, en onze grote diepe ladders maken het weer aan boord komen
              eenvoudig.
            </p>
          </div>
        </div>
      </section>

      <ExperienceSelector locale="nl" />

      {/* A Day with Sea Saba */}
      <section id={divingAnchors.diveDay} className="mt-16 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Een dag met Sea Saba</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
            <h3 className="text-sm font-semibold text-foreground">Voor de duik</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Gratis vervoer tussen je accommodatie en het duikcentrum</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Hulp van de crew bij het opbouwen van je set, fleswissels en materiaal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>PRO-kranen, geschikt voor zowel DIN- als yoke-ademautomaten</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Uitgebreide duikbriefings over omstandigheden, zeeleven en hoogtepunten van de stek</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Zuurstof, EHBO, reservemateriaal en Save-a-Dive-kits aan boord</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
            <h3 className="text-sm font-semibold text-foreground">Op de boot</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Op maat gemaakte 38-voets motorcatamarans, ontworpen en gebouwd voor Caribische omstandigheden</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Schaduwrijke zitplaatsen, ruime dekken, loungeplekken op de boeg en het bovendek van Fin &amp; Tonic</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Cameratafels, geïntegreerde zoetwaterspoeltanks en zoetwaterslangen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Grote diepe ladders voor een makkelijke uitstap</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Gefilterd drinkwater en Gatorade aan boord</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Ontspannen tempo met ervaren lokale crews</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
            <h3 className="text-sm font-semibold text-foreground">Na de duik</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Laat na je laatste duikdag je uitrusting gewoon bij ons achter</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Sea Saba spoelt, bewaart en bezorgt je uitrusting terug bij je accommodatie</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Meer tijd om van Saba te genieten in plaats van nat materiaal over het eiland te sjouwen</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Koude drankjes bij het duikcentrum: lokale sappen, frisdrank, water en bier van Deep Dive Brewing Co.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Experience & Certification */}
      <section id={divingAnchors.certification} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Ervaring &amp; brevetten</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sea Saba biedt meerdere duikopties, mede zodat elke duiker wordt gekoppeld aan stekken en
          profielen die passen bij zijn of haar opleiding en ervaring. Kies de trip die bij jou
          past — niet de trip met de meeste duiken.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Open Water-gebrevetteerd? Begin met de Classic.</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              De {DIVE_PRODUCTS.classic.name} past bij de meeste gebrevetteerde duikers: twee
              begeleide duiken op stekken rond de 70 ft / 21 m, in een ontspannen tempo. De{" "}
              {DIVE_PRODUCTS.afternoon.name} werkt hetzelfde als je één duik en een rustigere dag
              wilt.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Diepere profielen? Dat is de Advanced-trip.</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              De {DIVE_PRODUCTS.advanced.name} vaart eerder uit, duikt dieper op de eerste duik en
              vereist Nitrox op duik 1. Toelatingseis: {DIVE_PRODUCTS.advanced.requirement}.
              Het is een gecombineerde brevet- en ervaringseis, niet alleen een kaartcontrole.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Scuba Diver-gebrevetteerd? Je bent welkom.</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Scuba Diver is een brevet met begeleiding, dus je mag er niet zelfstandig mee duiken
              met een buddy zoals met Open Water. Je kunt wel de {DIVE_PRODUCTS.classic.name} of{" "}
              {DIVE_PRODUCTS.afternoon.name} boeken zonder minimum aantal gelogde duiken — je duikt
              dan met een privégids. Vermeld het bij je boeking zodat wij dit kunnen regelen.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Nog niet gebrevetteerd, of is het een tijd geleden?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Try Scuba en volledige brevetopleidingen vind je op onze{" "}
              <Link href={localeHref("nl", "/courses")} className="font-medium text-primary hover:underline underline-offset-4">cursuspagina</Link>.
              Is je laatste duik meer dan {OPERATIONS.refresher.recommendedAfterYears} jaar geleden,
              dan raden we een refresher aan om weer op je gemak te raken. Na grofweg{" "}
              {OPERATIONS.refresher.generallyRequiredAfterYears} jaar moet je erop rekenen dat die
              vereist is. Het is echter geen harde grens. Welke optie het beste past, bepaalt Sea
              Saba op basis van je werkelijke ervaring, recente duikgeschiedenis, comfortniveau en
              de duiken die je hebt gepland. Soms is een privégids het betere antwoord. Vermeld het
              bij je boeking of{" "}
              <Link href={localeHref("nl", "/contact?interest=book-diving")} className="font-medium text-primary hover:underline underline-offset-4">stuur ons een bericht</Link>
              {" "}— dan adviseren we de juiste regeling.
            </p>
          </div>
        </div>
      </section>

      {/* Mixed-Experience Groups */}
      <section id={divingAnchors.mixedExperience} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Samen duiken met verschillende ervaringsniveaus</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Meestal kan dat. Het vraagt alleen wat planning. Hoe het werkt, hangt af van het verschil
          in ervaring.
        </p>

        <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-primary">✓</span>
            <span>
              <strong className="font-medium text-foreground">Open Water- + Advanced-gebrevetteerde partners.</strong>{" "}
              Je hebt opties:
              <span className="mt-1.5 block space-y-1.5">
                <span className="block">Boek samen de {DIVE_PRODUCTS.classic.name} en deel beide duiken.</span>
                <span className="block">
                  Of de duiker die aan de eis voldoet begint eerder op de {DIVE_PRODUCTS.advanced.name} (duik 1)
                  en deelt duik 2 met de Classic-groep. Voegt diegene de middagduik toe, dan wordt het
                  een dag met drie duiken, waarvan duik 2 en 3 gedeeld worden met de partner. De
                  middagduik kan meestal dezelfde dag worden toegevoegd, als er plek is.
                </span>
              </span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">✓</span>
            <span>
              <strong className="font-medium text-foreground">Scuba Diver + zelfstandige duikers.</strong>{" "}
              Een privégids kan de gast met het Scuba Diver-brevet begeleiden op dezelfde boot. De
              groep blijft bij elkaar terwijl elke duiker binnen de grenzen van zijn of haar brevet duikt.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">✓</span>
            <span>
              <strong className="font-medium text-foreground">Een duiker en een snorkelaar.</strong>{" "}
              De {DIVE_PRODUCTS.snorkel.name} deelt de boot met de{" "}
              {DIVE_PRODUCTS.afternoon.name}, dus niet-duikende vrienden kunnen de middag samen met
              de duiker op het water doorbrengen.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">✓</span>
            <span>
              <strong className="font-medium text-foreground">Grotere of bijzondere groepen.</strong>{" "}
              Een {DIVE_PRODUCTS.private.name.toLowerCase()} houdt iedereen op één boot en biedt meer
              flexibiliteit in tijden en programma.
            </span>
          </li>
        </ul>

        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Elke groep is anders. Twijfel je welke regeling past, vertel ons je brevetten en
            gelogde duiken — dan adviseren we de juiste opzet.{" "}
            <Link href={localeHref("nl", "/contact?interest=book-diving")} className="font-medium text-primary hover:underline underline-offset-4">
              Neem contact op
            </Link>{" "}
            of stuur ons een bericht via{" "}
            <TrackedContactLink
              href={CONTACT.whatsappHref}
              eventName="whatsapp_click"
              buttonText="WhatsApp — diving mixed groups"
              external
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              WhatsApp
            </TrackedContactLink>
            .
          </p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Reis je met jonge duikers? Zie{" "}
          <Link href={`#${divingAnchors.juniorDivers}`} className="font-medium text-primary hover:underline underline-offset-4">
            Duiken met kinderen en junior-duikers
          </Link>{" "}
          hieronder.
        </p>
      </section>

      {/* Diving with Kids & Junior Divers */}
      <section id={divingAnchors.juniorDivers} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Duiken met kinderen en junior-duikers</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Duiken met jonge duikers is iets wat we zelf kennen. Onze eigen twee kinderen werden op
          hun tiende gebrevetteerd en groeiden op met duiken op Saba. Junior-duikers zijn welkom op
          onze trips en duiken binnen de diepte-, begeleidings- en andere grenzen van hun brevet.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Gezinnen met jongere duikers zijn vaak het beste af met een eigen gids. We raden een
          privégids vooral aan bij kinderen onder de{" "}
          {OPERATIONS.juniorPrivateGuideRecommendedUnderAge}: zo bepaalt het gezin zelf het tempo en
          het duikprofiel in plaats van mee te moeten met de rest van de groep.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Elke jonge duiker is anders, dus vertel ons over hun brevet, ervaring en comfort in het
          water — dan helpen we je de juiste regeling te kiezen.{" "}
          <Link href={localeHref("nl", "/contact?interest=book-diving")} className="font-medium text-primary hover:underline underline-offset-4">
            Neem contact op
          </Link>{" "}
          of stuur ons een bericht via{" "}
          <TrackedContactLink
            href={CONTACT.whatsappHref}
            eventName="whatsapp_click"
            buttonText="WhatsApp — diving junior divers"
            external
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            WhatsApp
          </TrackedContactLink>
          .
        </p>
      </section>

      {/* Equipment, Tanks & Computers */}
      <section id={divingAnchors.equipment} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Uitrusting, flessen &amp; duikcomputers</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Neem je eigen set mee of huur alles op het eiland — beide is hier normaal. De crew
          verzorgt de opbouw en de fleswissels; jij zorgt voor je brevetkaart en je computer.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Wat je nodig hebt</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Brevetkaart of digitaal brevet</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Een duikcomputer is verplicht bij elke duik; huurcomputers zijn beschikbaar als je er geen hebt.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Logboek of digitale duikgeschiedenis</span></li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Flessen &amp; gas</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>AL80-flessen standaard; AL100&apos;s op aanvraag</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>PRO-kranen werken met zowel DIN- als yoke-ademautomaten</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Gratis {OPERATIONS.nitroxBlend} Nitrox voor gebrevetteerde duikers (details in de <Link href={`#${divingAnchors.nitrox}`} className="font-medium text-primary hover:underline underline-offset-4">Nitrox-sectie</Link>)</span></li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Huuruitrusting</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Complete huurpakketten: trimvest, ademautomaat, wetsuit, masker, vinnen</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Duikcomputers te huur</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Geef bij het boeken je maten door, dan ligt je materiaal klaar bij aankomst</span></li>
            </ul>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Voor de volledige paklijst, inclusief rifvriendelijke zonnebrand en drybags, zie{" "}
          <Link href={localeHref("nl", `/plan-your-trip#${planYourTripAnchors.whatToBring}`)} className="font-medium text-primary hover:underline underline-offset-4">
            Wat neem je mee
          </Link>{" "}
          op de pagina Plan je reis.
        </p>
      </section>

      {/* Nitrox */}
      <section id={divingAnchors.nitrox} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Wind className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Gratis Nitrox voor gebrevetteerde duikers</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sea Saba voorziet alle duikers met een Nitrox-brevet van gratis {OPERATIONS.nitroxBlend}{" "}
          Nitrox: geen extra kosten, geen huurprijs. Neem wel een bewijs van je Nitrox-brevet mee.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Waarom Nitrox op Saba?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              De duikprofielen van Saba kunnen dieper zijn dan gemiddeld. Vulkanische pinnacles zoals
              Third Encounter en Shark Shoal brengen duikers tot ongeveer 30 m / 100 ft. Bij een
              meerdaags duikprogramma met twee duiken per dag waarderen veel duikers de extra
              nuldecompressietijd die Nitrox op deze dieptes geeft.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Nitrox past ook goed bij Saba&apos;s repeterende duikschema: het vermindert de
              stikstofbelasting vergeleken met perslucht op hetzelfde duikprofiel.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Onze standaard voor luchtkwaliteit</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sea Saba vult alle flessen — perslucht én Nitrox — met hogedruk-ademluchtcompressoren
              die volgens IANTD-normen worden onderhouden. Onze vulinstallatie wordt regelmatig
              getest om schoon, droog en veilig ademgas te garanderen. We produceren onze{" "}
              {OPERATIONS.nitroxBlend} Nitrox met een eigen membraansysteem in plaats van te blenden
              met industriële zuurstof.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />Gratis 32% Nitrox op alle duiken die ervoor in aanmerking komen</li>
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />Membraansysteem levert een consistent, schoon mengsel</li>
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />Bewijs van Nitrox-brevet vereist</li>
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />SDI-/TDI-Nitroxcursussen beschikbaar op Saba</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Nog geen Nitrox-brevet?{" "}
            <Link href={localeHref("nl", `/courses#${coursesAnchors.nitrox}`)} className="font-medium text-primary hover:underline underline-offset-4">
              Bekijk onze SDI Nitrox-cursus
            </Link>
            {" "}om je voor je volgende duikreis te brevetteren en vanaf dag één gratis Nitrox op Saba te gebruiken.
          </p>
        </div>
      </section>

      {/* Saba Marine Park */}
      <section id={divingAnchors.marinePark} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Anchor className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Het Saba Marine Park</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Alles waar we duiken ligt binnen het Saba National Marine Park, opgericht in 1987 en
          beheerd door de Saba Conservation Foundation. Het park omringt het hele eiland, van de
          hoogwaterlijn tot 60 m (200 ft) diep, en het is een van de weinige zelfvoorzienende
          marineparken ter wereld. Bijdragen van bezoekers, verkopen van souvenirs en donaties
          financieren de moorings, patrouilles en het beschermingswerk dat de riffen gezond houdt.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Parkregels die voor elke duiker gelden</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Geen handschoenen — zo verdwijnt de verleiding om het rif aan te raken</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Kijken, niet aanraken; koralen, sponzen en zeeleven zijn beschermd</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Niet verzamelen, geen speervissen op scuba, geen vissen voeren</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Goed drijfvermogen is belangrijk: oefen voordat je dicht bij het rif duikt</span></li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Hoe Sea Saba in het park duikt</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Boten leggen vast aan permanente moorings — niemand ankert op het rif</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Alleen begeleid duiken; geen soloduiken</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Recreatieve trips blijven binnen de nuldecompressiegrenzen</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Stekken worden elke dag gekozen op de omstandigheden en de groep aan boord</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Duiken brengt een beschermingsbijdrage mee van{" "}
            ${OPERATIONS.conservationFees.marineParkPerDiveUsd + OPERATIONS.conservationFees.chamberContributionPerDiveUsd}{" "}
            per duiker, per duik: ${OPERATIONS.conservationFees.marineParkPerDiveUsd} gaat naar het
            Saba Marine Park en ${OPERATIONS.conservationFees.chamberContributionPerDiveUsd} naar het
            decompressiekamerfonds van het eiland. Snorkelen is{" "}
            ${OPERATIONS.conservationFees.snorkelParkPerPersonUsd} per persoon. Deze bijdragen
            worden vastgesteld door het park en de decompressiekamer, niet door Sea Saba, en
            financieren direct de moorings, patrouilles en nooddekking die hierboven staan beschreven.
          </p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Voor alle parkregels en het verhaal achter het park, bezoek de{" "}
          <Link href="https://sabapark.org/saba-national-marine-park/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            Saba Conservation Foundation
          </Link>.
        </p>
      </section>

      {/* Dive More Save More */}
      <section className="mt-14">
        <FeatureImage
          src="/images/optimized/green-turtle-seagrass-divers.webp"
          alt="Duikers observeren een groene zeeschildpad die rust in het zeegras van het Saba Marine Park."
          imageRight
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Meer duiken. Meer besparen.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Blijf langer. Beleef meer.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              De meeste gasten duiken meerdere dagen langs Saba&apos;s wereldberoemde pinnacles,
              wanden en riffen. Meerdaagse prijzen belonen een aaneengesloten duikschema, en gratis{" "}
              {OPERATIONS.nitroxBlend} Nitrox is inbegrepen op duiken die ervoor in aanmerking komen.
            </p>
          </div>
        </FeatureImage>

        {/* Feature grid — full width below the image+text row */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h3 className="text-sm font-medium text-foreground">Betere dagprijzen</h3>
              <p className="text-xs text-muted-foreground">Meerdaagse pakketten verlagen je dagprijs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h3 className="text-sm font-medium text-foreground">Gratis {OPERATIONS.nitroxBlend} Nitrox</h3>
              <p className="text-xs text-muted-foreground">Inbegrepen op kwalificerende duiken voor gebrevetteerde duikers.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h3 className="text-sm font-medium text-foreground">Flexibele planning</h3>
              <p className="text-xs text-muted-foreground">Eén rustdag mag zonder dat de pakketprijs opnieuw begint.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h3 className="text-sm font-medium text-foreground">Stel je eigen pakket samen</h3>
              <p className="text-xs text-muted-foreground">Voeg middag- en nachtduiken toe om je verblijf aan te passen.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h3 className="text-sm font-medium text-foreground">Huuruitrusting beschikbaar</h3>
              <p className="text-xs text-muted-foreground">Complete huurpakketten zijn beschikbaar als je ze nodig hebt.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h3 className="text-sm font-medium text-foreground">Volledige service</h3>
              <p className="text-xs text-muted-foreground">Uitrusting gespoeld en terugbezorgd bij je accommodatie.</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-center">
          <TrackedInternalButton
            variant="outline"
            size="sm"
            href={localeHref("nl", "/book")}
            eventName="book_now_click"
            buttonText="View Packages & Pricing"
            buttonLocation="diving_packages"
          >
            Bekijk pakketten &amp; prijzen
          </TrackedInternalButton>
        </div>
      </section>

      {/* Flying Back to St. Maarten After Diving */}
      <section id={divingAnchors.altitudeFlying} className="mt-14 scroll-mt-24">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Terugvliegen naar St. Maarten na het duiken</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Een van de meest gestelde vragen is of het veilig is om op Saba te duiken en dezelfde dag
          terug te vliegen naar St. Maarten.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Anders dan een typische lijnvlucht is de Winair Twin Otter-route tussen Saba en St.
          Maarten een korte vlucht tussen de eilanden. Het toestel bereikt ongeveer 2.000 voet
          (610 m), maar slechts enkele minuten, voordat het daalt voor de landing.
        </p>

        <div className="mt-5 rounded-lg border border-border/40 bg-muted/20 p-5">
          <h3 className="text-sm font-semibold text-foreground">Een ander soort vlucht</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Al tientallen jaren vliegen duikers routinematig tussen Saba en St. Maarten als
            onderdeel van hun duikvakantie. Sea Saba vaart deze schema&apos;s sinds{" "}
            {OPERATIONS.establishedYear}, en veel gasten vliegen na het duiken terug naar St.
            Maarten binnen ons normale vaarschema.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Deze korte vlucht op lage hoogte is fundamenteel anders dan een typische vlucht in een
            straalvliegtuig, dat veel langer op een veel hogere kabinehoogte onder druk wordt
            gehouden.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Zoals bij elke duikplanning is elke duiker uiteindelijk zelf verantwoordelijk voor
            beslissingen op basis van zijn of haar gezondheid, duikprofiel en — bij medische
            twijfels — het advies van een arts of DAN.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Waar je op moet letten</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>De Winair-vlucht is een korte vlucht tussen de eilanden op lage hoogte.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Plan een conservatief duikprofiel.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Blijf goed gehydrateerd.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Volg je duikcomputer.</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Raadpleeg bij medische twijfels DAN of je arts voordat je gaat duiken.</span></li>
            </ul>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2">
              <Mountain className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Beklim Mt. Scenery niet na het duiken</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Hoewel de vlucht naar St. Maarten voor veel duikers een normaal onderdeel van de reis
              is, wordt wandelen naar de top van Mt. Scenery na het duiken afgeraden.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              De trail vergt flinke inspanning tijdens de klim naar Saba&apos;s hoogste punt op
              ongeveer 2.910 voet (887 m). Zware lichamelijke inspanning combineren met toenemende
              hoogte na het duiken kan het decompressierisico vergroten.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Wil je Mt. Scenery beklimmen tijdens je bezoek, plan dat dan op een dag waarop je niet
              duikt.
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          DAN (Divers Alert Network) heeft onderzoek gepubliceerd over vluchten tussen Caribische
          eilanden, en Sea Saba kan gasten die het onderzoek willen lezen aanvullende informatie
          geven.
        </p>
        <p className="mt-3 text-xs text-muted-foreground italic">
          Deze informatie is alleen bedoeld voor het plannen van je reis en is geen medisch advies.
          Volg je duikcomputer, je arts en de aanbevelingen van DAN.
        </p>
      </section>

      {/* Technical Diving */}
      <section id={divingAnchors.technicalDiving} className="mt-14 scroll-mt-24">
        <div className="flex items-center gap-3">
          <Gauge className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Technisch duiken</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba&apos;s dramatische onderwaterlandschap biedt bijzondere mogelijkheden voor ervaren
          technische duikers. Diepe vulkanische pinnacles, steile wanden en ongerepte riffen reiken
          ver voorbij de recreatieve dieptes — het eiland is daarmee een van de meest unieke
          bestemmingen voor technisch duiken in het Caraïbisch gebied.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Technisch duiken is beschikbaar voor duikers met het juiste brevet en moet vooraf worden
          geregeld.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Diepe vulkanische pinnacles</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Saba&apos;s diepe pinnacles en wanden lenen zich uitstekend voor ervaren
              decompressieduikers. Stekken zoals Third Encounter, Outer Limits en Tent Wall bieden
              dramatische verticale profielen, uitstekend zicht en het soort vulkanische topografie
              waarvoor technische duikers uit het hele Caraïbisch gebied komen.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Diepe pinnacles die oprijzen uit de diepte</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Dramatische wandduiken</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Uitstekend zicht</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Unieke vulkanische topografie</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Ideaal voor ervaren decompressieduikers</span></li>
            </ul>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Ondersteuning voor technische uitrusting</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sea Saba levert flessen- en gassupport voor technisch duiken, waaronder backmount-dubbelsets,
              sidemount-flessen, stage- en decompressieflessen en vullingen met zuivere zuurstof.
              Rebreatherduikers vinden ook kleine zuurstofflessen en een booster die zuurstof tot
              3.000 psi kan vullen.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Vier backmount-dubbelsets</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Aluminium sidemount-flessen</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Aluminium 40 cu ft stage-/decompressieflessen</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Zuurstofvullingen tot 100% voor decompressieflessen</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Vier kleine zuurstofflessen geschikt voor rebreathers</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Zuurstofbooster die zuurstof tot 3.000 psi kan comprimeren</span></li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Duikers nemen hun eigen trimvest, harnas, ademautomaten, computers en overige
              persoonlijke technische duikuitrusting mee.
            </p>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Duikplanning</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Technische duiken op Saba worden uitgevoerd in kleine groepen met persoonlijke
              planning. Ervaren lokale kennis helpt elke duik af te stemmen op de omstandigheden,
              het ervaringsniveau en de profielen die je wilt verkennen.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Kleine groepen</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Persoonlijke duikplanning</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Flexibele planning waar praktisch</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Ervaren lokale kennis</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Vooraf afstemming voor gas- en materiaalvereisten</span></li>
            </ul>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Vooraf plannen vereist</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Technische duiken moeten voor aankomst worden afgestemd, zodat het team de juiste
              flessen en supportmateriaal kan klaarmaken. Neem vooraf contact op met Sea Saba om
              brevetten, ervaringsniveau, geplande duikprofielen, materiaalvereisten,
              flesconfiguratie en zuurstofbehoefte te bespreken.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sea Saba gebruikt{" "}
              <Link href="https://www.hhssoftware.com/multideco/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
                Multideco
              </Link>{" "}
              voor het plannen van technische duiken.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border/40 bg-muted/20 p-5">
          <h3 className="text-sm font-semibold text-foreground">Vereisten voor technisch duiken</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Technisch duiken is alleen beschikbaar voor duikers met de juiste brevetten. Sea Saba
            verzorgt geen technische opleidingen en verhuurt geen technische trimvesten en
            harnassystemen.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Duikers wordt verwacht hun eigen levensondersteunende uitrusting mee te nemen,
            waaronder:
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Technisch trimvest of wingsysteem</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Ademautomaten</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Duikcomputers</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Bescherming tegen afkoeling (wetsuit/droogpak)</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Persoonlijke accessoires</span></li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Sea Saba levert flessen en zuurstofsupport zoals hierboven beschreven.
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-5">
          <h3 className="text-sm font-semibold text-foreground">Plan je een technische duikexpeditie?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Of je nu diepe vulkanische pinnacle-duiken, decompressieduiken of CCR-verkenning in het
            Caraïbisch gebied plant — we bespreken graag de logistiek en helpen bepalen of Saba de
            juiste bestemming is voor je volgende avontuur.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={localeHref("nl", "/contact?interest=tdi-technical")}>Vraag naar technisch duiken</Link>
          </Button>
        </div>
      </section>

      {/* Emergency Preparedness */}
      <section className="mt-14 scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground">Noodvoorbereiding</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Saba is goed uitgerust om veilig recreatief duiken te ondersteunen. Mocht er ooit
              geavanceerde behandeling nodig zijn, dan heeft het eiland een door DAN gecertificeerde
              decompressiekamer bij de faciliteit van de Saba Conservation Foundation in Fort Bay.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              De kapiteins en duikprofessionals van Sea Saba zijn getraind in noodprocedures, elke
              duikboot heeft zuurstof en EHBO-materiaal aan boord, en ons team hanteert vaste
              noodplannen in afstemming met de lokale medische diensten.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Hoewel ernstige duikincidenten uiterst zeldzaam zijn, geeft het weten dat deze middelen
              beschikbaar zijn zowel nieuwe als ervaren duikers extra gemoedsrust.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Veiligheidsvoorzieningen</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Door DAN gecertificeerde decompressiekamer</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Gelegen in Fort Bay</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Zuurstof op elke duikboot</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>EHBO-materiaal aan boord</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Ervaren professioneel duikpersoneel</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Noodplannen voor alle duikactiviteiten</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Diving FAQs */}
      <section id={divingAnchors.faq} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Veelgestelde vragen</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {DIVING_FAQS.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dive Insurance */}
      <div className="not-prose mt-10 flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Duikverzekering aanbevolen</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Sea Saba heeft zuurstof en EHBO-materiaal aan boord, maar we raden alle duikers sterk
            aan een eigen duikverzekering te hebben. Kortlopende dekking via DAN dekt een enkele
            reis en is beschikbaar tot vlak voor vertrek. Een uitgebreide reisverzekering die ook
            medische evacuatie dekt, raden we eveneens sterk aan.
          </p>
          <div className="mt-4">
            <InsuranceCTAs locale="nl" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Klaar om op Saba te duiken?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Kies de trip die past, vertel ons je brevet, en wij regelen de rest: taxi, flessen en de
          route naar de juiste stekken.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <TrackedInternalButton
            size="lg"
            className="text-base font-semibold"
            href={localeHref("nl", "/book")}
            eventName="book_now_click"
            buttonText="Book Diving"
            buttonLocation="diving_footer_cta"
          >
            Boek je duiken
          </TrackedInternalButton>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/dive-sites">Bekijk de duikstekken</Link>
          </Button>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Weet je niet zeker welke trip past?{" "}
          <Link href={localeHref("nl", "/contact?interest=book-diving")} className="font-medium text-primary hover:underline underline-offset-4">
            Vraag het ons voordat je boekt
          </Link>
          . Kom je met je eigen boot? Zie onze{" "}
          <Link href="/visiting-yachts" className="font-medium text-primary hover:underline underline-offset-4">
            gids voor jachtbezoekers
          </Link>{" "}
          (Engels).
        </p>
      </section>
    </>
  );
}
