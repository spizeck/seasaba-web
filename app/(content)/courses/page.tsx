import { createMetadata } from "@/lib/metadata";
import { BookingCTA } from "@/components/booking-cta";

export const metadata = createMetadata({
  title: "Courses",
  description:
    "Scuba diving courses and certifications in Saba. From Open Water to Divemaster, learn with experienced instructors in the Caribbean's best diving conditions.",
  path: "/courses",
});

const COURSES = [
  {
    name: "Discover Scuba Diving",
    duration: "Half day",
    description:
      "No experience needed. A supervised introduction to breathing underwater and exploring Saba's reefs.",
  },
  {
    name: "Open Water Diver",
    duration: "3–4 days",
    description:
      "The world's most popular scuba certification. Learn the fundamentals and earn your card to dive independently.",
  },
  {
    name: "Advanced Open Water",
    duration: "2 days",
    description:
      "Build on your skills with deep dives, navigation, and specialty adventures. Perfect for expanding your range.",
  },
  {
    name: "Rescue Diver",
    duration: "3 days",
    description:
      "Learn to manage emergencies and become a more confident, capable diver. A challenging and rewarding course.",
  },
  {
    name: "Divemaster",
    duration: "2–4 weeks",
    description:
      "The first professional level. Develop leadership skills and learn to guide certified divers on Saba's sites.",
  },
] as const;

export default function CoursesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Courses & Certifications
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Whether you&apos;re taking your first breath underwater or pursuing a
        professional certification, Saba is an exceptional place to learn.
        Small class sizes, warm clear water, and experienced instructors.
      </p>

      <div className="mt-10 space-y-6">
        {COURSES.map((course) => (
          <div
            key={course.name}
            className="rounded-lg border border-border/60 bg-card p-6"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {course.name}
              </h2>
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                {course.duration}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          </div>
        ))}
      </div>

      <BookingCTA
        heading="Start your journey"
        description="Check course availability and reserve your spot."
        buttonText="View Availability"
        className="mt-12"
      />
    </>
  );
}
