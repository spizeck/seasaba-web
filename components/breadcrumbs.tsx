"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BreadcrumbListJsonLd } from "@/components/structured-data";
import { DIVE_SITE_BY_SLUG } from "@/data/dive-site-videos";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    // Known dive-site slugs use their real names ("Rays n’ Anchors",
    // "50/50") instead of the slug text ("Rays N Anchors", "50 50").
    const label =
      DIVE_SITE_BY_SLUG[segment]?.name ??
      segment
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
          <Link href="/" className="rounded-sm transition-colors hover:text-foreground focus-ring">
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
