"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

/**
 * App-wide error boundary (#129). This is the framework-supported surface
 * for errors that escape the locale root layouts — it replaces the root
 * layout, so it must render its own <html>/<body>. The site previously had
 * no boundary at all (Next's bare default); this keeps the same semantics —
 * a full-page error screen with a retry — while reporting through Sentry.
 * captureException is a no-op anywhere Sentry is disabled.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <main className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-muted-foreground">
            We hit an unexpected problem loading this page. Please try again —
            if it keeps happening, contact us at info@seasaba.com.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          {/* Escape route for persistent failures — a retry that keeps
              failing shouldn't strand the visitor on a dead-end page. */}
          <p className="mt-4 text-sm">
            {/* Plain <a> on purpose: this boundary renders when the root
                layout — and possibly the router context <Link> needs —
                has already failed. A full navigation re-bootstraps the
                app, which is the recovery the escape route exists for. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              If it keeps happening, head back to the homepage
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
