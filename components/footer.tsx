import Link from "next/link";
import { NAV_ITEMS, SITE_NAME, BOOKING_URL } from "@/lib/constants";
import { MapPin, Mail, Anchor } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Anchor className="h-6 w-6 text-primary" />
              <p className="text-xl font-semibold text-foreground">{SITE_NAME}</p>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Professional scuba diving in Saba since 1985. Small guided groups, 
              experienced local professionals, and the Caribbean&apos;s most pristine 
              marine park.
            </p>
            <p className="mt-4 text-sm font-medium text-foreground">
              Professional diving in Saba since 1985
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </p>
            <nav className="mt-4 flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/book"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Book Diving →
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>Fort Bay Harbor<br />Saba, Dutch Caribbean</span>
              </div>
              <a
                href="mailto:info@seasaba.com"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4 text-primary" />
                info@seasaba.com
              </a>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
              >
                <span className="font-medium">Book Online</span>
              </a>
            </div>

            {/* Social Placeholders */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Follow Sea Saba
              </p>
              <div className="mt-3 flex gap-4">
                <a
                  href="https://facebook.com/seasaba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com/seasaba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} {SITE_NAME}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Saba Marine Park • Professional Diving Since 1985
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
