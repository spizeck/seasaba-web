import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingCTA } from "@/components/booking-cta";
import { Award, Users, Droplets, CheckCircle, Ship, MapPin, Wrench } from "lucide-react";

export const metadata = createMetadata({
  title: "Scuba Courses & Certifications",
  description:
    "SDI and TDI scuba diving courses in Saba. From Try Scuba to Divemaster, learn with experienced instructors in the Caribbean's most unique marine park.",
  path: "/courses",
});

const WHY_TRAIN_SABA = [
  {
    icon: Award,
    title: "5 Star SDI and TDI Instruction",
    description: "Internationally recognized training agencies with professional, experienced instructors.",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description: "Personal attention and flexible pacing so you get the most from every dive.",
  },
  {
    icon: MapPin,
    title: "Protected Marine Park",
    description: "Train in the Saba Marine Park, one of the Caribbean's most pristine and well-managed environments.",
  },
  {
    icon: Ship,
    title: "Real Boat Diving Experience",
    description: "Build skills on actual boat dives in open water, not just confined environments.",
  },
  {
    icon: Wrench,
    title: "Rental Equipment Available",
    description: "Quality gear is available if you do not have your own equipment for the course.",
  },
  {
    icon: CheckCircle,
    title: "Free 32% Nitrox",
    description: "Complimentary enriched air nitrox for qualified divers when appropriate.",
  },
  {
    icon: Droplets,
    title: "Complimentary Taxi Transport",
    description: "Free taxi transportation for scheduled training dives so you can focus on learning.",
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
      <section className="mt-12 rounded-lg border border-border/40 bg-muted/20 p-6">
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

