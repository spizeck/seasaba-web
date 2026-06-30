"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CF_SCRIPT_SRC = "//seasaba.checkfront.com/lib/interface--0.js";
const CF_SCRIPT_ID = "checkfront-interface-script";

// Simplified slug to Checkfront item ID mapping
const SLUG_TO_ITEM_ID: Record<string, string> = {
  "classic": "244",
  "advanced": "243",
  "afternoon": "245",
  "snorkel": "246",
  "private": "254",
};

// Item ID to display name mapping
const ITEM_NAMES: Record<string, string> = {
  "244": "Classic 2-Tank Dive",
  "243": "Advanced 2-Tank Dive",
  "245": "Afternoon 1-Tank Dive",
  "246": "Afternoon Snorkel Trip",
  "254": "Private Charter",
  "248": "Shore Diving (Tent Reef)",
  "253": "Nitrox Upgrade",
  "249": "Dive Packages",
};

const ALL_ITEM_IDS = "245,244,243,246,247,248,253,249,254";

const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 12000;
const DIRECT_BOOKING_URL = "https://seasaba.checkfront.com/reserve/";

function getPreselectedItemId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("item");
  if (!slug) return null;
  // Translate slug to Checkfront item ID, or return slug if it's already numeric
  return SLUG_TO_ITEM_ID[slug] || slug;
}

function subscribeToNothing() {
  return () => {};
}

export function BookingWidget() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  // Read the preselected item from the URL without a setState-in-effect:
  // null on the server, resolved value on the client (hydration-safe).
  const preselectedItem = useSyncExternalStore(
    subscribeToNothing,
    getPreselectedItemId,
    () => null
  );
  const renderedRef = useRef(false);

  useEffect(() => {
    // Get preselected item from URL
    const itemId = getPreselectedItemId();

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
      const isPrivate = itemId === "254";
      const widgetConfig = {
        host: "seasaba.checkfront.com",
        target: "CHECKFRONT_WIDGET_01",
        item_id: isPrivate ? undefined : (itemId || ALL_ITEM_IDS),
        category_id: isPrivate ? "49" : (itemId ? undefined : "4,51,49"),
        tid: "seasaba-website",
        options: itemId && !isPrivate ? undefined : "category_select",
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
  }, []);

  return (
    <div className="w-full">
      {status === "error" && (
        <div className="rounded-lg border border-border/40 bg-muted/20 p-10 text-center">
          <p className="text-lg font-semibold text-foreground">
            Booking system unavailable
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please continue to our secure booking portal to check availability.
          </p>
          <div className="mt-6">
            <a
              href={DIRECT_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue to Secure Booking System
            </a>
          </div>
        </div>
      )}

      {preselectedItem && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">
            Booking: {ITEM_NAMES[preselectedItem] || "Selected Dive Experience"}
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
            href={DIRECT_BOOKING_URL}
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
          href={DIRECT_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          book directly
        </a>
        .
      </p>
    </div>
  );
}
