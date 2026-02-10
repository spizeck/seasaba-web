import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/constants";

interface BookingCTAProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

export function BookingCTA({
  heading = "Ready to dive?",
  description = "Check availability and book your next underwater adventure in Saba.",
  buttonText = "Book Now",
  className = "",
}: BookingCTAProps) {
  return (
    <div
      className={`rounded-lg border border-border/40 bg-muted/20 p-8 text-center ${className}`}
    >
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">
        <Button asChild>
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
            {buttonText}
          </a>
        </Button>
      </div>
    </div>
  );
}
