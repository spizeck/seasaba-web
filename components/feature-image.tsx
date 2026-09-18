import Image from "next/image";

interface FeatureImageProps {
  src: string;
  alt: string;
  objectPosition?: string;
  /** When true the image renders on the right col on desktop */
  imageRight?: boolean;
  /** When true the text column gets a wider 2/5 share instead of the default 1/3 */
  balanced?: boolean;
  /** When true the text column is vertically centered (use for short text blocks) */
  centerText?: boolean;
  /** When true, text is stacked above the image on mobile instead of below it. */
  mobileTextFirst?: boolean;
  /** Optional section anchor id */
  id?: string;
  children: React.ReactNode;
}

/**
 * FeatureImage (MediaRow) — alternating image + text per docs/design/IMAGE_STANDARD.md §3.3.
 * Desktop: 2fr image / 1fr text, 56px gap, items centered.
 * Image: aspect-ratio 4/3, object-fit cover, rounded-2xl.
 * Mobile: single column, image full-width first, text below.
 */
export function FeatureImage({
  src,
  alt,
  objectPosition = "center",
  imageRight = false,
  balanced = false,
  centerText = false,
  mobileTextFirst = false,
  id,
  children,
}: FeatureImageProps) {
  const columns = imageRight
    ? balanced
      ? "lg:grid-cols-[2fr_3fr]"
      : "lg:grid-cols-[1fr_2fr]"
    : balanced
      ? "lg:grid-cols-[3fr_2fr]"
      : "lg:grid-cols-[2fr_1fr]";
  return (
    <div
      id={id}
      className={`not-prose grid gap-6 lg:items-stretch lg:gap-14 ${columns}`}
    >
      <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-lg lg:aspect-auto lg:h-full lg:min-h-[280px] ${
        imageRight
          ? mobileTextFirst
            ? "order-2 lg:order-2"
            : "lg:order-2"
          : mobileTextFirst
            ? "order-2"
            : ""
      }`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          style={{ objectPosition }}
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      </div>
      <div className={`${
        imageRight
          ? mobileTextFirst
            ? "order-1 lg:order-1"
            : "lg:order-1"
          : mobileTextFirst
            ? "order-1"
            : ""
      } ${centerText ? "lg:flex lg:flex-col lg:justify-center" : ""}`}>{children}</div>
    </div>
  );
}
