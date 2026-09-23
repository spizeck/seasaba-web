"use client";

import { useState } from "react";
import { isSentryActive } from "@/lib/sentry";

/**
 * The two verification actions on /sentry-check (#129). Each action reports
 * explicit local state so the operator knows what happened; no stack traces
 * or event contents are ever shown, and nothing here touches GA4/GTM/Vercel
 * Analytics.
 *
 * The browser test goes through the client SDK (instrumentation-client.ts);
 * the server test POSTs to the /sentry-check/server-error route handler so
 * the event genuinely traverses the Node.js SDK path. Both are guarded by
 * the shared production-only gate — anywhere else they report inactivity
 * instead of emitting.
 */
type Status = "idle" | "sending" | "sent" | "inactive" | "failed";

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  sending: "Sending…",
  sent: "Test event sent — check the sea-saba-web Sentry project.",
  inactive: "Sentry is inactive in this deployment (not Vercel Production or no DSN).",
  failed: "The test action failed before reaching Sentry.",
};

export const SENTRY_CHECK_BROWSER_ERROR_MESSAGE =
  "Sea Saba Sentry browser check — controlled test event from /sentry-check";

export function SentryCheckControls() {
  const [browserStatus, setBrowserStatus] = useState<Status>("idle");
  const [serverStatus, setServerStatus] = useState<Status>("idle");

  async function sendBrowserError() {
    if (!isSentryActive()) {
      setBrowserStatus("inactive");
      return;
    }
    setBrowserStatus("sending");
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(new Error(SENTRY_CHECK_BROWSER_ERROR_MESSAGE), {
        tags: { source: "sentry-check", surface: "browser" },
      });
      setBrowserStatus("sent");
    } catch {
      setBrowserStatus("failed");
    }
  }

  async function sendServerError() {
    setServerStatus("sending");
    try {
      const response = await fetch("/sentry-check/server-error", { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as {
        sent?: boolean;
        reason?: string;
      };
      if (response.ok && body.sent) setServerStatus("sent");
      else if (body.reason === "sentry_inactive") setServerStatus("inactive");
      else setServerStatus("failed");
    } catch {
      setServerStatus("failed");
    }
  }

  return (
    <section className="mt-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        Each button emits exactly one recognizable, controlled error. Trigger
        each once, then confirm both appear as separate events in Sentry.
      </p>

      <div className="rounded-lg border p-5">
        <h2 className="font-medium">Browser test</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Captures an exception through the browser SDK on this page.
        </p>
        <button
          type="button"
          onClick={sendBrowserError}
          disabled={browserStatus === "sending"}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Send Browser Test Error
        </button>
        {browserStatus !== "idle" ? (
          <p role="status" className="mt-2 text-sm">
            {STATUS_TEXT[browserStatus]}
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="font-medium">Server test</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Posts to a route handler that captures an exception through the
          Node.js server SDK.
        </p>
        <button
          type="button"
          onClick={sendServerError}
          disabled={serverStatus === "sending"}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Send Server Test Error
        </button>
        {serverStatus !== "idle" ? (
          <p role="status" className="mt-2 text-sm">
            {STATUS_TEXT[serverStatus]}
          </p>
        ) : null}
      </div>
    </section>
  );
}
