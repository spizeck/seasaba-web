"use client";

import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | "book_now_click"
  | "checkfront_click"
  | "contact_click"
  | "contact_form_submit"
  | "email_click"
  | "phone_click"
  | "whatsapp_click"
  | "directions_click"
  | "ferry_link_click"
  | "social_click"
  | "pdf_download"
  | "newsletter_signup";

export type AnalyticsValue = string | number | boolean | undefined;

export interface EventParams {
  page_location?: string;
  page_path?: string;
  page_title?: string;
  page_referrer?: string;
  link_url?: string;
  link_text?: string;
  link_domain?: string;
  outbound?: boolean;
  button_name?: string;
  button_location?: string;
  booking_item?: string;
  link_destination?: string;
  button_text?: string;
  referrer?: string;
  [key: string]: AnalyticsValue;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getPageInfo(): EventParams {
  if (!isBrowser()) return {};
  const pageReferrer = document.referrer || undefined;
  return {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    page_referrer: pageReferrer,
    referrer: pageReferrer,
  };
}

function sendToGTM(eventName: AnalyticsEvent, params: EventParams): void {
  if (!isBrowser()) return;
  const target = window as unknown as { dataLayer?: Record<string, unknown>[] };
  target.dataLayer = target.dataLayer || [];
  target.dataLayer.push({ event: eventName, ...params });
}

function cleanParams(params: EventParams): EventParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as EventParams;
}

export function trackEvent(eventName: AnalyticsEvent, params: EventParams = {}): void {
  const mergedParams = cleanParams({ ...getPageInfo(), ...params });

  try {
    track(eventName, mergedParams);
  } catch {
    // Vercel Analytics may be blocked or unavailable; continue silently
  }

  sendToGTM(eventName, mergedParams);
}

export function trackLinkClick(
  eventName: AnalyticsEvent,
  href: string,
  linkText?: string,
  params: EventParams = {}
): void {
  const safeUrl = sanitizeAnalyticsUrl(href);
  const resolvedText = linkText || getLinkText(href);
  trackEvent(eventName, {
    ...params,
    link_url: safeUrl,
    link_text: resolvedText,
    link_domain: getLinkDomain(href),
    outbound: isOutboundLink(href),
    link_destination: safeUrl,
    button_text: resolvedText,
  });
}

export function trackBookingClick(
  href: string,
  buttonName: string,
  buttonLocation: string,
  bookingItem?: string
): void {
  trackLinkClick("book_now_click", href, buttonName, {
    button_name: buttonName,
    button_location: buttonLocation,
    booking_item: bookingItem || getBookingItem(href),
  });
}

export function sanitizeAnalyticsUrl(href: string): string {
  try {
    const parsed = new URL(href, isBrowser() ? window.location.origin : "https://www.seasaba.com");
    parsed.username = "";
    parsed.password = "";
    parsed.hash = "";

    if (
      parsed.protocol === "mailto:" ||
      parsed.protocol === "tel:" ||
      parsed.hostname === "wa.me" ||
      parsed.hostname === "api.whatsapp.com" ||
      parsed.hostname.endsWith(".whatsapp.com")
    ) {
      parsed.search = "";
    }

    if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") {
      return `${parsed.protocol}${parsed.pathname}`;
    }

    return parsed.toString();
  } catch {
    return href.split(/[?#]/, 1)[0];
  }
}

function getLinkDomain(href: string): string {
  try {
    const parsed = new URL(href, isBrowser() ? window.location.origin : "https://www.seasaba.com");
    if (parsed.protocol === "mailto:") return "email";
    if (parsed.protocol === "tel:") return "phone";
    return parsed.hostname.toLowerCase();
  } catch {
    return "unknown";
  }
}

function isOutboundLink(href: string): boolean {
  try {
    const parsed = new URL(href, isBrowser() ? window.location.origin : "https://www.seasaba.com");
    if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") return true;
    return isBrowser()
      ? parsed.origin !== window.location.origin
      : parsed.hostname !== "www.seasaba.com";
  } catch {
    return false;
  }
}

function getBookingItem(href: string): string {
  try {
    const parsed = new URL(href, isBrowser() ? window.location.origin : "https://www.seasaba.com");
    return parsed.searchParams.get("item") || "general";
  } catch {
    return "general";
  }
}

function getLinkText(href: string): string {
  if (href.startsWith("mailto:")) return "Email";
  if (href.startsWith("tel:")) return "Phone";

  try {
    const parsed = new URL(href, isBrowser() ? window.location.origin : "http://localhost");
    const host = parsed.hostname.toLowerCase();

    if (host === "checkfront.com" || host.endsWith(".checkfront.com")) return "Checkfront";
    if (host === "facebook.com" || host.endsWith(".facebook.com")) return "Facebook";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "LinkedIn";
    if (
      host === "twitter.com" ||
      host.endsWith(".twitter.com") ||
      host === "x.com" ||
      host.endsWith(".x.com")
    ) {
      return "Twitter/X";
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "YouTube";
    if (host === "whatsapp.com" || host.endsWith(".whatsapp.com") || host === "wa.me") return "WhatsApp";
    if (host === "google.com" || host.endsWith(".google.com") || host === "goo.gl") {
      if (parsed.pathname.startsWith("/maps")) return "Directions";
    }
  } catch {
    // Fallback for malformed/non-URL strings.
    // Avoid substring-based domain matching here; only parsed URL host checks are trusted.
  }

  return "Link";
}
