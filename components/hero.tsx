import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Background image - Current: DSC03031.jpg (left-aligned for subject on left) */}
      {/*
      <div
        className="absolute inset-0 bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: "url('/images/DSC03031.jpg')" }}
      />
      */}

      {/* Background image - Alternative: heroimage.jpg (centered) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/heroimage.jpg')" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-5xl leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl font-heading italic" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          One of the Caribbean&apos;s great dive destinations.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/95 sm:text-xl" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
          Saba&apos;s underwater world is extraordinary. Sea Saba has been guiding divers here for decades.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-base font-semibold"
          >
            <Link href="/dive-sites">Explore Dive Sites</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/60 bg-transparent text-white hover:bg-white/10 text-base font-semibold"
          >
            <Link href="/plan-your-trip">Plan Your Trip</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
