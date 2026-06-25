import { createMetadata } from "@/lib/metadata";
import { BookingWidget } from "@/components/booking-widget";
import { CheckCircle2, MessageSquare } from "lucide-react";

export const metadata = createMetadata({
  title: "Book Your Dive",
  description:
    "Reserve your scuba diving experience in Saba. Check availability, book dives, courses, and packages online.",
  path: "/book",
});

const DISCOUNT_HIGHLIGHTS = [
  "Discounts apply automatically to consecutive Classic and Advanced 2-Tank Dive days",
  "One rest day is allowed without resetting package pricing",
  "Afternoon dives can be added to create triple-tank days",
  "Single afternoon dives are not discounted",
];

export default function BookPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Book Your Dive
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Check availability and reserve your dives, courses, or packages below.
        All bookings are processed securely through Checkfront.
      </p>

      {/* Multi-day discounts section */}
      <section className="mt-8 rounded-lg border border-border/40 bg-muted/20 p-5">
        <h2 className="text-base font-semibold text-foreground">
          Stay Longer. Dive More. Save More.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Most guests spend several days exploring Saba&apos;s world-famous
          pinnacles, walls, and reefs. Progressive multi-day discounts are
          automatically applied to qualifying two-tank dive packages, with
          additional savings on rental equipment.
        </p>

        <ul className="mt-3 space-y-1.5">
          {DISCOUNT_HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>

        {/* Custom itinerary callout */}
        <div className="mt-4 rounded border border-border/50 bg-card px-4 py-3">
          <div className="flex items-start gap-2.5">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                 Need a custom itinerary?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Mix Classic and Advanced days, add a rest day, or create
                triple-tank days. Simply leave a note during booking or reply to
                your confirmation email anytime. Our team will happily adjust
                your reservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <BookingWidget />
      </div>
    </div>
  );
}
