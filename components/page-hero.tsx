import Image from "next/image";
import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  objectPosition?: string;
  breadcrumbs?: Crumb[];
  /** Optional absolutely-positioned overlay content rendered inside the image container */
  overlay?: React.ReactNode;
}

/**
 * PageHero — interior page hero per sea-saba-image-standard.md §3.2.
 * Sizing: aspect-ratio 4/3 mobile (min 320px, max 480px)
 *         aspect-ratio 2.4/1 desktop (min 420px, max 640px).
 * Uses CSS aspect-ratio — not vh — to prevent mobile CLS.
 * Optional breadcrumb pill overlaid top-left inside the hero.
 * Radius: rounded-none mobile · lg:rounded-3xl desktop.
 */
export function PageHero({
  src,
  alt,
  title,
  subtitle,
  objectPosition = "center",
  breadcrumbs,
  overlay,
}: PageHeroProps) {
  return (
    <div
      className="not-prose relative mb-8 overflow-hidden rounded-none lg:rounded-3xl"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", maxHeight: "640px" }}
    >
      {/* aspect-ratio shell: 4/3 mobile → 2.4/1 lg. No max-h here — outer clips it. */}
      <div className="relative aspect-[4/3] min-h-[320px] lg:aspect-[2.4/1] lg:min-h-[420px]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          style={{ objectPosition }}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/10" />

        {/* Optional overlay slot (e.g. location pin) */}
        {overlay}

        {/* Breadcrumb pill — top-left, inside hero */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-sm"
            style={{ background: "rgba(11,15,59,0.45)" }}
          >
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="opacity-50">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-white">{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title / subtitle overlay — vertically centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mt-3 max-w-xl text-base text-white/90 drop-shadow sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
