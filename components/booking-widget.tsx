"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/constants";

const WIDGET_LOAD_TIMEOUT = 8000;

export function BookingWidget() {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }, WIDGET_LOAD_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      {status === "error" && (
        <div className="rounded-lg border border-border/40 bg-muted/20 p-10 text-center">
          <p className="text-lg font-semibold text-foreground">
            Booking system is loading slowly
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You can book directly through our booking portal instead.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                Open Booking Portal
              </a>
            </Button>
          </div>
        </div>
      )}

      <div className={status === "error" ? "hidden" : ""}>
        {status === "loading" && (
          <div className="flex min-h-100 items-center justify-center rounded-lg border border-border/40 bg-muted/10">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading booking system...
              </p>
            </div>
          </div>
        )}

        <iframe
          src={BOOKING_URL}
          title="Sea Saba Booking"
          className="min-h-150 w-full rounded-lg border border-border/40"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      </div>

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
          href={BOOKING_URL}
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
