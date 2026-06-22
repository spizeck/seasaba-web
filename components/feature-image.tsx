import Image from "next/image";

interface FeatureImageProps {
  src: string;
  alt: string;
  objectPosition?: string;
  /** When true the image renders on the right col on desktop */
  imageRight?: boolean;
  children: React.ReactNode;
}

/**
 * FeatureImage — side-by-side 16:9 image + content block.
 * Used for: homepage dive experiences, plan-your-trip cards, dive-site area rows.
 * Image is always 16:9. On mobile it stacks image first, then content.
 */
export function FeatureImage({
  src,
  alt,
  objectPosition = "center",
  imageRight = false,
  children,
}: FeatureImageProps) {
  return (
    <div
      className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
        imageRight ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="overflow-hidden rounded-lg">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className={imageRight ? "lg:order-1" : ""}>{children}</div>
    </div>
  );
}
