"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DRAFTED_ROUTES,
  isDraftPreviewEnabled,
  isRoutePublished,
  LOCALES,
  localizedPath,
  LOCALE_NAMES,
  parsePathname,
  type Locale,
} from "@/lib/locale";
import { uiFor } from "@/content/ui";

const LOCALE_COOKIE = "sea-saba-locale";

function persistLocaleChoice(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

interface Alternate {
  locale: Locale;
  href: string;
  /** True when the route is drafted but not yet in `PUBLISHED_ROUTES`. */
  draft: boolean;
}

/**
 * Language switcher (#150). Header-borne now (#156): a compact desktop
 * disclosure beside the primary nav/Book Now and a labelled link group
 * inside the mobile hamburger menu. Both list every locale in which the
 * current route has a published translation, labelled in each language's
 * own language, and render nothing while the current route has no eligible
 * alternates — the switcher must never advertise a translation that does
 * not exist (the publication gate lives in lib/locale.ts `PUBLISHED_ROUTES`).
 *
 * In draft preview (development / NEXT_PUBLIC_DRAFT_LOCALE_PREVIEW=1 only)
 * drafted-but-unpublished routes also appear, visibly marked "(draft)", so
 * reviewers can navigate between source and translation. A production
 * build can never reach that branch.
 *
 * Selecting a language is an explicit user action: the choice is persisted
 * in a cookie for future use, but nothing reads that cookie to force a
 * redirect — a stored Dutch preference can never block visiting or sharing
 * an English URL.
 */
function useLanguageAlternates(): { currentLocale: Locale; alternates: Alternate[] } {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale: currentLocale, path } = parsePathname(pathname ?? "/");
  const draftPreview = isDraftPreviewEnabled();

  const query = searchParams?.toString();
  const suffix = query ? `?${query}` : "";

  const alternates = LOCALES.filter(
    (l) =>
      l !== currentLocale &&
      (isRoutePublished(l, path) ||
        (draftPreview && DRAFTED_ROUTES[l].includes(path)))
  ).map((locale) => ({
    locale,
    href: `${localizedPath(locale, path)}${suffix}`,
    draft: !isRoutePublished(locale, path),
  }));

  return { currentLocale, alternates };
}

function AlternateLink({
  alternate,
  className,
  onNavigate,
}: {
  alternate: Alternate;
  className: string;
  onNavigate?: () => void;
}) {
  return (
    // Full-page navigation across locale subtrees, not a client transition.
    <a
      href={alternate.href}
      hrefLang={alternate.locale}
      lang={alternate.locale}
      onClick={() => {
        persistLocaleChoice(alternate.locale);
        onNavigate?.();
      }}
      className={className}
    >
      {LOCALE_NAMES[alternate.locale]}
      {alternate.draft && <span className="text-muted-foreground"> (draft)</span>}
    </a>
  );
}

/**
 * Compact desktop control for the header: a globe-icon disclosure button
 * that reveals the language names. The link list stays mounted (hidden when
 * closed) so alternate links remain crawlable in the served markup.
 * Keyboard: the button toggles on Enter/Space, Escape closes and returns
 * focus to the button, and links are ordinary tab stops.
 */
export function LanguageMenu({ transparent }: { transparent?: boolean }) {
  const { currentLocale, alternates } = useLanguageAlternates();
  const ui = uiFor(currentLocale);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      if (rootRef.current?.contains(document.activeElement)) {
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (alternates.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="header-language-menu"
        aria-label={ui.nav.languageSwitcherLabel}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
          transparent
            ? "text-white/80 hover:text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
      </button>
      <nav
        id="header-language-menu"
        aria-label={ui.nav.languageSwitcherLabel}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border/40 bg-background py-1 shadow-lg"
      >
        <ul>
          <li
            aria-current="true"
            className="px-3 py-2 text-sm font-medium text-foreground"
          >
            {LOCALE_NAMES[currentLocale]}
          </li>
          {alternates.map((alternate) => (
            <li key={alternate.locale}>
              <AlternateLink
                alternate={alternate}
                onNavigate={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current"
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Language links for the mobile hamburger menu: a labelled group rendered
 * below the Book Now CTA, subordinate to the main navigation. Links stay
 * mounted inside the (inert when closed) mobile nav, so they remain
 * crawlable and become ordinary tab stops once the menu opens.
 */
export function LanguageLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { currentLocale, alternates } = useLanguageAlternates();
  const ui = uiFor(currentLocale);
  if (alternates.length === 0) return null;

  return (
    <nav
      aria-label={ui.nav.languageSwitcherLabel}
      className="mt-1 border-t border-border/40 pt-3"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {ui.nav.languageSwitcherLabel}
      </p>
      <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <li aria-current="true" className="text-sm font-medium text-foreground">
          {LOCALE_NAMES[currentLocale]}
        </li>
        {alternates.map((alternate) => (
          <li key={alternate.locale}>
            <AlternateLink
              alternate={alternate}
              onNavigate={onNavigate}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
