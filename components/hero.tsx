import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-primary">
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/80 via-primary/60 to-primary/90" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
          Dive Saba
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85 sm:text-xl">
          Experience world-class diving on one of the Caribbean&apos;s
          best-kept secrets. Professional guides, pristine reefs, and
          unforgettable underwater encounters.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-base font-semibold"
          >
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              Book Your Dive
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base"
          >
            <a href="/diving">Explore Dive Sites</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
