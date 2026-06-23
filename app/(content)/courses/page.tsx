import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { Button } from "@/components/ui/button";
import { BookingCTA } from "@/components/booking-cta";
import { Award, Users, CheckCircle, Ship, MapPin, Wrench, Car, ShieldCheck, Compass } from "lucide-react";

export const metadata = createMetadata({
  title: "Scuba Courses & Certifications",
  description:
    "SDI and TDI scuba diving courses in Saba. From Try Scuba to Divemaster, learn with experienced instructors in the Caribbean's most unique marine park.",
  path: "/courses",
});
const WHY_TRAIN_SABA = [
  {
    icon: Award,
    title: "Professional SDI & TDI Training",
    description:
      "Internationally recognized training agency with professional, experienced instructors.",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description:
      "Personal attention and flexible pacing to help you learn with confidence.",
  },
  {
    icon: Compass, // or Anchor
    title: "40+ Years of Experience",
    description:
      "Since 1985, Sea Saba has introduced thousands of divers to the underwater world and the reefs of Saba.",
  },

  {
    icon: MapPin,
    title: "Protected Marine Park",
    description:
      "Train in one of the Caribbean's most pristine and well-managed marine environments.",
  },
  {
    icon: Ship,
    title: "From Harbor to Reef",
    description:
      "Start in the calm waters of Fort Bay Harbor to perfect buoyancy and weighting before completing open water dives on Saba's spectacular reef sites.",
  },
  {
    icon: Wrench,
    title: "Premium Equipment Included",
    description:
      "Train with modern Scubapro equipment and wrist-mounted dive computers. XDeep backplate and wing systems are also available for divers who prefer a streamlined setup.",
  },

  {
    icon: CheckCircle,
    title: "Free 32% Nitrox",
    description:
      "Complimentary 32% Nitrox for certified nitrox divers when appropriate.",
  },
  {
    icon: Car, 
    title: "Complimentary Taxi Transport",
    description:
      "Free transportation for scheduled training dives so you can focus on learning.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    description:
      "Small groups, experienced instructors and well-maintained equipment help ensure a safe and enjoyable learning experience.",
  },
];

const COURSES = [
  {
    name: "Try Scuba",
    level: "Beginner",
    duration: "Full day",
    description:
      "Your first breath underwater, taken on a real dive site. No certification required — just curiosity. A Sea Saba instructor guides you every step of the way, from a quick skills introduction in Fort Bay Harbor to a supervised boat dive on the reef.",
    includes: ["All equipment provided", "Supervised boat dive", "2:1 instructor-to-student ratio max", "No experience needed"],
    cta: "Request Try Scuba Info",
    path: "/contact?interest=try-scuba",
  },
  {
    name: "SDI Open Water Diver",
    level: "Beginner",
    duration: "3 days",
    description:
      "Complete your academics through SDI eLearning before you arrive, so your vacation is spent diving and not in a classroom. Confined water sessions take place in the calm waters of Fort Bay Harbor, and your four certification dives are completed from Sea Saba's boats on actual sites within the Saba Marine Park.",
    includes: ["Complete eLearning before arrival", "Confined water sessions in Fort Bay Harbor", "Four boat dives in the Saba Marine Park", "All equipment included", "3:1 instructor-to-student ratio max"],
    cta: "Request Open Water Info",
    path: "/contact?interest=sdi-open-water",
  },
  {
    name: "SDI Advanced Adventure Diver",
    level: "Intermediate",
    duration: "2 days",
    description:
      "Build confidence, sharpen your skills, and explore new areas of diving through adventure and specialty training conducted on Saba's diverse reef systems. Complete eLearning in advance and spend your time in the water.",
    includes: ["Five boat dives","Complete eLearning before arrival", "Deep Diver and Navigation mandatory","Flexible course options", "3:1 instructor-to-student ratio max", "Equipment included"],
    cta: "Request Advanced Training Info",
    path: "/contact?interest=sdi-advanced-specialty",
  },
  {
    name: "SDI Rescue Diver",
    level: "Advanced",
    duration: "2-3 days",
    description:
      "Become a more capable and confident diver by learning to recognize, prevent, and manage problems underwater. Rescue training makes you a stronger dive buddy and a more situationally aware diver in any environment. Requires current First Aid/CPR certification.",
    includes: ["Complete eLearning before arrival", "Rescue scenarios and practical exercises", "Emergency management skills", "Current First Aid/CPR certification required"],
    cta: "Request Rescue Diver Info",
    path: "/contact?interest=sdi-rescue",
  },
  {
    name: "SDI Divemaster",
    level: "Professional",
    duration: "4-8 weeks",
    description:
      "Gain real-world experience assisting instructors, supporting students, and participating in daily operations aboard Sea Saba's dive boats. Divemaster training at Sea Saba is hands-on from day one, set against some of the Caribbean's most dramatic underwater terrain.",
    includes: ["Leadership development", "Practical experience with daily operations", "Theory and watermanship evaluations", "Guided dive experience"],
    cta: "Request Divemaster Info",
    path: "/contact?interest=sdi-divemaster",
  },
  {
    name: "TDI Technical Courses",
    level: "Technical",
    duration: "Varies",
    description:
      "For experienced divers ready to push beyond recreational limits, TDI training at Sea Saba focuses on proper procedures, gas management, and equipment configurations suited to Saba's deeper pinnacles and walls.",
    includes: ["Complete eLearning before arrival", "Advanced dive planning", "Technical procedures and gas management", "Equipment configuration and streamlining"],
    cta: "Request Technical Diving Info",
    path: "/contact?interest=tdi-technical",
  },
] as const;

export default function CoursesPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/diver-in-trim.webp"
        alt="Scuba diver in perfect trim hovering over the reef in the Saba Marine Park"
        title="Learn to Dive with Sea Saba"
        subtitle="SDI and TDI training in one of the Caribbean's most unique marine parks"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Whether you are taking your first breath underwater, continuing your education,
        or building technical diving skills, Sea Saba offers professional SDI and TDI
        instruction in the protected waters of the Saba Marine Park.
      </p>

      {/* Why Train with Sea Saba */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Why Train with Sea Saba</h2>
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
          alt="Scuba diving students receiving instruction from a Sea Saba instructor"
          objectPosition="left"
          imageRight
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Personalized Instruction</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              At Sea Saba, we&apos;ve always believed learning is better in small groups. Most courses are
              taught 1:1 or 2:1, giving students the attention and flexibility they deserve. For larger
              groups, additional instructors and assistants are added to maintain the same personal
              experience.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Small groups aren&apos;t a new trend for us. They&apos;ve been our philosophy since 1985.
            </p>
          </div>
        </FeatureImage>
      </section>

      {/* Modern Rental Equipment */}
      <section className="mt-12">
        <FeatureImage
          src="/images/optimized/rental-bcd-equipment.webp"
          alt="Sea Saba rental BCD scuba equipment available for student divers"
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Modern Rental Equipment</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              All courses include full use of our modern Scubapro equipment — BCDs, regulators,
              wetsuits, masks, fins, and wrist-mounted dive computers. XDeep backplate and wing
              systems are also available for divers who prefer a streamlined technical setup.
              Nitrox is complimentary for certified divers when appropriate.
            </p>
          </div>
        </FeatureImage>
      </section>

      {/* Courses */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Course Offerings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your path from beginner experiences through professional and technical certification.
        </p>

        <div className="mt-6 space-y-6">
          {COURSES.map((course) => (
            <div
              key={course.name}
              className="rounded-lg border border-border/60 bg-card p-6 transition-colors hover:border-primary/20"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{course.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {course.level} • {course.duration}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={course.path}>{course.cta}</Link>
                </Button>
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
            </div>
          ))}
        </div>
      </section>

      {/* Course Availability Note */}
      <section className="mt-12 rounded-lg border border-border/40 bg-muted/20 p-6">
        <h2 className="text-lg font-semibold text-foreground">Course Availability</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Course availability depends on instructor scheduling, student experience, weather,
          and course requirements. Contact Sea Saba if you are planning training during your visit.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/contact">Contact Sea Saba</Link>
          </Button>
        </div>
      </section>

      <BookingCTA
        heading="Start your training"
        description="Reserve your course or request more information about SDI and TDI training in Saba."
        className="mt-12"
      />
    </>
  );
}

