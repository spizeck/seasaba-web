import Link from "next/link";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-lg font-semibold text-foreground">{SITE_NAME}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Professional scuba diving in Saba, Dutch Caribbean.
              Expert-guided dives and certifications.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </p>
            <nav className="mt-3 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Saba, Dutch Caribbean</p>
              <a
                href="mailto:info@seasaba.com"
                className="transition-colors hover:text-foreground"
              >
                info@seasaba.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          &copy; {currentYear} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
