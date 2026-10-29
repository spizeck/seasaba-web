"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, TriangleAlert } from "lucide-react";

type TokenKind = "confirm" | "unsubscribe";

type State =
  | { kind: "working" }
  | { kind: "ok" }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "unavailable" };

const COPY: Record<
  TokenKind,
  { working: string; ok: string; okDetail: string; invalid: string }
> = {
  confirm: {
    working: "Confirming your subscription…",
    ok: "You're subscribed!",
    okDetail:
      "Your Sea Saba newsletter subscription is confirmed. Welcome aboard — watch for the next edition in your inbox.",
    invalid: "This confirmation link isn't valid.",
  },
  unsubscribe: {
    working: "Updating your subscription…",
    ok: "You've been unsubscribed.",
    okDetail:
      "You won't receive the Sea Saba newsletter anymore. This doesn't affect booking or reservation emails.",
    invalid: "This unsubscribe link isn't valid.",
  },
};

/**
 * Shared handler for /newsletter/confirm and /newsletter/unsubscribe:
 * reads the emailed capability token from the URL and redeems it through
 * the first-party API route. The token never touches analytics — this
 * component fires no tracking calls.
 */
export function NewsletterTokenHandler({ kind }: { kind: TokenKind }) {
  const searchParams = useSearchParams();
  // A missing token is invalid by construction — decided at render, not
  // via an effect, so there's no synchronous setState in the effect.
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<State>(
    token ? { kind: "working" } : { kind: "invalid" }
  );
  const started = useRef(false);
  const copy = COPY[kind];

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;
    let cancelled = false;
    void fetch(`/api/newsletter/${kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          setState({ kind: "ok" });
          return;
        }
        const body = (await res.json().catch(() => null)) as {
          kind?: string;
        } | null;
        if (body?.kind === "expired") setState({ kind: "expired" });
        else if (body?.kind === "invalid_token") setState({ kind: "invalid" });
        else setState({ kind: "unavailable" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "unavailable" });
      });
    return () => {
      cancelled = true;
    };
  }, [kind, token]);

  return (
    <div className="not-prose mt-8 rounded-lg border border-border/60 bg-card p-6" role="status">
      {state.kind === "working" && (
        <p className="text-base text-muted-foreground">{copy.working}</p>
      )}
      {state.kind === "ok" && (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-semibold text-foreground">{copy.ok}</p>
            <p className="mt-1 text-sm text-muted-foreground">{copy.okDetail}</p>
          </div>
        </div>
      )}
      {(state.kind === "invalid" ||
        state.kind === "expired" ||
        state.kind === "unavailable") && (
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="font-semibold text-foreground">
              {state.kind === "expired"
                ? "This link has expired."
                : state.kind === "invalid"
                  ? copy.invalid
                  : "Something went wrong on our side."}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {state.kind === "unavailable"
                ? "Please try again in a moment, or email us at info@seasaba.com."
                : kind === "confirm"
                  ? "Sign up again to get a fresh confirmation link."
                  : "If you keep seeing this, email us at info@seasaba.com."}{" "}
              <Link
                href="/newsletter"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Go to the newsletter page
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
