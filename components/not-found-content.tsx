import Link from "next/link";
import { Button } from "@/components/ui/button";
import { uiFor } from "@/content/ui";
import { DEFAULT_LOCALE, localeHref, type Locale } from "@/lib/locale";

/** Shared 404 body used by each locale subtree's not-found boundary. */
export function NotFoundContent({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const ui = uiFor(locale).notFound;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-primary">404</h1>
      <p className="mt-4 text-xl font-semibold text-foreground">
        {ui.title}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {ui.body}
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href={localeHref(locale, "/")}>{ui.home}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={localeHref(locale, "/contact")}>{ui.contact}</Link>
        </Button>
      </div>
    </div>
  );
}
