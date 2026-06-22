import Image from "next/image";

interface ImageCardProps {
  src: string;
  alt: string;
  heading: string;
  body: string;
  objectPosition?: string;
}

/**
 * ImageCard — unified photo-topped card. Image and text are one object.
 * Used for: homepage WHY_SABA_FEATURED cards, any equal-height card grid.
 * Radius: rounded-2xl. No shadows.
 */
export function ImageCard({
  src,
  alt,
  heading,
  body,
  objectPosition = "center",
}: ImageCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-foreground">{heading}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
