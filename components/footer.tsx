import Link from "next/link";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/seasaba" },
  { label: "Facebook", href: "https://facebook.com/seasaba" },
  { label: "TripAdvisor", href: "https://www.tripadvisor.com/Attraction_Review-g147353-d530986-Reviews-Sea_Saba-Saba_Caribbean_Netherlands.html" },
  { label: "Google Reviews", href: "https://g.page/r/CeZ2Xx3h3OIOEAE/review" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-base font-semibold text-foreground">Sea Saba Dive Center</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Professional scuba diving in Saba since 1985.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Small groups, experienced local guides, and access to one of the
              Caribbean&apos;s most unique marine parks.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Discover why divers return to Saba year after year.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Explore
            </p>
            <nav className="mt-4 flex flex-col gap-3">
              <Link href="/plan-your-trip" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Plan Your Trip
              </Link>
              <Link href="/dive-sites" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Dive Sites
              </Link>
              <Link href="/courses" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Courses
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Contact
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <p>66 Fort Bay Harbor</p>
              <p>The Bottom, Saba</p>
              <p>Caribbean Netherlands</p>
              <a
                href="tel:+5994162246"
                className="mt-2 transition-colors hover:text-foreground"
              >
                Phone: +599 416 2246
              </a>
              <a
                href="https://wa.me/5994162246"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                WhatsApp: +599 416 2246
              </a>
              <a
                href="mailto:info@seasaba.com"
                className="transition-colors hover:text-foreground"
              >
                info@seasaba.com
              </a>
            </div>

            {/* Google Reviews rating */}
            <div className="mt-5">
              <p className="text-sm text-muted-foreground">
                <span className="text-amber-500" aria-hidden="true">★★★★★</span>{" "}
                Rated 4.9/5 on Google
              </p>
              <a
                href="https://g.page/r/CeZ2Xx3h3OIOEAE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Read Reviews →
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/30 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground/60 text-center sm:text-left">
              &copy; 1985&ndash;2026 Sea Saba Dive Center &bull; The Bottom, Saba, Caribbean Netherlands
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
