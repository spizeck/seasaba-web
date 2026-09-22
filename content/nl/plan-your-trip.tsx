import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { Button } from "@/components/ui/button";
import { Plane, PlaneTakeoff, Ship, Helicopter, Anchor, Check, Droplets, Eye, Sun, Thermometer, Home, HelpCircle, Fish, Calendar, AlertTriangle, Bus, Ban, DollarSign, MessageCircle, Plug, Wifi, Timer, Utensils, Compass, Clock, CloudSun, Users } from "lucide-react";
import { HotelPills } from "@/components/hotel-pills";
import { InsuranceCTAs } from "@/components/insurance-ctas";
import { TrackedOutboundButton } from "@/components/tracked-outbound-button";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import { PageSectionNav } from "@/components/navigation/PageSectionNav";
import { JsonLd } from "@/components/structured-data";
import { planYourTripAnchors, termsAnchors } from "@/lib/anchors";
import { CONTACT } from "@/lib/constants";
import { OPERATIONS, bookingHref } from "@/data/operations";
import { localeHref, type TranslationReview } from "@/lib/locale";

/**
 * Dutch draft of `app/(en)/(content)/plan-your-trip/page.tsx` (#151). Section
 * anchors match `planYourTripAnchors`. Third-party outbound content stays
 * English: hotel descriptions inside HotelPills and the English-only pages
 * linked from here (/visiting-yachts, /partners, /terms) — marked "(Engels)"
 * where linked. See REVIEW.md.
 */
export const review: TranslationReview = {
  status: "draft",
  reviewedBy: null,
  reviewedAt: null,
  source: "app/(en)/(content)/plan-your-trip/page.tsx",
  sourceHash: "c1e1620b75e474d78a7e2da8444007a66ab9320e",
};

export const nlMetadata = {
  title: "Plan je reis naar Saba",
  description:
    "Hoe kom je op Saba, waar overnacht je, wanneer ga je en wat kun je verwachten. Alles om je duikreis naar het best bewaarde geheim van het Caraïbisch gebied te plannen.",
};

const GOOD_TO_KNOW = [
  {
    icon: Bus,
    title: "Gratis taxishuttle",
    description: "Gratis ophalen en terugbrengen tussen je accommodatie en het duikcentrum is inbegrepen voor duikers.",
  },
  {
    icon: Ban,
    title: "Geen cruiseschepen",
    description: "Rustige eilandsfeer, weinig drukte op het water en geen massatoerisme.",
  },
  {
    icon: DollarSign,
    title: "Amerikaanse dollars",
    description: "De Amerikaanse dollar is de officiële munt en de bekende creditcards worden vrijwel overal geaccepteerd.",
  },
  {
    icon: MessageCircle,
    title: "Overal Engels",
    description: "Engels is de voertaal, dus communicatie is makkelijk voor internationale bezoekers.",
  },
  {
    icon: Plug,
    title: "120V Amerikaanse stopcontacten",
    description: "Overal op het eiland wordt Amerikaanse spanning met Amerikaanse stopcontacten gebruikt.",
  },
  {
    icon: Droplets,
    title: "Veilig drinkwater",
    description: "Schoon, veilig drinkwater is overal beschikbaar. Saba Splash, de lokale bottelarij, levert gefilterd water over het hele eiland.",
  },
  {
    icon: Wifi,
    title: "Betrouwbaar internet",
    description: "Glasvezel en Starlink zijn breed beschikbaar.",
  },
  {
    icon: Timer,
    title: "Korte boottochten",
    description: "De meeste duikstekken liggen 5–15 minuten van Fort Bay Harbor.",
  },
] as const;

const FAQS = [
  {
    question: "Hoe kom ik op Saba?",
    answer: "De meeste bezoekers reizen via St. Maarten en gaan met een Winair-vlucht of de Makana Ferry door naar Saba. Sea Saba ligt aan Fort Bay Harbor, waar de meeste duiktrips vertrekken.",
  },
  {
    question: "Hoeveel dagen moet ik blijven?",
    answer: "De meeste duikers zijn het gelukkigst met 5–7 dagen op Saba. Zo heb je tijd voor meerdere duikdagen, een buffer voor het weer en de kans om te wandelen, uit eten te gaan en het eiland te verkennen.",
  },
  {
    question: "Is Nitrox inbegrepen?",
    answer: `Gratis ${OPERATIONS.nitroxBlend} Nitrox is inbegrepen voor duikers met een Nitrox-brevet. Neem een bewijs van je Nitrox-brevet mee.`,
  },
  {
    question: "Heb ik een huurauto nodig?",
    answer: "Meestal niet. Sea Saba verzorgt het vervoer voor geplande duiktrips, en taxi's zijn beschikbaar voor restaurants, hikes en het verkennen van het eiland. Sommige gasten kiezen toch voor een huurauto voor extra vrijheid.",
  },
  {
    question: "Is Saba druk?",
    answer: "Nee. Saba heeft geen cruiseschepen, geen megaresorts en nauwelijks massatoerisme. Het eiland is rustig en natuurlijk en past het best bij reizigers die iets anders zoeken.",
  },
  {
    question: "Is Saba leuk voor niet-duikers?",
    answer: "Ja. Wandelen, restaurants, vogels kijken, kunstworkshops, glaskunst, mooie uitzichten en een relaxte eilandsfeer maken Saba ook voor niet-duikers de moeite waard.",
  },
] as const;

export function NlPlanYourTrip() {
  return (
    <>
      <PageHero
        src="/images/optimized/juancho-airport-approach-saba.webp"
        alt="Luchtfoto van Saba met de dramatische aanvliegroute naar Juancho Airport"
        title="Plan je reis naar Saba"
        subtitle="Alles wat je moet weten voor je vertrekt"
      />

      {/* Introduction */}
      <p className="text-base leading-relaxed text-muted-foreground">
        Saba is een vijf vierkante mijl groot vulkanisch eiland in Caribisch Nederland. Zonder
        cruiseschepen en zonder grote resorts biedt Saba een rustige, authentieke Caribische
        ervaring die duikers consequent tot een van hun favoriete bestemmingen rekenen.
      </p>

      {/* On This Page */}
      <PageSectionNav
        className="mt-8"
        offset={0}
        items={[
          { id: planYourTripAnchors.gettingHere, label: "Naar Saba reizen" },
          { id: planYourTripAnchors.whenToVisit, label: "Beste reistijd" },
          { id: planYourTripAnchors.whereToStay, label: "Overnachten" },
          { id: planYourTripAnchors.goodToKnow, label: "Handig om te weten" },
          { id: planYourTripAnchors.whatToBring, label: "Wat neem je mee" },
          { id: planYourTripAnchors.restaurants, label: "Restaurants" },
          { id: planYourTripAnchors.experiences, label: "Te doen" },
          { id: planYourTripAnchors.history, label: "Het eiland Saba" },
          { id: planYourTripAnchors.faq, label: "FAQ" },
        ]}
      />

      {/* Getting to Saba */}
      <section id={planYourTripAnchors.gettingHere} className="mt-12 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Naar Saba reizen</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Winair */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Winair</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                De meeste bezoekers komen aan via St. Maarten (SXM) en stappen over op
                Winair&apos;s iconische Twin Otter. De korte vlucht biedt een van de
                spectaculairste luchtaanvliegroutes ter wereld.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">⭐</span>
                Meest gekozen optie
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Vlucht van circa 12 minuten
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  19-persoons DHC-6 Twin Otter
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Meerdere vertrekken per dag
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Landt op de kortste commerciële landingsbaan ter wereld
                </li>
              </ul>
            </div>
            <TrackedOutboundButton
              variant="outline"
              className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
              href="https://www.winair.sx/"
              eventName="social_click"
              buttonText="Check Flight Schedule"
              aria-label="Bekijk het vluchtschema van Winair, opent in een nieuw tabblad"
            >
              Bekijk vluchtschema ↗
            </TrackedOutboundButton>
          </div>

          {/* Makana Ferry */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Ship className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Makana Ferry</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                De Makana Ferry biedt een comfortabele en mooie verbinding tussen St. Maarten en
                Saba, met prachtig Caribisch uitzicht onderweg.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">🌊</span>
                Mooiste overtocht
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Overtocht van circa 90 minuten
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Passagierscabine met airconditioning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Open zonnedek
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Versnaperingen aan boord
                </li>
              </ul>
            </div>
            <TrackedOutboundButton
              variant="outline"
              className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
              href="https://makanaferryservice.com/"
              eventName="ferry_link_click"
              buttonText="View Ferry Schedule"
              aria-label="Bekijk de dienstregeling van de Makana Ferry, opent in een nieuw tabblad"
            >
              Bekijk veerdienst ↗
            </TrackedOutboundButton>
          </div>

          {/* West Indies Helicopters */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Helicopter className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">West Indies Helicopters</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                West Indies Helicopters biedt luxe helikoptertransfers vanaf St. Maarten en St.
                Barths — de snelste en meest flexibele manier om Saba te bereiken.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">⚡</span>
                Snelst &amp; meest flexibel
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Airbus H125 / AS350-helikopters
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Tot 5 passagiers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Vlucht van circa 20–25 minuten
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Ideaal voor privétransfers
                </li>
              </ul>
            </div>
            <TrackedOutboundButton
              variant="outline"
              className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
              href="https://westindieshelicopters.com/"
              eventName="social_click"
              buttonText="Request Helicopter Charter"
              aria-label="Vraag een helikoptercharter aan, opent in een nieuw tabblad"
            >
              Vraag helikoptercharter aan ↗
            </TrackedOutboundButton>
          </div>

          {/* SXM Airways */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <PlaneTakeoff className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">SXM Airways</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                SXM Airways vliegt gepland tussen St. Maarten en Saba met de iconische
                Britten-Norman Islander — een klassieke Caribische islandhopper-ervaring met
                betrouwbare regionale dienst.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">👥</span>
                Beste voor kleine groepen &amp; charters
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  9-persoons Britten-Norman Islander
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Geplande vluchten tussen St. Maarten en Saba
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Klassieke islandhopper-ervaring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Betrouwbare regionale vervoerder
                </li>
              </ul>
            </div>
            <TrackedOutboundButton
              variant="outline"
              className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
              href="https://fly-sxmairways.com/"
              eventName="social_click"
              buttonText="Book SXM Airways"
              aria-label="Boek SXM Airways, opent in een nieuw tabblad"
            >
              Boek SXM Airways ↗
            </TrackedOutboundButton>
          </div>

          {/* Visiting Yachts */}
          <div className="rounded-lg border border-border/60 bg-card p-6 sm:col-span-2">
            <div className="sm:flex sm:items-center sm:justify-between sm:gap-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Anchor className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Kom je per jacht?</h3>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <span aria-hidden="true">⛵</span>
                  Aankomst met eigen vaartuig
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Zeiljachten en cruisende schepen klaren in bij Fort Bay, op loopafstand van ons
                  duikcentrum. De speciale gids behandelt aankomst en inklaring, moorings van het
                  Marine Park, aan wal gaan en hoe je met Sea Saba duikt terwijl je vaartuig op
                  Saba ligt. (De gids is in het Engels.)
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-6 w-full shrink-0 border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white sm:mt-0 sm:w-auto"
              >
                <Link href="/visiting-yachts">Lees de gids voor jachten &rarr;</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Travel disruptions */}
        <div className="mt-6 rounded-lg border border-border/40 bg-muted/20 p-5">
          <div className="flex items-center gap-2">
            <CloudSun className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Als je reisplannen veranderen</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Vluchten en veerboten tussen St. Maarten en Saba varen betrouwbaar, maar weer en
            aansluitingen kunnen af en toe schema&apos;s verschuiven — dat hoort bij het bereiken
            van een klein eiland. Is je vlucht vertraagd, vaart de veerboot niet, of kom je later
            aan dan verwacht,{" "}
            <Link href={localeHref("nl", "/contact?interest=general")} className="font-medium text-primary hover:underline underline-offset-4">
              neem dan contact op
            </Link>{" "}
            of stuur ons een bericht via{" "}
            <TrackedContactLink
              href={CONTACT.whatsappHref}
              eventName="whatsapp_click"
              buttonText="WhatsApp — plan your trip travel disruption"
              external
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              WhatsApp
            </TrackedContactLink>{" "}
            zodra je het weet.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Als de omstandigheden op zee ons dwingen een trip te wijzigen, zoeken we samen een
            nieuwe datum of betalen we het betreffende deel terug. Een reisverzekering die
            vertragingen dekt wordt sterk aangeraden (zie Beste reistijd), en onze annulerings- en
            omboekvoorwaarden staan op de{" "}
            <Link href={`/terms#${termsAnchors.scheduleChanges}`} className="font-medium text-primary hover:underline underline-offset-4">
              Terms-pagina (Engels)
            </Link>
            .
          </p>
        </div>
      </section>

      {/* When to Visit */}
      <section id={planYourTripAnchors.whenToVisit} className="mt-12 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Beste reistijd</h2>

        {/* Season cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {/* Dec–Apr */}
          <div className="not-prose rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">December &ndash; april</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Helder water &amp; bultruggen</h3>
            </div>
            <ul className="w-full space-y-2">
              {[
                "Helderste water en uitstekend zicht.",
                "Bultruggen worden regelmatig gezien van januari tot en met april.",
                "De Christmas winds brengen winderig weer en af en toe ruwere zee.",
                "Saba Day is de eerste vrijdag van december.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* May–Jul */}
          <div className="not-prose rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mei &ndash; juni</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Warm water &amp; minder druk</h3>
            </div>
            <ul className="w-full space-y-2">
              {[
                "Warm water en betrouwbaar duiken.",
                "Kleinere groepen en een relaxte sfeer.",
                "Uitstekende tijd voor onderwaterfotografie.",
                "Ideaal voor langere duikvakanties.",
                "Over het algemeen minder wind en comfortabele omstandigheden op zee.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Aug–Nov */}
          <div className="not-prose rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Juli &ndash; november</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Rustige zee &amp; eilandfestivals</h3>
            </div>
            <ul className="w-full space-y-2">
              {[
                "Late zomer en herfst brengen vaak rustige zee en uitstekende duikomstandigheden, zolang er geen tropische systemen in de buurt zijn.",
                "Juli: Carnival.",
                "Oktober: Sea & Learn.",
                "November: Rum & Lobster Fest.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Thermometer className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Watertemperatuur</p>
            <p className="mt-1 text-xs text-muted-foreground">25&ndash;30&deg;C (77&ndash;86&deg;F)</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Het hele jaar warm, koelst in februari.</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Eye className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Zicht</p>
            <p className="mt-1 text-xs text-muted-foreground">80&ndash;100+ ft (25&ndash;30+ m)</p>
            <p className="mt-0.5 text-xs text-muted-foreground">In de winter vaak meer dan 30 meter.</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Fish className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Bultrugseizoen</p>
            <p className="mt-1 text-xs text-muted-foreground">Januari &ndash; april</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Calendar className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Festivals</p>
            <p className="mt-1 text-xs text-muted-foreground">Juli, oktober, november &amp; december</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Carnival, Sea &amp; Learn, Rum &amp; Lobster Fest en Saba Day.</p>
          </div>
        </div>

        {/* Travel insurance callout */}
        <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Reisverzekering aanbevolen</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Omdat Saba een klein eiland is dat wordt bediend door vluchten en veerboten, kan
                het weer af en toe reisplannen beïnvloeden. We raden alle bezoekers een
                reisverzekering sterk aan, ongeacht het seizoen. Dekking voor vertraagde reizen,
                weeronderbrekingen en medische noodgevallen geeft gemoedsrust. Een
                duikverzekering en dekking voor medische evacuatie raden we eveneens sterk aan.
              </p>
              <div className="mt-4">
                <InsuranceCTAs locale="nl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to Stay */}
      <section id={planYourTripAnchors.whereToStay} className="mt-12 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Overnachten</h2>

        <FeatureImage
          src="/images/optimized/windwardside-village-saba.webp"
          alt="Windwardside op Saba met traditionele cottages en weelderig groen"
          imageRight
          centerText
        >
          <div>
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Accommodatie</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Saba biedt boetiekhotels, charmante cottages en privévilla&apos;s in plaats van grote
              resorts. Of je nu een hotel met volledige service zoekt of een rustige
              eilandretraite — elke accommodatie ligt op korte afstand van Fort Bay Harbor.
            </p>
            {/* Hotel names/descriptions stay English — partner copy, flagged in REVIEW.md */}
            <HotelPills />
          </div>
        </FeatureImage>

        <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
          Selecteer hierboven een hotel voor foto&apos;s, voorzieningen en een korte beschrijving
          (Engels). Persoonlijk advies nodig?{" "}
          <Link href={localeHref("nl", "/contact?interest=general")} className="font-medium text-primary hover:underline underline-offset-4">
            Vraag het ons
          </Link>{" "}
          — ons team denkt graag mee over de beste plek om te verblijven, op basis van je budget,
          reisstijl en duikplannen.
        </div>
      </section>

      {/* Good to Know */}
      <section id={planYourTripAnchors.goodToKnow} className="mt-12 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Handig om te weten</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOOD_TO_KNOW.map((item) => (
            <div key={item.title} className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What to Bring */}
      <section id={planYourTripAnchors.whatToBring} className="mt-12 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Wat neem je mee</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h3 className="font-semibold text-foreground">Verplicht</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Brevetkaart of digitaal brevet
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Duikcomputer — verplicht bij elke duik; te huur
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Logboek of digitale duikgeschiedenis
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Zwemkleding
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Handdoek
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Herbruikbare waterfles
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h3 className="font-semibold text-foreground">Optioneel</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Eigen duikuitrusting
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Onderwatercamera
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Rifvriendelijke zonnebrand
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Hoed of licht jack voor op de boot
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Drybag
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Reisziekte-medicijn indien nodig
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Huuruitrusting is beschikbaar, inclusief trimvest, ademautomaat, wetsuit, masker, vinnen en duikcomputer.</p>
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <section id={planYourTripAnchors.restaurants} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Utensils className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Restaurants &amp; cafés</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba heeft een kleine maar verrassend goede eetscene. De meeste restaurants zijn intiem,
          eigenaar-run en weerspiegelen het karakter van het eiland. Omdat het eiland klein is en
          de voorraden per boot binnenkomen, veranderen menu&apos;s met de beschikbaarheid en is
          niet elk restaurant elke avond open.
        </p>

        <div className="mt-5 rounded-lg border border-border/40 bg-muted/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <h3 className="text-sm font-semibold text-foreground">Praktische tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Reserveren wordt sterk aangeraden, zeker voor het diner. Veel restaurants zijn klein en zitten snel vol.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Openingsdagen verschillen en kunnen per seizoen wijzigen. Bel vooraf of vraag je accommodatie het te bevestigen.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />De meeste restaurants liggen in Windwardside, op loopafstand van de belangrijkste hotels.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Saba heeft een eigen brouwerij: Deep Dive Brewing Co. Koude biertjes zijn verkrijgbaar bij de meeste restaurants en bij het duikcentrum na je duiken.</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-16 lg:gap-20">
          <FeatureImage
            src="/images/optimized/colibri-cafe-saba.webp"
            alt="Colibri Café op Saba serveert verse maaltijden en drankjes met uitzicht op het eiland"
            imageRight
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Lokaal eten</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                De eetscene van Saba is net zo gastvrij als het eiland zelf. Van verse kreeft met
                uitzicht over de Caribische Zee tot casual cafés en gezellige lokale favorieten —
                ondanks het formaat van het eiland vind je een verrassende variatie aan
                uitstekende restaurants. De meeste zijn onafhankelijk, reserveren is aan te raden
                in drukke periodes en vrijwel alles ligt op korte afstand van je accommodatie of
                de haven.
              </p>
            </div>
          </FeatureImage>
          <FeatureImage
            id={planYourTripAnchors.recommendedPartners}
            src="/images/optimized/island-paradise-cafe-saba.webp"
            alt="Island Paradise Cafe op Saba met Caribisch uitzicht"
            objectPosition="center 30%"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Onze aanbevolen partners</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Zoek je onze favoriete plekken om te eten, te slapen en te verkennen?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We hebben een selectie gemaakt van restaurants, accommodaties, vervoerders en
                lokale ervaringen die we onze gasten met vertrouwen aanbevelen. Blader door onze
                favoriete lokale bedrijven om je perfecte verblijf op Saba te plannen.
                (De partnerspagina is in het Engels.)
              </p>
              <Button asChild className="mt-4">
                <Link href="/partners">Bekijk aanbevolen partners &rarr;</Link>
              </Button>
            </div>
          </FeatureImage>
        </div>
      </section>

      {/* Things to Do on Saba */}
      <section id={planYourTripAnchors.experiences} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Te doen op Saba</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba biedt veel meer dan duiken van wereldklasse. Wandel een dag door nevelwouden,
          verken lokale kunstgalerijen, snorkel in kristalhelder water, maak een sunsetcruise of
          ontdek een van de meest bijzondere eilandgemeenschappen van het Caraïbisch gebied.
        </p>

        <div className="mt-5 rounded-lg border border-border/40 bg-muted/20 p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Reis je met een niet-duiker?</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Saba is ook een belonende bestemming als je nooit een fles om zet. Terwijl jij duikt,
            kan je metgezel mee op de{" "}
            <Link href={`#${planYourTripAnchors.snorkeling}`} className="font-medium text-primary hover:underline underline-offset-4">
              middag-snorkeltrip
            </Link>{" "}
            — die deelt de boot met de middagduik, zodat jullie toch samen op het water zijn. Aan
            land vullen het{" "}
            <Link href={`#${planYourTripAnchors.hiking}`} className="font-medium text-primary hover:underline underline-offset-4">
              trailnetwerk
            </Link>
            , dorpscafés, galerijen en ambachtswinkels makkelijk een dag, en een sunsetcruise is
            een avond uit die iedereen deelt. Voor meer ideeën, bekijk onze{" "}
            <Link href="/partners" className="font-medium text-primary hover:underline underline-offset-4">
              aanbevolen partners
            </Link>{" "}
            (Engels).
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-16 lg:gap-20 object-cover brightness-110 contrast-105 saturate-110">
          <FeatureImage
            src="/images/optimized/saba-sunset-cruise.webp"
            alt="Gasten kijken naar de zonsondergang vanaf het dek van een boot van Sea Saba voor de kust van Saba"
            centerText
            imageRight
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sunsetcruise</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Sea Saba biedt zowel gedeelde als privé-sunsetcruises langs Saba&apos;s dramatische
                kustlijn. Ontspan met een drankje in de hand terwijl de zon over het Caraïbisch
                gebied zakt, geniet van het spectaculaire uitzicht vanaf het water en ervaar het
                eiland vanuit een heel ander perspectief.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <TrackedInternalButton
                  href={bookingHref("sunset-cruise")}
                  eventName="book_now_click"
                  buttonText="Book a Sunset Cruise"
                  buttonLocation="plan_your_trip_sunset"
                  bookingItem="sunset-cruise"
                >
                  Boek een sunsetcruise &rarr;
                </TrackedInternalButton>
                <TrackedInternalButton
                  variant="outline"
                  href={bookingHref("private-sunset-cruise")}
                  eventName="book_now_click"
                  buttonText="Book a Private Sunset Cruise"
                  buttonLocation="plan_your_trip_sunset_private"
                  bookingItem="private-sunset-cruise"
                >
                  Boek een privé-sunsetcruise &rarr;
                </TrackedInternalButton>
              </div>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-hiking-signs.webp"
            alt="Trailborden markeren wandelroutes door Saba's regenwoud en nevelwoud"
            centerText
          >
            <div>
              <h3 id={planYourTripAnchors.hiking} className="scroll-mt-40 text-lg font-semibold text-foreground">Wandelen op Saba</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba&apos;s bekroonde trailnetwerk slingert door droge kustheuvels, weelderig
                regenwoud en mistige nevelwouden bij de top van Mount Scenery. Gratis trailkaarten
                zijn beschikbaar.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Hoogtepunten zijn de klim naar Mt. Scenery, de ruige Sandy Cruz Trail en
                kustwandelingen met uitzicht op Statia, St. Kitts en Nevis. De trails lopen van
                makkelijke kustwandelingen tot zware regenwoudhikes.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="https://www.sabatourism.com/hiking" target="_blank" rel="noopener noreferrer">
                  Verken de wandelroutes van Saba &rarr;
                </Link>
              </Button>
            </div>
          </FeatureImage>

          <FeatureImage
            id={planYourTripAnchors.snorkeling}
            src="/images/optimized/saba-snorkeling.webp"
            alt="Zeeschildpad zwemt aan de oppervlakte tijdens het snorkelen op Saba"
            imageRight
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Snorkelen</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba&apos;s ondiepe riffen zijn uitstekend om te snorkelen. De
                middag-snorkeltrip vaart mee met de duikboten, dus snorkelaars blijven aan de
                oppervlakte terwijl duikers dieper gaan. Geen brevet nodig.
              </p>
              <TrackedInternalButton
                className="mt-4"
                href={bookingHref("snorkel")}
                eventName="book_now_click"
                buttonText="Book a Snorkel Trip"
                buttonLocation="plan_your_trip_snorkel"
                bookingItem="snorkel"
              >
                Boek een snorkeltrip &rarr;
              </TrackedInternalButton>
            </div>
          </FeatureImage>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Kunst &amp; ambacht</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Saba heeft een levendige gemeenschap van lokale ambachtslieden die handgemaakte
              producten, sieraden, glaskunst, aardewerk en de beroemde Saba Lace maken. Veel
              stukken zijn geïnspireerd op het zeeleven, het vulkanische landschap en de
              Caribische cultuur van het eiland.
            </p>
          </div>

          <FeatureImage
            src="/images/optimized/saba-lace.webp"
            alt="Traditionele Saba Lace, een delicaat handgemaakte eilandtraditie"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Saba Lace</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba Lace is een van de meest herkenbare tradities van het eiland. Dit fijne
                naaldwerk wordt al generaties met de hand gemaakt en is nog steeds te koop in
                lokale winkels. Elk stuk draagt het geduld en het vakmanschap van de maker.
              </p>
              <TrackedInternalButton
                variant="outline"
                className="mt-4"
                href={localeHref("nl", "/contact?interest=saba-lace")}
                eventName="contact_click"
                buttonText="Ask Us About Saba Lace"
                buttonLocation="plan_your_trip_crafts"
              >
                Vraag ons naar Saba Lace &rarr;
              </TrackedInternalButton>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-beads-jewelry.webp"
            alt="Lokaal gemaakte sieraden geïnspireerd op Saba"
            imageRight
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sieraden maken</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Lokale juweliers werken met vulkanische steen, zeeglas en zilver om stukken te
                maken die geïnspireerd zijn op de kleuren en texturen van Saba. Veel ontwerpen
                zijn volledig met de hand gemaakt en alleen hier te vinden.
              </p>
              <TrackedInternalButton
                variant="outline"
                className="mt-4"
                href={localeHref("nl", "/contact?interest=jewelry-making")}
                eventName="contact_click"
                buttonText="Ask Us About Local Jewelry"
                buttonLocation="plan_your_trip_crafts"
              >
                Vraag ons naar lokale sieraden &rarr;
              </TrackedInternalButton>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-glass-art.webp"
            alt="Glaskunstenaar vormt gesmolten glas tot handgemaakte kunst"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Glaskunst</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Ervaren ambachtslieden veranderen gesmolten glas voor je ogen in unieke
                handgemaakte stukken. Bezoekers kunnen het proces volgen en unieke ornamenten,
                sieraden en kunst meenemen, geïnspireerd op het eiland.
              </p>
              <TrackedInternalButton
                variant="outline"
                className="mt-4"
                href={localeHref("nl", "/contact?interest=glass-art")}
                eventName="contact_click"
                buttonText="Ask Us About Glass Art"
                buttonLocation="plan_your_trip_crafts"
              >
                Vraag ons naar glaskunst &rarr;
              </TrackedInternalButton>
            </div>
          </FeatureImage>
        </div>
      </section>

      {/* Island History */}
      <section id={planYourTripAnchors.history} className="mt-12 scroll-mt-40">
        <h2 className="text-xl font-semibold text-foreground">Het eiland Saba</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba is een vulkanisch eiland van vijf vierkante mijl en bijzondere gemeente van
          Nederland, dat dramatisch oprijst uit de Caribische Zee tot de 887 meter (2.910 voet)
          hoge top van Mount Scenery. Met circa 2.000 inwoners en vrijwel geen vlakke grond heeft
          het dramatische landschap de geschiedenis, cultuur en levenswijze van het eiland gevormd.
        </p>
        <div className="mt-8 flex flex-col gap-16 lg:gap-20">
          <FeatureImage
            src="/images/optimized/saba-ladder-bay.webp"
            alt="De historische stenen ladder uitgehouwen in de kliffen van Saba bij Ladder Bay"
            imageRight
            centerText
          >
            <div className="max-w-prose">
              <h3 className="text-lg font-semibold text-foreground">The Ladder</h3>
              <div className="space-y-4">
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Lang voordat Saba wegen of een haven had, bereikten mensen en goederen het eiland
                  via The Ladder: bijna 800 in de rotsen uitgehouwen stenen treden. Van voedsel tot
                  bouwmaterialen — alles werd met de hand van de kust naar de dorpen bovenop
                  gedragen.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The Ladder is nog steeds een van Saba&apos;s belangrijkste historische
                  monumenten. Het gerestaureerde pad is een belonende hike die geschiedenis
                  combineert met spectaculaire kustuitzichten.
                </p>
              </div>
            </div>
          </FeatureImage>
          <FeatureImage
            src="/images/optimized/saba-the-road.webp"
            alt="De slingerende weg door de weelderige groene heuvels en traditionele cottages van Saba"
            centerText
          >
            <div className="max-w-prose">
              <h3 className="text-lg font-semibold text-foreground">The Road That Couldn&apos;t Be Built</h3>
              <div className="space-y-4">
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Generaties lang beweerden experts dat Saba&apos;s steile vulkanische hellingen
                  een weg onmogelijk maakten — vandaar de bijnaam &quot;The Road That Couldn&apos;t
                  Be Built.&quot; De Saban ingenieur Josephus Lambert Hassell leerde zichzelf
                  wegenbouw en leidde de inspanning om de dorpen van het eiland te verbinden.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  In fases voltooid in het midden van de 20e eeuw, veranderde de weg het leven op
                  Saba door Windwardside, The Bottom, Hell&apos;s Gate, St. Johns en Fort Bay met
                  elkaar te verbinden. Vandaag is het een van de mooiste wegen van het Caraïbisch
                  gebied en een eerbetoon aan Saban volharding.
                </p>
              </div>
            </div>
          </FeatureImage>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">Een unieke Caribische geschiedenis</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Saba is onafgebroken bewoond sinds de jaren 1640, toen Nederlandse kolonisten de
              kenmerkende architectuur van witte huisjes met rode daken vestigden — een stijl die
              je vandaag nog overal in Windwardside en The Bottom ziet. Het eiland wisselde
              meerdere keren van Europese machthebber voordat het definitief onder Nederlands
              bestuur kwam.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Omdat het eiland geen natuurlijke haven heeft, kwamen alle lading en bezoekers
              historisch per kleine boot via Fort Bay binnen — Saba was daardoor eeuwenlang een
              van de meest geïsoleerde gemeenschappen van het Caraïbisch gebied.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">Saba vandaag</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Bijzondere gemeente van Nederland sinds 2010</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Geen cruiseschepen, geen casino&apos;s, geen grote resorts</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Huisvest de Saba University School of Medicine</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Bekend om ambachtelijke producten, waaronder Saba Lace en glaskunst</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />The Bottom is de hoofdstad; Windwardside is het belangrijkste toeristische dorp</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Beschermd door het Saba Marine Park, opgericht in 1987</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id={planYourTripAnchors.faq} className="mt-12 scroll-mt-40">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }}
        />
        <h2 className="text-xl font-semibold text-foreground">Veelgestelde vragen</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Klaar voor Saba?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Wij helpen met accommodatie, vervoer en duiken, zodat jij je kunt concentreren op een
          van de meest ongerepte marineparken van het Caraïbisch gebied.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <TrackedInternalButton
            size="lg"
            className="text-base font-semibold"
            href={localeHref("nl", "/book")}
            eventName="book_now_click"
            buttonText="Book Diving"
            buttonLocation="plan_your_trip_footer_cta"
          >
            Boek je duiken
          </TrackedInternalButton>
          <TrackedInternalButton
            variant="outline"
            size="lg"
            className="text-base font-semibold"
            href={localeHref("nl", "/contact")}
            eventName="contact_click"
            buttonText="Contact Us"
            buttonLocation="plan_your_trip_footer_cta"
          >
            Neem contact op
          </TrackedInternalButton>
        </div>
      </section>
    </>
  );
}
