import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";
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
      "Perfect for first-time divers who want to experience scuba without committing to a full certification course.",
    includes: ["All equipment", "Supervised boat dive", "Instructor guidance"],
    cta: "Request Try Scuba Info",
    path: "/contact?interest=try-scuba",
  },
  {
    name: "SDI Open Water Diver",
    level: "Beginner",
    duration: "3–4 days",
    description:
      "Earn your first scuba certification and begin exploring the underwater world with confidence.",
    includes: ["Classroom sessions", "Confined water training", "4 open water dives", "All equipment"],
    cta: "Request Open Water Info",
    path: "/contact?interest=sdi-open-water",
  },
  {
    name: "SDI Advanced & Specialty Training",
    level: "Intermediate",
    duration: "2–3 days",
    description:
      "Build confidence, improve skills, and expand your diving experience with advanced and specialty training.",
    includes: ["Adventure dives", "Specialty options", "Equipment included"],
    cta: "Request Advanced Training Info",
    path: "/contact?interest=sdi-advanced-specialty",
  },
  {
    name: "SDI Rescue Diver",
    level: "Advanced",
    duration: "3–4 days",
    description:
      "Develop awareness, confidence, and problem-solving skills that make you a stronger dive buddy. Requires current First Aid/CPR certification.",
    includes: ["Rescue theory and practice", "Emergency scenarios", "First Aid/CPR requirement"],
    cta: "Request Rescue Diver Info",
    path: "/contact?interest=sdi-rescue",
  },
  {
    name: "SDI Divemaster",
    level: "Professional",
    duration: "2–4 weeks",
    description:
      "Take the first step toward professional-level diving and learn how to assist divers, support instructors, and lead with confidence.",
    includes: ["Leadership training", "Guided dive experience", "Theory and practical exams"],
    cta: "Request Divemaster Info",
    path: "/contact?interest=sdi-divemaster",
  },
  {
    name: "TDI Technical Diving",
    level: "Technical",
    duration: "Varies",
    description:
      "For experienced divers ready to expand beyond recreational limits, TDI courses introduce advanced planning, procedures, and equipment configurations.",
    includes: ["Advanced dive planning", "Technical procedures", "Specialized equipment configurations"],
    cta: "Request Technical Diving Info",
    path: "/contact?interest=tdi-technical",
  },
] as const;

export default function CoursesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Learn to Dive with Sea Saba
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        SDI and TDI training in one of the Caribbean&apos;s most unique marine parks.
      </p>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Whether you are taking your first breath underwater, continuing your education,
        or building technical diving skills, Sea Saba offers professional SDI and TDI
        instruction in the protected waters of the Saba Marine Park.
      </p>

      {/* Hero Image */}
      <div className="relative mt-8 aspect-[16/7] w-full overflow-hidden rounded-2xl shadow-sm">
        <Image
          src="/images/diver-in-trim.jpg"
          alt="Scuba diver in perfect trim hovering over the reef in the Saba Marine Park"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

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
        <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
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
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm lg:col-span-2">
            <Image
              src="/images/students.jpg"
              alt="Scuba diving students receiving instruction from a Sea Saba instructor"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-left"
            />
          </div>
        </div>
      </section>

      {/* Equipment Image */}
      <div className="mt-12 grid gap-8 lg:grid-cols-5 lg:items-center">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm lg:col-span-2">
          <Image
            src="/images/rental-bcd.jpg"
            alt="Sea Saba rental BCD scuba equipment available for student divers"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-center"
          />
        </div>
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold text-foreground">Modern Rental Equipment</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            All courses include full use of our modern Scubapro equipment — BCDs, regulators,
            wetsuits, masks, fins, and wrist-mounted dive computers. XDeep backplate and wing
            systems are also available for divers who prefer a streamlined technical setup.
            Nitrox is complimentary for certified divers when appropriate.
          </p>
        </div>
      </div>

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

