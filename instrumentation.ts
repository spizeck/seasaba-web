import * as Sentry from "@sentry/nextjs";

/**
 * Next.js server instrumentation (#129).
 *
 * register() loads the Node.js server config. There is deliberately no edge
 * branch: nothing in this app runs on the Edge runtime (no middleware, no
 * `runtime = "edge"` exports), so no sentry.edge.config.ts exists.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

// Framework error hook: captures errors from Server Components, route
// handlers and server actions — including errors Next swallows into its
// own error handling. No-ops whenever the SDK was initialized disabled.
export const onRequestError = Sentry.captureRequestError;
