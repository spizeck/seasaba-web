import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingCTA } from "@/components/booking-cta";
import { Award, Users, Droplets, CheckCircle } from "lucide-react";

export const metadata = createMetadata({
  title: "Scuba Courses & Certifications",
  description:
    "SDI and TDI scuba diving courses in Saba. From Discover Scuba to Divemaster — learn with experienced instructors in the Caribbean's most pristine marine environment.",
  path: "/courses",
});

const WHY_LEARN_SABA = [
  {
    icon: Droplets,
    title: "Exceptional Conditions",
    description: "Warm, clear water with visibility often exceeding 30m. Perfect for learning and skill development.",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description: "Personal attention from instructors who know Saba's waters intimately. No crowded group classes.",
  },
  {
    icon: Award,
    title: "SDI / TDI Certification",
    description: "Internationally recognized certifications that open diving opportunities worldwide.",
  },
];

const COURSES = [
  {
    name: "Discover Scuba Diving",
    level: "Beginner",
    duration: "Half day",
    description:
      "Experience breathing underwater for the first time. After a brief orientation, you'll make a supervised dive on one of Saba's shallow reef sites with an experienced instructor.",
    includes: ["All equipment", "Supervised shore or boat dive", "Instructor guidance"],
    path: "/book",
  },
  {
    name: "Open Water Diver",
    level: "Beginner",
    duration: "3–4 days",
    description:
      "The foundational scuba certification. Learn essential skills through classroom sessions, confined water practice, and four open water dives. Graduate with a certification recognized worldwide.",
    includes: ["Classroom sessions", "Confined water training", "4 open water dives", "All equipment"],
    path: "/book",
  },
  {
    name: "Advanced Adventurer",
    level: "Intermediate",
    duration: "2–3 days",
    description:
      "Expand your capabilities with five adventure dives including deep diving and navigation. Perfect for divers who want to explore more of what Saba offers.",
    includes: ["5 adventure dives", "Deep and navigation focus", "Equipment included"],
    path: "/book",
  },
  {
    name: "Rescue Diver",
    level: "Advanced",
    duration: "3–4 days",
    description:
      "Develop the skills to prevent and manage dive emergencies. A challenging course that builds confidence and prepares you to assist other divers. Requires current First Aid/CPR certification.",
    includes: ["Rescue theory and practice", "Emergency scenarios", "First Aid requirement"],
    path: "/book",
  },
  {
    name: "Divemaster",
    level: "Professional",
    duration: "2–4 weeks",
    description:
      "The first professional level in diving. Develop leadership abilities, learn to guide certified divers, and assist with training. Work alongside Sea Saba's experienced team on Saba's world-class sites.",
    includes: ["Leadership training", "Guided dive experience", "Theory and practical exams"],
    path: "/contact",
  },
] as const;

export default function CoursesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Scuba Courses & Certifications
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Learn to dive or advance your skills in one of the Caribbean&apos;s most 
        rewarding environments. Sea Saba offers SDI and TDI certifications from 
        entry-level through professional, with small classes led by experienced 
        instructors who know these waters intimately.
      </p>

      {/* Why Learn in Saba */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Why Learn in Saba</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {WHY_LEARN_SABA.map((item) => (
            <div key={item.title} className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Course Offerings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your path from beginner experiences through professional certification.
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
                  <Link href={course.path}>
                    {course.path === "/contact" ? "Inquire" : "Book Course"}
                  </Link>
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

      {/* Specialty Courses Note */}
      <section className="mt-12 rounded-lg border border-border/40 bg-muted/20 p-6">
        <h2 className="text-lg font-semibold text-foreground">Specialty Courses</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Deep diving, nitrox, wreck diving, underwater photography, and more. 
          Contact us to discuss specialty training tailored to your interests 
          and Saba&apos;s unique diving environment.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/contact">Inquire About Specialties</Link>
          </Button>
        </div>
      </section>

      <BookingCTA
        heading="Start your certification"
        description="Reserve your course and begin your diving journey in Saba."
        className="mt-12"
      />
    </>
  );
}

