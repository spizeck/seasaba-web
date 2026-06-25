import Link from "next/link";
import { CONTACT, SOCIAL_LINKS } from "@/lib/constants";

const PLAN_LINKS = [
  { label: "Where to Stay",  href: "/plan-your-trip#where-to-stay" },
  { label: "Getting Here",   href: "/plan-your-trip#getting-here" },
  { label: "When to Visit",  href: "/plan-your-trip#when-to-visit" },
  { label: "What to Bring",  href: "/plan-your-trip#what-to-bring" },
  { label: "Good to Know",   href: "/plan-your-trip#good-to-know" },
] as const;

const EXPLORE_LINKS = [
  { label: "Dive Sites",  href: "/dive-sites" },
  { label: "Diving",      href: "/diving" },
  { label: "Courses",     href: "/courses" },
  { label: "About",       href: "/about" },
  { label: "Contact",     href: "/contact" },
] as const;

const RESOURCE_LINKS: { label: string; href: string; external?: boolean; ariaLabel?: string }[] = [
  {
    label: "Travel Insurance",
    href: "https://app.diveassure.com/#/registration/main/process/0/int/0/8807/en",
    external: true,
    ariaLabel: "Get travel insurance through DiveAssure, opens in a new tab",
  },
  {
    label: "Dive Accident Insurance",
    href: "https://apps.dan.org/short-term/?token=~d243r01E0g0h0lydq0460v1e2J2h12Qf1o15t2d68r112g1706A7499s1763",
    external: true,
    ariaLabel: "Get short-term dive accident insurance through DAN, opens in a new tab",
  },
  { label: "FAQ",                href: "/plan-your-trip#faq" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy",     href: "/privacy" },
];

const linkCls = "text-sm text-muted-foreground transition-colors hover:text-foreground";
const headingCls = "text-xs font-semibold uppercase tracking-widest text-foreground";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Plan Your Trip */}
          <div>
            <p className={headingCls}>Plan Your Trip</p>
            <nav aria-label="Trip planning links" className="mt-4 flex flex-col gap-3">
              {PLAN_LINKS.map((l) => (
                <Link key={l.label} href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Explore */}
          <div>
            <p className={headingCls}>Explore</p>
            <nav aria-label="Site navigation" className="mt-4 flex flex-col gap-3">
              {EXPLORE_LINKS.map((l) => (
                <Link key={l.label} href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className={headingCls}>Contact</p>
            <address className="mt-4 flex flex-col gap-2 not-italic text-sm text-muted-foreground">
              {CONTACT.address.displayLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <a href={CONTACT.phoneHref} className="mt-2 transition-colors hover:text-foreground">
                Phone: {CONTACT.phone}
              </a>
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Sea Saba on WhatsApp, opens in a new tab"
                className="transition-colors hover:text-foreground"
              >
                WhatsApp: {CONTACT.whatsapp}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-foreground">
                {CONTACT.email}
              </a>
            </address>
          </div>

          {/* Resources */}
          <div>
            <p className={headingCls}>Resources</p>
            <nav aria-label="Travel resources" className="mt-4 flex flex-col gap-3">
              {RESOURCE_LINKS.map((l) =>
                l.external ? (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={l.ariaLabel}
                    className={linkCls}
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.label} href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                )
              )}
            </nav>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/30 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground/60 text-center sm:text-left">
              &copy; 1985&ndash;2026 Sea Saba, NV &bull; The Bottom, Saba, Caribbean Netherlands
            </p>
            <div className="flex flex-wrap justify-center gap-5 sm:justify-end">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
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
