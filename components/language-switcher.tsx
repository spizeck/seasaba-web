"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  isRoutePublished,
  LOCALES,
  localizedPath,
  LOCALE_NAMES,
  parsePathname,
  type Locale,
} from "@/lib/locale";

const LOCALE_COOKIE = "sea-saba-locale";

function persistLocaleChoice(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

/**
 * Language switcher (#150). Lists every locale in which the current route has
 * a published translation, as plain crawlable links labelled in each
 * language's own language. Renders nothing while the current route has no
 * published alternates — the switcher must never advertise a translation
 * that does not exist (#151 owns Dutch content; the publication gate lives
 * in lib/locale.ts `PUBLISHED_ROUTES`).
 *
 * Selecting a language is an explicit user action: the choice is persisted
 * in a cookie for future use, but nothing reads that cookie to force a
 * redirect — a stored Dutch preference can never block visiting or sharing
 * an English URL.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale: currentLocale, path } = parsePathname(pathname ?? "/");

  const alternates = LOCALES.filter(
    (l) => l !== currentLocale && isRoutePublished(l, path)
  );
  if (alternates.length === 0) return null;

  const query = searchParams?.toString();
  const suffix = query ? `?${query}` : "";

  return (
    <nav aria-label="Choose language" className={className}>
      <ul className="flex items-center gap-4">
        <li aria-current="true" className="text-foreground">
          {LOCALE_NAMES[currentLocale]}
        </li>
        {alternates.map((locale) => (
          <li key={locale}>
            {/* Full-page navigation across locale subtrees, not a client transition. */}
            <a
              href={`${localizedPath(locale, path)}${suffix}`}
              hrefLang={locale}
              lang={locale}
              onClick={() => persistLocaleChoice(locale)}
              className="transition-colors hover:text-foreground"
            >
              {LOCALE_NAMES[locale]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
