import Image from "next/image";
import { createMetadata } from "@/lib/metadata";
import { IMAGE_ATTRIBUTIONS, type ImageAttribution } from "@/data/image-attribution";

export const metadata = createMetadata({
  title: "Homepage Photography Credits",
  description: "Verified attribution records for selected photography used on the Sea Saba homepage.",
  path: "/photography-credits",
});

export default function PhotographyCreditsPage() {
  const images = Object.values(IMAGE_ATTRIBUTIONS) as ImageAttribution[];

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Homepage Photography Credits
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
        Verified attribution records for selected homepage photography. Dates, locations, and source links are shown only where verified. This is not a complete inventory of every photograph used on the homepage or elsewhere on the website.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <figure key={image.imageUrl} className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <figcaption className="space-y-1 p-4 text-sm">
              <p className="font-medium text-foreground">{image.description}</p>
              {image.photographer && (
                <p className="text-muted-foreground">Photographer: {image.photographer}</p>
              )}
              {image.dateTaken && (
                <p className="text-muted-foreground">Date: {image.dateTaken}</p>
              )}
              {image.location && (
                <p className="text-muted-foreground">Location: {image.location}</p>
              )}
              {image.sourceUrl && (
                <p>
                  <a
                    href={image.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline underline-offset-4"
                  >
                    View source photograph
                  </a>
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
