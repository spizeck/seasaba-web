"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BreadcrumbListJsonLd } from "@/components/structured-data";
import { DEFAULT_LOCALE, localizedPath, parsePathname, type Locale } from "@/lib/locale";

export function Breadcrumbs({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const pathname = usePathname();
  const { path } = parsePathname(pathname ?? "/");
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const home = localizedPath(locale, "/");
  const crumbs = segments.map((segment, index) => {
    const href = localizedPath(locale, "/" + segments.slice(0, index + 1).join("/"));
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          ...crumbs.map((c) => ({ name: c.label, path: c.href })),
        ]}
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link href={home} className="rounded-sm transition-colors hover:text-foreground focus-ring">
            Home
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {crumb.isLast ? (
              <span className="text-foreground" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="rounded-sm transition-colors hover:text-foreground focus-ring">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      </nav>
    </>
  );
}
