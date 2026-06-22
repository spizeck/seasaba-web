import Image from "next/image";

interface PageHeroProps {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  objectPosition?: string;
}

/**
 * PageHero — full-width hero image with title/subtitle overlay.
 * Sits immediately below breadcrumbs with no gap or gray band.
 * Heights: mobile 14rem · tablet 20rem · desktop 28rem
 */
export function PageHero({
  src,
  alt,
  title,
  subtitle,
  objectPosition = "center",
}: PageHeroProps) {
  return (
    <div className="not-prose relative -mx-4 mb-8 overflow-hidden rounded-lg sm:-mx-6 lg:-mx-8">
      <div className="relative h-56 sm:h-80 lg:h-[28rem]">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
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
