import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { BookingCTA } from "@/components/booking-cta";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { Award, Users, CheckCircle, Ship, MapPin, Wrench, Car, ShieldCheck, Compass } from "lucide-react";
import { coursesAnchors } from "@/lib/anchors";
import { OPERATIONS } from "@/data/operations";
import { JsonLd, BUSINESS_ID } from "@/components/structured-data";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { localeHref, type TranslationReview } from "@/lib/locale";

/**
 * Dutch draft of `app/(en)/(content)/courses/page.tsx` (#151). Certification,
 * agency, and course names stay English per GLOSSARY.md; safety-relevant
 * requirements (ratios, First Aid/CPR, eLearning) are translated
 * conservatively and flagged in REVIEW.md.
 */
export const review: TranslationReview = {
  status: "draft",
  reviewedBy: null,
  reviewedAt: null,
  source: "app/(en)/(content)/courses/page.tsx",
  sourceHash: "b6c5f7cf318c376c3afa503d473371f51f97be53",
};

export const nlMetadata = {
  title: "Duikcursussen & brevetten",
  description:
    "SDI- en TDI-duikcursussen op Saba. Van Try Scuba tot Divemaster — leer van ervaren instructeurs in het meest bijzondere marinepark van het Caraïbisch gebied.",
};

const WHY_TRAIN_SABA = [
  {
    icon: Award,
    title: "Professionele SDI- & TDI-opleidingen",
    description:
      "Internationaal erkende brevetorganisaties met professionele, ervaren instructeurs.",
  },
  {
    icon: Users,
    title: "Kleine groepen",
    description:
      "Persoonlijke aandacht en een flexibel tempo, zodat je met vertrouwen leert.",
  },
  {
    icon: Compass,
    title: "40+ jaar ervaring",
    description:
      `Sinds ${OPERATIONS.establishedYear} heeft Sea Saba duizenden duikers kennis laten maken met de onderwaterwereld en de riffen van Saba.`,
  },
  {
    icon: MapPin,
    title: "Beschermd marinepark",
    description:
      "Leer duiken in een van de meest ongerepte en best beheerde mariene gebieden van het Caraïbisch gebied.",
  },
  {
    icon: Ship,
    title: "Van haven naar rif",
    description:
      `Begin in het rustige water van ${OPERATIONS.harbor} om je drijfvermogen en loodverdeling te perfectioneren voordat je de openwaterduiken op Saba's spectaculaire rifstekken maakt.`,
  },
  {
    icon: Wrench,
    title: "Premium uitrusting inbegrepen",
    description:
      "Leer met moderne Scubapro-uitrusting en polsduikcomputers. XDeep backplate- en wingsystemen zijn ook beschikbaar voor duikers die een gestroomlijnde setup prefereren.",
  },
  {
    icon: CheckCircle,
    title: `Gratis ${OPERATIONS.nitroxBlend} Nitrox`,
    description:
      `Gratis ${OPERATIONS.nitroxBlend} Nitrox voor gebrevetteerde Nitrox-duikers, waar passend.`,
  },
  {
    icon: Car,
    title: "Gratis taxivervoer",
    description:
      "Gratis vervoer voor geplande trainingsduiken, zodat jij je op het leren kunt concentreren.",
  },
  {
    icon: ShieldCheck,
    title: "Veiligheid voorop",
    description:
      "Kleine groepen, ervaren instructeurs en goed onderhouden uitrusting zorgen voor een veilige en plezierige leerervaring.",
  },
];

interface Course {
  id: string;
  name: string;
  level: string;
  duration: string;
  description: string;
  includes: string[];
  cta: string;
  path: string;
  options?: string[];
  note?: string;
  subcourses?: { name: string; level: string; duration: string }[];
}

const COURSES: Course[] = [
  {
    id: "try-scuba",
    name: "Try Scuba",
    level: "Beginner",
    duration: "Hele dag",
    description:
      "Je eerste ademteug onder water, op een echte duikstek. Geen brevet nodig — alleen nieuwsgierigheid. Een instructeur van Sea Saba begeleidt je bij elke stap: van een korte introductie van de vaardigheden in Fort Bay Harbor tot een begeleide bootduik op het rif.",
    includes: ["Alle uitrusting inbegrepen", "Begeleide bootduik", "Maximaal 2 cursisten per instructeur", "Geen ervaring nodig"],
    cta: "Vraag info over Try Scuba",
    path: "/contact?interest=try-scuba",
  },
  {
    id: "open-water",
    name: "SDI Open Water Diver",
    level: "Beginner",
    duration: "3 dagen",
    description:
      "Doorloop de theorie via SDI eLearning voordat je komt, zodat je vakantie in het water zit en niet in het klaslokaal. De sessies in beschermd water vinden plaats in het rustige water van Fort Bay Harbor, en je vier brevetduiken maak je vanaf de boten van Sea Saba op echte stekken in het Saba Marine Park.",
    includes: ["eLearning vooraf afronden", "Sessies in beschermd water in Fort Bay Harbor", "Vier bootduiken in het Saba Marine Park", "Alle uitrusting inbegrepen", "Maximaal 3 cursisten per instructeur"],
    cta: "Vraag info over Open Water",
    path: "/contact?interest=sdi-open-water",
  },
  {
    id: "advanced-adventure",
    name: "SDI Advanced Adventure Diver",
    level: "Verdergaand",
    duration: "2 dagen",
    description:
      "Bouw vertrouwen op, scherp je vaardigheden aan en verken nieuwe vormen van duiken via adventure- en specialty-training op Saba's gevarieerde rifsystemen. Rond de eLearning vooraf af en besteed je tijd in het water.",
    includes: ["Vijf bootduiken", "eLearning vooraf afronden", "Deep Diver en Navigation verplicht", "Flexibele keuzeopties", "Maximaal 3 cursisten per instructeur", "Uitrusting inbegrepen"],
    cta: "Vraag info over vervolgopleidingen",
    path: "/contact?interest=sdi-advanced-specialty",
    options: ["Navigation*", "Deep Diver*", "Drift Diving", "Boat Diving", "Computer Diving", "Marine Ecosystems Awareness", "Underwater Photography", "Advanced Buoyancy"],
  },
  {
    id: coursesAnchors.nitrox,
    name: "SDI Computer Nitrox Diver",
    level: "Specialty",
    duration: "1 dag",
    description:
      `Enriched air (Nitrox) is de populairste duikspecialty en past perfect bij Saba. Omdat Sea Saba gratis ${OPERATIONS.nitroxBlend} Nitrox inbegrijpt voor gebrevetteerde duikers, is een Nitrox-brevet een eenvoudige manier om meer uit Saba's diepere pinnacles en meerdaagse duikprogramma's te halen. Rond de eLearning af voordat je komt en maak de brevettering tijdens je reis af.`,
    includes: ["eLearning vooraf afronden", "Enriched-air-planning en -analyse", "Te combineren met je duikdagen", `Daarna gratis ${OPERATIONS.nitroxBlend} Nitrox voor gebrevetteerde duikers`],
    cta: "Vraag info over de Nitrox-cursus",
    path: "/contact?interest=sdi-nitrox",
  },
  {
    id: "rescue",
    name: "SDI Rescue Diver",
    level: "Gevorderd",
    duration: "2–3 dagen",
    description:
      "Word een bekwaamere en zelfverzekerdere duiker door te leren problemen onder water te herkennen, te voorkomen en te beheersen. Rescuetraining maakt je een sterkere buddy en een duiker met meer situatiebewustzijn, in elke omgeving. Een geldig EHBO-/reanimatiebrevet is vereist.",
    includes: ["eLearning vooraf afronden", "Rescuescenario's en praktijkoefeningen", "Vaardigheden voor noodmanagement", "Geldig EHBO-/reanimatiebrevet vereist"],
    cta: "Vraag info over Rescue Diver",
    path: "/contact?interest=sdi-rescue",
  },
  {
    id: "divemaster",
    name: "SDI Divemaster",
    level: "Professioneel",
    duration: "4–8 weken",
    description:
      "Doe praktijkervaring op door instructeurs te assisteren, cursisten te begeleiden en mee te draaien in de dagelijkse operatie aan boord van de duikboten van Sea Saba. De Divemaster-opleiding bij Sea Saba is vanaf dag één hands-on, tegen het decor van een van de meest dramatische onderwaterlandschappen van het Caraïbisch gebied.",
    includes: ["Leiderschapsontwikkeling", "Praktijkervaring in de dagelijkse operatie", "Theorie- en watervaardigheidsbeoordelingen", "Ervaring met begeleide duiken"],
    cta: "Vraag info over Divemaster",
    path: "/contact?interest=sdi-divemaster",
    note: "Stageplaatsen zijn mogelijk beschikbaar voor kandidaten die een langere periode op Saba kunnen doorbrengen. Neem contact met ons op om een stage op maat te bespreken.",
  },
  {
    id: "technical",
    name: "TDI Technical Courses",
    level: "Technisch",
    duration: "Verschilt",
    description:
      "Voor ervaren duikers die verder willen dan de recreatieve grenzen richt de TDI-training bij Sea Saba zich op correcte procedures, gasmanagement en uitrustingsconfiguraties die passen bij Saba's diepere pinnacles en wanden.",
    includes: ["eLearning vooraf afronden", "Geavanceerde duikplanning", "Technische procedures en gasmanagement", "Uitrustingsconfiguratie en streamlining"],
    cta: "Vraag info over technisch duiken",
    path: "/contact?interest=tdi-technical",
    subcourses: [
      { name: "Intro to Tech", level: "Introductie", duration: "2–3 dagen" },
      { name: "Advanced Nitrox", level: "Technisch", duration: "2–3 dagen" },
      { name: "Decompression Procedures", level: "Technisch", duration: "3 dagen" },
      { name: "Advanced Nitrox & Deco Combo", level: "Technisch", duration: "4–5 dagen" },
    ],
  },
];

export function NlCourses() {
  return (
    <>
      <PageHero
        src="/images/optimized/diver-in-trim.webp"
        alt="Duiker in perfecte trim zwevend boven het rif in het Saba Marine Park"
        title="Leer duiken bij Sea Saba"
        subtitle="SDI- en TDI-opleidingen in een van de meest bijzondere marineparken van het Caraïbisch gebied"
        imageClassName="object-[80%_center] md:object-[75%_center] lg:object-center"
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: COURSES.map((course, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Course",
              name: course.name,
              description: course.description,
              provider: { "@id": BUSINESS_ID, "@type": "Organization", name: SITE_NAME, sameAs: SITE_URL },
            },
          })),
        }}
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Of je nu je eerste ademteug onder water neemt, je brevetten uitbouwt of
        technische duikvaardigheden ontwikkelt — Sea Saba biedt professionele
        SDI- en TDI-instructie in de beschermde wateren van het Saba Marine Park.
      </p>

      {/* Why Train with Sea Saba */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Waarom trainen bij Sea Saba</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_TRAIN_SABA.map((item) => (
            <div key={item.title} className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personalized Instruction */}
      <section className="mt-12">
        <FeatureImage
          src="/images/optimized/students-instruction.webp"
          alt="Duikcursisten krijgen instructie van een Sea Saba-instructeur"
          objectPosition="left"
          imageRight
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Persoonlijke instructie</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Bij Sea Saba geloven we al sinds jaar en dag dat leren beter gaat in kleine
              groepen. De meeste cursussen worden 1:1 of 2:1 gegeven, zodat cursisten de
              aandacht en flexibiliteit krijgen die ze verdienen. Voor grotere groepen
              zetten we extra instructeurs en assistenten in om dezelfde persoonlijke
              ervaring te behouden.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Kleine groepen zijn voor ons geen nieuwe trend. Het is onze filosofie
              sinds {OPERATIONS.establishedYear}.
            </p>
          </div>
        </FeatureImage>
      </section>

      {/* Modern Rental Equipment */}
      <section className="mt-12">
        <FeatureImage
          src="/images/optimized/rental-bcd-equipment.webp"
          alt="Huuruitrusting van Sea Saba — trimvesten en duikmateriaal voor cursisten"
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Moderne huuruitrusting</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Alle cursussen omvatten volledig gebruik van onze moderne
              Scubapro-uitrusting — trimvesten, ademautomaten, wetsuits, maskers,
              vinnen en polsduikcomputers. XDeep backplate- en wingsystemen zijn ook
              beschikbaar voor duikers die een gestroomlijnde technische setup
              prefereren. Nitrox is gratis voor gebrevetteerde duikers, waar passend.
            </p>
          </div>
        </FeatureImage>
      </section>

      {/* Courses */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Cursusaanbod</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kies je pad — van eerste duikervaring tot professionele en technische brevettering.
        </p>

        <div className="mt-6 space-y-6">
          {COURSES.map((course) => (
            <div
              key={course.name}
              id={course.id}
              className="scroll-mt-24 rounded-lg border border-border/60 bg-card p-6 transition-colors hover:border-primary/20"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{course.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {course.level} • {course.duration}
                  </p>
                </div>
                <TrackedInternalButton
                  variant="outline"
                  size="sm"
                  href={localeHref("nl", course.path)}
                  eventName="contact_click"
                  buttonText={course.cta}
                  buttonLocation="course_card"
                >
                  {course.cta}
                </TrackedInternalButton>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {course.includes.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>

              {course.options && course.options.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Optionele Adventure Dives</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {course.options.map((option) => (
                      <span
                        key={option}
                        className="rounded-full border border-border/50 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {course.note && (
                <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">{course.note}</p>
              )}

              {course.subcourses && course.subcourses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Beschikbare technische cursussen</h4>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {course.subcourses.map((sub) => (
                      <div
                        key={sub.name}
                        className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-foreground">{sub.name}</span>
                        <span className="block text-xs text-muted-foreground">{sub.level} • {sub.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Course Availability Note */}
      <section className="mt-12 rounded-lg border border-border/40 bg-muted/20 p-6">
        <h2 className="text-lg font-semibold text-foreground">Beschikbaarheid van cursussen</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          De beschikbaarheid van cursussen hangt af van de planning van instructeurs,
          de ervaring van de cursist, het weer en de cursuseisen. Neem contact op met
          Sea Saba als je tijdens je bezoek een cursus wilt volgen.
        </p>
        <div className="mt-4">
          <TrackedInternalButton
            variant="outline"
            href={localeHref("nl", "/contact")}
            eventName="contact_click"
            buttonText="Contact Sea Saba"
            buttonLocation="course_availability"
          >
            Neem contact op met Sea Saba
          </TrackedInternalButton>
        </div>
      </section>

      {/* Courses are inquiry-based, not bookable in Checkfront — send course
          seekers to the contact form rather than a booking page without them. */}
      <BookingCTA
        heading="Begin met je training"
        description="Reserveer je cursus of vraag meer informatie over SDI- en TDI-opleidingen op Saba."
        buttonText="Vraag info over cursussen"
        href={localeHref("nl", "/contact?interest=course-inquiry")}
        className="mt-12"
        buttonLocation="courses_footer_cta"
      />
    </>
  );
}
