"use client";

import { trackLinkClick, type AnalyticsEvent } from "@/lib/analytics";

interface TrackedOutboundLinkProps {
  href: string;
  eventName: AnalyticsEvent;
  buttonText: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function TrackedOutboundLink({
  href,
  eventName,
  buttonText,
  children,
  className,
  ariaLabel,
}: TrackedOutboundLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackLinkClick(eventName, href, buttonText)}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </a>
  );
}
