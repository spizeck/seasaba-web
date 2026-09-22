"use client";

import { Suspense } from "react";
import Link from "next/link";
import { CONTACT, SOCIAL_LINKS } from "@/lib/constants";
import { planYourTripAnchors } from "@/lib/anchors";
import { OPERATIONS } from "@/data/operations";
import { trackLinkClick } from "@/lib/analytics";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { uiFor } from "@/content/ui";
import type { UiDictionary } from "@/content/en/ui";
import { DEFAULT_LOCALE, localeHref, type Locale } from "@/lib/locale";

type ResourceKey = keyof UiDictionary["footer"]["resourceLinks"];

const PLAN_LINKS = [
  { key: "whereToStay", href: `/plan-your-trip#${planYourTripAnchors.whereToStay}` },
  { key: "gettingHere", href: `/plan-your-trip#${planYourTripAnchors.gettingHere}` },
  { key: "whenToVisit", href: `/plan-your-trip#${planYourTripAnchors.whenToVisit}` },
  { key: "whatToBring", href: `/plan-your-trip#${planYourTripAnchors.whatToBring}` },
  { key: "goodToKnow",  href: `/plan-your-trip#${planYourTripAnchors.goodToKnow}` },
  { key: "partners",    href: "/partners" },
] as const;

const EXPLORE_LINKS = [
  { key: "diveSites", href: "/dive-sites" },
  { key: "diving",    href: "/diving" },
  { key: "diveLog",   href: "/dive-log" },
  { key: "courses",   href: "/courses" },
  { key: "about",     href: "/about" },
  { key: "contact",   href: "/contact" },
] as const;

const RESOURCE_LINKS: { key: ResourceKey; href: string; external?: boolean; keepEnglish?: boolean; ariaKey?: ResourceKey }[] = [
  {
    key: "travelInsurance",
    href: "https://app.diveassure.com/#/registration/main/process/0/int/0/8807/en",
    external: true,
    ariaKey: "travelInsuranceAria",
  },
  {
    key: "diveInsurance",
    href: "https://apps.dan.org/short-term/?token=~d243r01E0g0h0lydq0460v1e2J2h12Qf1o15t2d68r112g1706A7499s1763",
    external: true,
    ariaKey: "diveInsuranceAria",
  },
  { key: "faq",          href: `/plan-your-trip#${planYourTripAnchors.faq}` },
  // Legal pages are English-only (#151) — keepEnglish pins them unprefixed.
  { key: "terms",        href: "/terms", keepEnglish: true },
  { key: "privacy",      href: "/privacy", keepEnglish: true },
  { key: "cookiePolicy", href: "/cookie-policy", keepEnglish: true },
];

const linkCls = "text-sm text-muted-foreground transition-colors hover:text-foreground";
const headingCls = "text-xs font-semibold uppercase tracking-widest text-foreground";

export function Footer({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const ui = uiFor(locale);
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      {/* pb clears the fixed launchers' clipped hit region (~80px) plus safe-area */}
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Plan Your Trip */}
          <div>
            <p className={headingCls}>{ui.footer.headings.plan}</p>
            <nav aria-label={ui.footer.navLabels.tripPlanning} className="mt-4 flex flex-col gap-3">
              {PLAN_LINKS.map((l) => (
                <Link key={l.key} href={localeHref(locale, l.href)} className={linkCls}>
                  {ui.footer.planLinks[l.key]}
                </Link>
              ))}
            </nav>
          </div>

          {/* Explore */}
          <div>
            <p className={headingCls}>{ui.footer.headings.explore}</p>
            <nav aria-label={ui.footer.navLabels.siteNav} className="mt-4 flex flex-col gap-3">
              {EXPLORE_LINKS.map((l) => (
                <Link key={l.key} href={localeHref(locale, l.href)} className={linkCls}>
                  {ui.footer.exploreLinks[l.key]}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className={headingCls}>{ui.footer.headings.contact}</p>
            <address className="mt-4 flex flex-col gap-2 not-italic text-sm text-muted-foreground">
              {CONTACT.address.displayLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <a
                href={CONTACT.phoneHref}
                onClick={() => trackLinkClick("phone_click", CONTACT.phoneHref, "Phone")}
                className="mt-2 transition-colors hover:text-foreground"
              >
                {ui.footer.phone}: {CONTACT.phone}
              </a>
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLinkClick("whatsapp_click", CONTACT.whatsappHref, "WhatsApp")}
                aria-label={ui.footer.whatsappAria}
                className="transition-colors hover:text-foreground"
              >
                WhatsApp: {CONTACT.whatsapp}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                onClick={() => trackLinkClick("email_click", `mailto:${CONTACT.email}`, "Email")}
                className="transition-colors hover:text-foreground"
              >
                {CONTACT.email}
              </a>
            </address>
          </div>

          {/* Resources */}
          <div>
            <p className={headingCls}>{ui.footer.headings.resources}</p>
            <nav aria-label={ui.footer.navLabels.resources} className="mt-4 flex flex-col gap-3">
              {RESOURCE_LINKS.map((l) =>
                l.external ? (
                  <a
                    key={l.key}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackLinkClick("social_click", l.href, ui.footer.resourceLinks[l.key])}
                    aria-label={l.ariaKey ? ui.footer.resourceLinks[l.ariaKey] : undefined}
                    className={linkCls}
                  >
                    {ui.footer.resourceLinks[l.key]}
                  </a>
                ) : (
                  <Link key={l.key} href={l.keepEnglish ? l.href : localeHref(locale, l.href)} className={linkCls}>
                    {ui.footer.resourceLinks[l.key]}
                  </Link>
                )
              )}
            </nav>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/30 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              &copy; {OPERATIONS.establishedYear}&ndash;2026 {ui.footer.copyrightSuffix}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:justify-end">
              {/* Renders only when the current route has a published translation */}
              <Suspense fallback={null}>
                <LanguageSwitcher className="text-xs text-muted-foreground" />
              </Suspense>
              <CookieSettingsButton label={ui.footer.cookieSettings} className="text-xs text-muted-foreground transition-colors hover:text-foreground" />
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLinkClick("social_click", link.href, link.label)}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={link.label}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
