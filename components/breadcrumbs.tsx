"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BreadcrumbListJsonLd } from "@/components/structured-data";

interface Crumb {
  label: string;
  /** Every crumb carries its URL so the BreadcrumbList JSON-LD stays complete — the last crumb is the current page and renders as text, not a link. */
  href: string;
}

export function Breadcrumbs({ items }: { items?: Crumb[] }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] =
    items ??
    segments.map((segment, index) => ({
      href: "/" + segments.slice(0, index + 1).join("/"),
      label: segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    }));

  if (crumbs.length === 0) return null;

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
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {index === crumbs.length - 1 ? (
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
