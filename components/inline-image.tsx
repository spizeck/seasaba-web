import Image from "next/image";

type AspectRatio = "4/3" | "16/9" | "3/4" | "1/1";

interface InlineImageProps {
  src: string;
  alt: string;
  aspectRatio?: AspectRatio;
  objectPosition?: string;
  sizes?: string;
  className?: string;
}

const ASPECT_CLASSES: Record<AspectRatio, string> = {
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
};

/**
 * InlineImage — a single image block within page content.
 * Used for: about page section images, courses page supporting photos.
 * Consistent border radius, no random shadows.
 */
export function InlineImage({
  src,
  alt,
  aspectRatio = "4/3",
  objectPosition = "center",
  sizes = "(max-width: 1024px) 100vw, 60vw",
  className = "",
}: InlineImageProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${ASPECT_CLASSES[aspectRatio]} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ objectPosition }}
        sizes={sizes}
      />
    </div>
  );
}
