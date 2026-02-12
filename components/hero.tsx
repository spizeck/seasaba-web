import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/heroimage.jpg')" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
          Dive Saba
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl drop-shadow">
          Experience world-class diving on one of the Caribbean&apos;s
          best-kept secrets. Professional guides, pristine reefs, and
          unforgettable underwater encounters.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-base font-semibold"
          >
            <Link href="/book">Book Your Dive</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary text-base"
          >
            <Link href="/diving">Explore Dive Sites</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
