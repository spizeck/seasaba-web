import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BookingCTAProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

export function BookingCTA({
  heading = "Ready to dive?",
  description = "Book your Saba diving experience with Sea Saba.",
  buttonText = "Book Diving",
  className = "",
}: BookingCTAProps) {
  return (
    <div
      className={`rounded-lg border border-border/40 bg-muted/20 p-8 text-center ${className}`}
    >
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">
        <Button asChild size="lg" className="text-base font-semibold">
          <Link href="/book">{buttonText}</Link>
        </Button>
      </div>
    </div>
  );
}
