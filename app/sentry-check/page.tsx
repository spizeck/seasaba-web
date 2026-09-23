import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SentryCheckAuthForm } from "@/components/sentry-check-auth-form";
import { SentryCheckControls } from "@/components/sentry-check-controls";
import {
  SENTRY_CHECK_COOKIE,
  verifySessionValue,
} from "@/lib/sentry-check";

// Operational page — never indexed, never followed, never linked from the
// site. noindex here is the primary control; robots.txt disallow and
// sitemap/llms.txt/nav exclusion back it up.
export const metadata: Metadata = {
  title: "Sentry Check",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SentryCheckPage() {
  const cookieStore = await cookies();
  const authorized = verifySessionValue(
    cookieStore.get(SENTRY_CHECK_COOKIE)?.value,
    process.env.SENTRY_CHECK_TOKEN
  );

  return (
    <main className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Sentry verification</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Operational check for the Sea Saba error-monitoring baseline. Events
        sent from here go to the <code>sea-saba-web</code> Sentry project and
        are tagged <code>source: sentry-check</code>. This page is unlinked,
        noindexed and token-gated.
      </p>

      {authorized ? <SentryCheckControls /> : <SentryCheckAuthForm />}
    </main>
  );
}
