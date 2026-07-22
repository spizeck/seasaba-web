"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { trackBookingClick, trackLinkClick, type AnalyticsEvent } from "@/lib/analytics";
import Link from "next/link";
import { type VariantProps } from "class-variance-authority";

type ButtonBaseProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

interface TrackedInternalButtonProps extends ButtonBaseProps {
  href: string;
  eventName: AnalyticsEvent;
  buttonText: string;
  buttonLocation: string;
  bookingItem?: string;
}

export function TrackedInternalButton({
  href,
  eventName,
  buttonText,
  buttonLocation,
  bookingItem,
  children,
  ...buttonProps
}: TrackedInternalButtonProps) {
  const handleClick = () => {
    if (eventName === "book_now_click") {
      trackBookingClick(href, buttonText, buttonLocation, bookingItem);
      return;
    }

    trackLinkClick(eventName, href, buttonText, { button_location: buttonLocation });
  };

  return (
    <Button
      {...buttonProps}
      asChild
      onClick={handleClick}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
