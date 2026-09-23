import { Header } from "@/components/header";
import { FooterWrapper } from "@/components/footer-wrapper";
import { LocalBusinessJsonLd } from "@/components/structured-data";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsLoader } from "@/components/analytics-loader";
import { ScrollPositionKeeper } from "@/components/scroll-position-keeper";
import { RespondIoWidget } from "@/components/respond-io-widget";
import { uiFor } from "@/content/ui";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";

/**
 * Shared site chrome for every locale root layout (#150). Each locale's
 * root layout (`app/(en)`, `app/nl`, …) renders its own html lang; the body
 * contents come from here so the shells can never diverge.
 */
export function SiteShell({
  children,
  locale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const ui = uiFor(locale);
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {ui.skipToContent}
      </a>
      <AnalyticsLoader />
      <Header locale={locale} />
      <main id="main-content">{children}</main>
      <FooterWrapper locale={locale} />
      <ScrollPositionKeeper />
      <LocalBusinessJsonLd />
      <RespondIoWidget />
      <Analytics />
    </>
  );
}
