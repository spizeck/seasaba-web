"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackBookingClick, trackLinkClick } from "@/lib/analytics";

interface BookingCTAProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  className?: string;
  buttonLocation?: string;
  /** Defaults to /book. Contact destinations emit contact_click, not book_now_click. */
  href?: string;
}

export function BookingCTA({
  heading = "Ready to dive?",
  description = "Book your Saba diving experience with Sea Saba.",
  buttonText = "Book Diving",
  className = "",
  buttonLocation = "booking_cta",
  href = "/book",
}: BookingCTAProps) {
  const handleClick = () => {
    if (href.startsWith("/contact")) {
      trackLinkClick("contact_click", href, buttonText, { button_location: buttonLocation });
      return;
    }
    trackBookingClick(href, buttonText, buttonLocation);
  };

  return (
    <div
      className={`rounded-lg border border-border/40 bg-muted/20 p-8 text-center ${className}`}
    >
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">
        <Button
          asChild
          size="lg"
          className="text-base font-semibold"
          onClick={handleClick}
        >
          <Link href={href}>{buttonText}</Link>
        </Button>
      </div>
    </div>
  );
}
