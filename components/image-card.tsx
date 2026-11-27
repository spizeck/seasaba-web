import Image from "next/image";

interface ImageCardProps {
  src: string;
  alt: string;
  heading: string;
  body: string;
  objectPosition?: string;
  priority?: boolean;
  /** Visible caption rendered as an overlay figcaption — for images
   *  where verified location/photographer context adds real value. */
  caption?: string;
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
  priority = false,
  caption,
}: ImageCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background">
      <figure className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          style={{ objectPosition }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        {caption && (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-2 pt-8 text-left text-xs leading-snug text-white/90">
            {caption}
          </figcaption>
        )}
      </figure>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-foreground">{heading}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
