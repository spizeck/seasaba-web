"use client";

import { trackLinkClick, type AnalyticsEvent } from "@/lib/analytics";

interface TrackedContactLinkProps {
  href: string;
  eventName: AnalyticsEvent;
  buttonText: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

export function TrackedContactLink({
  href,
  eventName,
  buttonText,
  children,
  className,
  external,
  ariaLabel,
}: TrackedContactLinkProps) {
  return (
    <a
      href={href}
      onClick={() => trackLinkClick(eventName, href, buttonText)}
      className={className}
      aria-label={ariaLabel}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}
