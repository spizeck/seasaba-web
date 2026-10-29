import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";
import { NewsletterTokenHandler } from "@/components/newsletter-token-handler";

/** Unsubscribe landing page. Token-bearing URL — always noindex. */
export const metadata: Metadata = createMetadata({
  title: "Unsubscribe",
  description: "Unsubscribe from the Sea Saba newsletter.",
  path: "/newsletter/unsubscribe",
  noIndex: true,
});

export default function NewsletterUnsubscribePage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Unsubscribe
      </h1>
      <Suspense>
        <NewsletterTokenHandler kind="unsubscribe" />
      </Suspense>
    </>
  );
}
