"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import { trackLinkClick, type AnalyticsEvent } from "@/lib/analytics";

type ButtonBaseProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

interface TrackedOutboundButtonProps extends ButtonBaseProps {
  href: string;
  eventName: AnalyticsEvent;
  buttonText: string;
  ariaLabel?: string;
}

export function TrackedOutboundButton({
  href,
  eventName,
  buttonText,
  ariaLabel,
  children,
  ...buttonProps
}: TrackedOutboundButtonProps) {
  return (
    <Button {...buttonProps} asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onClick={() => trackLinkClick(eventName, href, buttonText)}
      >
        {children}
      </a>
    </Button>
  );
}
