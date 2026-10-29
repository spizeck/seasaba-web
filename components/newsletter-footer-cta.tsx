"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { isRoutePublished, parsePathname } from "@/lib/locale";

/**
 * Footer newsletter band: a compact email field that hands off to the
 * full /newsletter page — the signup itself (consent, audience choice,
 * double opt-in) lives there, so no form logic is duplicated here.
 * placement=footer attribution travels in the handoff URL.
 */
export function NewsletterFooterCta() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  // The signup band never appears on newsletter token pages: /newsletter
  // is the signup itself, and /newsletter/confirm + /newsletter/unsubscribe
  // exist only to redeem an emailed token — a signup prompt there is
  // either redundant ("You're subscribed!") or contradicts the action
  // just taken ("You've been unsubscribed."). Their error states already
  // link back to /newsletter, so nothing is lost. Only hide where the
  // route is actually published — on a not-yet-translated route the band
  // must stay, since it is the visitor's only signup entry point.
  const HIDDEN_ON = ["/newsletter", "/newsletter/confirm", "/newsletter/unsubscribe"];
  const { locale, path } = parsePathname(pathname ?? "/");
  if (HIDDEN_ON.includes(path) && isRoutePublished(locale, path)) {
    return null;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    trackEvent("newsletter_signup_submit", {
      placement: "footer",
      button_location: "footer",
    });
    const params = new URLSearchParams({
      placement: "footer",
      source: "website",
    });
    if (email.trim()) {
      try {
        // Email never rides in the URL — it would leak via Referer,
        // history, and tag-manager reads of location.href.
        sessionStorage.setItem("nl-prefill-email", email.trim().slice(0, 254));
      } catch {
        // Storage unavailable: the visitor types the email again.
      }
    }
    // The footer persists across client-side navigation; clear the field
    // so an abandoned signup doesn't leave the address sitting in the
    // band on the next page.
    setEmail("");
    router.push(`/newsletter?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Dive Saba in your inbox
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Occasional trip-planning tips and island updates. No noise.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="flex w-full max-w-sm gap-2">
        <label htmlFor="nl-footer-email" className="sr-only">
          Newsletter email address
        </label>
        <input
          id="nl-footer-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:text-sm"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground pressable focus-ring"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
