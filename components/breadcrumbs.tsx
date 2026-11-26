"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BreadcrumbListJsonLd } from "@/components/json-ld";

export function Breadcrumbs({
  diveSites,
  teamMembers,
}: {
  diveSites: { slug: string; label: string }[];
  teamMembers: { slug: string; label: string }[];
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const diveSiteNames = new Map(diveSites.map((site) => [site.slug, site.label]));
  const teamNames = new Map(teamMembers.map((member) => [member.slug, member.label]));

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    // Known dive-site slugs use their real names ("Rays n’ Anchors",
    // "50/50") instead of the slug text ("Rays N Anchors", "50 50").
    const label =
      diveSiteNames.get(segment) ??
      teamNames.get(segment) ??
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
