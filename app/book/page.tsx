import { createMetadata } from "@/lib/metadata";
import { BookingWidget } from "@/components/booking-widget";

export const metadata = createMetadata({
  title: "Book Your Dive",
  description:
    "Reserve your scuba diving experience in Saba. Check availability, book dives, courses, and packages online.",
  path: "/book",
});

export default function BookPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Book Your Dive
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Check availability and reserve your dives, courses, or packages below.
        All bookings are processed securely through Checkfront.
      </p>
      <div className="mt-8">
        <BookingWidget />
      </div>
    </div>
  );
}
