"use client";

import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | "book_now_click"
  | "checkfront_click"
  | "contact_form_submit"
  | "email_click"
  | "phone_click"
  | "whatsapp_click"
  | "directions_click"
  | "ferry_link_click"
  | "social_click"
  | "pdf_download"
  | "newsletter_signup";

interface EventParams {
  page_path?: string;
  page_title?: string;
  link_destination?: string;
  button_text?: string;
  referrer?: string;
  [key: string]: string | number | undefined;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getPageInfo(): Pick<EventParams, "page_path" | "page_title" | "referrer"> {
  if (!isBrowser()) return {};
  return {
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || undefined,
  };
}

type GtagFunction = (
  command: "event" | "config" | "js" | "consent",
  ...args: (string | Record<string, string | number | undefined> | Date)[]
) => void;

function sendToGA4(eventName: AnalyticsEvent, params: EventParams): void {
  if (!isBrowser()) return;
  const gtag = (window as unknown as { gtag?: GtagFunction }).gtag;
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

function sendToGTM(eventName: AnalyticsEvent, params: EventParams): void {
  if (!isBrowser()) return;
  const dataLayer = (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({
      event: eventName,
      ...params,
    });
  }
}

export function trackEvent(eventName: AnalyticsEvent, params: EventParams = {}): void {
  const mergedParams = { ...getPageInfo(), ...params };

  try {
    track(eventName, mergedParams);
  } catch {
    // Vercel Analytics may be blocked or unavailable; continue silently
  }

  sendToGA4(eventName, mergedParams);
  sendToGTM(eventName, mergedParams);
}

export function trackLinkClick(
  eventName: AnalyticsEvent,
  href: string,
  buttonText?: string
): void {
  trackEvent(eventName, {
    link_destination: href,
    button_text: buttonText || getLinkText(href),
  });
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
