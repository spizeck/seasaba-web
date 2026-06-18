"use client";

import { useEffect, useRef, useState } from "react";

const CF_SCRIPT_SRC = "//seasaba.checkfront.com/lib/interface--0.js";
const CF_SCRIPT_ID = "checkfront-interface-script";
const CF_WIDGET_CONFIG = {
  host: "seasaba.checkfront.com",
  target: "CHECKFRONT_WIDGET_01",
  item_id: "245,244,243,246,247,248,253,249,254",
  category_id: "4,51,49",
  tid: "seasaba-website",
  options: "category_select",
  style: "font-family: Inter",
  provider: "droplet",
} as const;

const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 12000;
const DIRECT_BOOKING_URL = "https://seasaba.checkfront.com/reserve/";

export function BookingWidget() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
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

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window as any).DROPLET.Widget(CF_WIDGET_CONFIG).render();
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
