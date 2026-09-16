"use client";

import { useEffect, useRef, useState } from "react";
import { trackLinkClick } from "@/lib/analytics";
import { BOOKING_URL, CONTACT } from "@/lib/constants";
import {
  BOOKABLE_PRODUCTS,
  CHECKFRONT_ALL_ITEM_IDS,
  CHECKFRONT_EXTRA_ITEMS,
  resolveBookingItem,
  type BookableProduct,
} from "@/data/operations";

const CF_SCRIPT_SRC = "//seasaba.checkfront.com/lib/interface--0.js";
const CF_SCRIPT_ID = "checkfront-interface-script";

// Slug and display-name lookups derive from the canonical product registry in
// data/operations.ts so /book?item= deep links can't drift from the catalog.
const ITEM_NAMES: Record<string, string> = {
  ...Object.fromEntries(
    Object.values(BOOKABLE_PRODUCTS).map((p) => [p.checkfrontItemId, p.name])
  ),
  ...CHECKFRONT_EXTRA_ITEMS,
};

const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 12000;
const CHECKFRONT_HOST = new URL(BOOKING_URL).host;
const TRACKING_ID = "seasaba-website";

/**
 * Hosted-booking-page fallback URL. When a product is preselected the item
 * (or its category) is carried over so the recovery path lands on the same
 * product the customer chose; tid preserves website attribution.
 */
function directBookingUrl(itemId: string | null): string {
  const url = new URL(BOOKING_URL);
  url.searchParams.set("tid", TRACKING_ID);
  if (itemId) {
    const product: BookableProduct | undefined = Object.values(
      BOOKABLE_PRODUCTS
    ).find((p) => p.checkfrontItemId === itemId);
    if (product?.checkfrontCategoryId) {
      url.searchParams.set("category_id", product.checkfrontCategoryId);
    } else {
      url.searchParams.set("item_id", itemId);
    }
  }
  return url.toString();
}

function trackCheckfrontClick(buttonText: string, buttonLocation: string, bookingItem: string) {
  trackLinkClick("checkfront_click", BOOKING_URL, buttonText, {
    button_name: buttonText,
    button_location: buttonLocation,
    booking_item: bookingItem,
  });
}

interface BookingWidgetProps {
  /**
   * Raw `/book?item=` value, resolved by the server page. The page keys this
   * component by the param so client-side navigation between items remounts
   * and re-renders the widget with the new preselection.
   */
  item?: string;
}

export function BookingWidget({ item }: BookingWidgetProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const { itemId, unknown } = resolveBookingItem(item);
  const fallbackUrl = directBookingUrl(itemId);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (renderedRef.current) return;

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let originalScrollTo: typeof window.scrollTo | null = null;

    function suppressScroll() {
      originalScrollTo = window.scrollTo.bind(window);
      window.scrollTo = () => {};
      setTimeout(() => {
        if (originalScrollTo) window.scrollTo = originalScrollTo;
      }, 2000);
    }

    function renderWidget() {
      if (renderedRef.current) return;
      renderedRef.current = true;

      suppressScroll();

      // Build widget config based on preselected item
      const product: BookableProduct | undefined = Object.values(BOOKABLE_PRODUCTS).find((p) => p.checkfrontItemId === itemId);
      const categoryId = product?.checkfrontCategoryId;
      const widgetConfig = {
        host: CHECKFRONT_HOST,
        target: "CHECKFRONT_WIDGET_01",
        item_id: categoryId ? undefined : (itemId || CHECKFRONT_ALL_ITEM_IDS),
        category_id: categoryId ?? (itemId ? undefined : "4,51,49"),
        tid: TRACKING_ID,
        options: itemId && !categoryId ? undefined : "category_select",
        style: "font-family: Inter",
        provider: "droplet",
      };

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window as any).DROPLET.Widget(widgetConfig).render();
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    function startPolling() {
      pollTimer = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).DROPLET) {
          if (pollTimer) clearInterval(pollTimer);
          if (timeoutTimer) clearTimeout(timeoutTimer);
          renderWidget();
        }
      }, POLL_INTERVAL_MS);

      timeoutTimer = setTimeout(() => {
        if (pollTimer) clearInterval(pollTimer);
        if (!renderedRef.current) setStatus("error");
      }, POLL_TIMEOUT_MS);
    }

    if (!document.getElementById(CF_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = CF_SCRIPT_ID;
      script.src = CF_SCRIPT_SRC;
      script.async = true;
      script.onload = startPolling;
      script.onerror = () => setStatus("error");
      document.head.appendChild(script);
    } else {
      startPolling();
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (originalScrollTo) window.scrollTo = originalScrollTo;
    };
  }, [itemId]);

  return (
    <div className="w-full">
      {status === "error" && (
        <div className="rounded-lg border border-border/40 bg-muted/20 p-10 text-center">
          <p className="text-lg font-semibold text-foreground">
            Booking isn&apos;t loading
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Open our secure booking page directly
            {itemId ? ` for ${ITEM_NAMES[itemId]}` : ""}, or reach us another
            way — we&apos;ll get you booked.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCheckfrontClick("Continue to Secure Booking System", "booking_widget_error", itemId || "general")}
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue to Secure Booking System
            </a>
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackLinkClick("whatsapp_click", CONTACT.whatsappHref, "WhatsApp", {
                  button_location: "booking_widget_error",
                })
              }
              className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              WhatsApp Us
            </a>
            {/* Plain anchors for recovery links: a hard navigation does not
                depend on the SPA router, which is the right guarantee when the
                widget has already failed. */}
            <a
              href="/contact?interest=book-diving"
              onClick={() =>
                trackLinkClick("contact_click", "/contact?interest=book-diving", "Contact Us", {
                  button_location: "booking_widget_error",
                })
              }
              className="text-sm font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Contact us instead
            </a>
          </div>
        </div>
      )}

      {unknown && (
        <div className="mb-6 rounded-lg border border-border/40 bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">
            We couldn&apos;t find that experience.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse all bookable options below, or{" "}
            <a
              href="/contact"
              onClick={() =>
                trackLinkClick("contact_click", "/contact", "ask us what fits", {
                  button_location: "booking_widget_unknown_item",
                })
              }
              className="underline hover:text-foreground"
            >
              ask us what fits
            </a>
            .
          </p>
        </div>
      )}

      {itemId && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">
            Booking: {ITEM_NAMES[itemId] || "Selected Experience"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check availability below or{" "}
            <a href="/book" className="underline hover:text-foreground">
              view all options
            </a>
          </p>
        </div>
      )}

      <div
        className={`relative min-h-[600px] w-full${status === "error" ? " hidden" : ""}`}
        tabIndex={-1}
      >
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-border/40 bg-muted/10">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading availability...
              </p>
            </div>
          </div>
        )}
        <div id="CHECKFRONT_WIDGET_01" className="w-full" />
      </div>

      <noscript>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          JavaScript is required to load the booking widget.{" "}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Continue to Secure Booking System
          </a>
        </p>
      </noscript>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Bookings are processed securely through{" "}
        <a
          href="https://www.checkfront.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Checkfront
        </a>
        . You can also{" "}
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCheckfrontClick("Book directly", "booking_widget_footer", itemId || "general")}
          className="underline underline-offset-2 hover:text-foreground"
        >
          book directly
        </a>
        .
      </p>
    </div>
  );
}
