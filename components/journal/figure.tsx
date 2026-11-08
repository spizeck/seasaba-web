import { InlineImage } from "@/components/inline-image";

interface JournalFigureProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: "4/3" | "16/9" | "1/1";
  objectPosition?: string;
}

/**
 * JournalFigure — a captioned image block for article bodies. Wraps
 * InlineImage (the existing pipeline primitive) in a real <figure> with an
 * optional <figcaption>.
 */
export function JournalFigure({
  src,
  alt,
  caption,
  aspectRatio = "4/3",
  objectPosition = "center",
}: JournalFigureProps) {
  return (
    <figure className="not-prose my-8">
      <InlineImage
        src={src}
        alt={alt}
        aspectRatio={aspectRatio}
        objectPosition={objectPosition}
        sizes="(max-width: 768px) 100vw, 65ch"
      />
      {caption && (
        <figcaption className="mt-2.5 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
