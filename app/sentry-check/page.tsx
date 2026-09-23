import type { Metadata } from "next";
import { SentryCheckControls } from "@/components/sentry-check-controls";

// Temporary verification page — never indexed, never followed, never linked
// from the site. noindex here is the primary control; robots.txt disallow and
// sitemap/llms.txt/nav exclusion back it up.
export const metadata: Metadata = {
  title: "Sentry Check",
  robots: { index: false, follow: false },
};

export default function SentryCheckPage() {
  return (
    <main className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Sentry verification</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Temporary deployment check for the Sea Saba error-monitoring baseline.
        Events sent from here go to the <code>sea-saba-web</code> Sentry project
        and are tagged <code>source: sentry-check</code>. This page is unlinked
        and noindexed, and is removed again once production verification is
        done.
      </p>

      <SentryCheckControls />
    </main>
  );
}
