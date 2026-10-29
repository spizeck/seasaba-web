"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/**
 * Footer newsletter band: a compact email field that hands off to the
 * full /newsletter page — the signup itself (consent, audience choice,
 * double opt-in) lives there, so no form logic is duplicated here.
 * placement=footer attribution travels in the handoff URL.
 */
export function NewsletterFooterCta() {
  const router = useRouter();
  const [email, setEmail] = useState("");

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
            Occasional trip-planning tips and island updates — no noise.
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
