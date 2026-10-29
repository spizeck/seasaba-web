import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";
import { NewsletterTokenHandler } from "@/components/newsletter-token-handler";

/**
 * Double opt-in landing page. Token-bearing URL — always noindex, and the
 * page fires no analytics (the handler tracks nothing).
 */
export const metadata: Metadata = createMetadata({
  title: "Confirm your subscription",
  description: "Confirm your Sea Saba newsletter subscription.",
  path: "/newsletter/confirm",
  noIndex: true,
});

export default function NewsletterConfirmPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Confirm your subscription
      </h1>
      <Suspense>
        <NewsletterTokenHandler kind="confirm" />
      </Suspense>
    </>
  );
}
