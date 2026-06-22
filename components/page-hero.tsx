import Image from "next/image";

interface PageHeroProps {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  objectPosition?: string;
}

export function PageHero({
  src,
  alt,
  title,
  subtitle,
  objectPosition = "center",
}: PageHeroProps) {
  return (
    <div className="not-prose relative -mx-4 mb-8 overflow-hidden rounded-lg sm:-mx-6 lg:-mx-8">
      <div className="relative h-56 sm:h-72 lg:h-96">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          style={{ objectPosition }}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-base text-white/90 drop-shadow sm:text-lg max-w-xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
