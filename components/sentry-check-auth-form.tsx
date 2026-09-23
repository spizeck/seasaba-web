"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/**
 * Token sign-in for /sentry-check (#129). The typed token is POSTed to the
 * session endpoint via fetch — it never appears in a URL and nothing secret
 * is bundled; the value only exists in the field the owner types into. On
 * success the response sets an HttpOnly session cookie and the page is
 * reloaded so the server component renders the controls.
 *
 * fetch (not a native form POST) is deliberate: the site's CSP form-action
 * 'self' blocks form submissions, while connect-src 'self' covers fetch —
 * no CSP weakening required.
 */
export function SentryCheckAuthForm() {
  const router = useRouter();
  const tokenRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<
    "idle" | "checking" | "denied" | "limited" | "failed"
  >("idle");

  async function authorize(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = tokenRef.current?.value ?? "";
    if (!token) return;
    setStatus("checking");
    try {
      const body = new FormData();
      body.set("token", token);
      const response = await fetch("/sentry-check/session", {
        method: "POST",
        body,
      });
      if (response.ok) {
        // Re-render the server component — it now sees the session cookie
        // and swaps this form for the test controls.
        router.refresh();
        return;
      }
      setStatus(response.status === 429 ? "limited" : "denied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <form onSubmit={authorize} className="mt-6 rounded-lg border p-5">
      <label htmlFor="sentry-token" className="block text-sm font-medium">
        Access token
      </label>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the value of <code>SENTRY_CHECK_TOKEN</code> from the Vercel
        Production environment. It is checked server-side and stored nowhere
        in the page.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          ref={tokenRef}
          id="sentry-token"
          name="token"
          type="password"
          required
          autoComplete="off"
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "checking"}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Authorize
        </button>
      </div>
      {status === "denied" ? (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          That token was not accepted.
        </p>
      ) : null}
      {status === "limited" ? (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          Too many attempts — wait a minute and try again.
        </p>
      ) : null}
      {status === "failed" ? (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          The authorization request failed.
        </p>
      ) : null}
    </form>
  );
}
