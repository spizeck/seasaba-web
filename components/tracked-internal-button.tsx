"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";
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
}

export function TrackedInternalButton({
  href,
  eventName,
  buttonText,
  children,
  ...buttonProps
}: TrackedInternalButtonProps) {
  return (
    <Button
      {...buttonProps}
      asChild
      onClick={() => trackEvent(eventName, { button_text: buttonText, link_destination: href })}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
