import Link from "next/link";
import { Button } from "@/components/ui/button";

const TRUST_INDICATORS = [
  { stat: "Since 1985", label: "Established" },
  { stat: "8:1", label: "Max Diver–Guide Ratio" },
  { stat: "43+", label: "Dive Sites" },
  { stat: "10–25 min", label: "Boat Rides" },
] as const;

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden -mt-16 pt-16">
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

      {/* Subtle gradient behind text for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      <div className="relative z-10 mx-auto max-w-3xl flex-1 flex flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
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
            <Link href="/book">Book Diving</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/60 bg-transparent text-white hover:bg-white/10 text-base font-semibold"
          >
            <Link href="/plan-your-trip">Plan Your Trip</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/60 bg-transparent text-white hover:bg-white/10 text-base font-semibold"
          >
            <Link href="/dive-sites">Explore Dive Sites</Link>
          </Button>
        </div>
      </div>

      {/* Trust indicator bar — anchored at bottom of hero */}
      <div className="relative z-10 w-full border-t border-white/20 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST_INDICATORS.map((item) => (
              <div key={item.stat} className="text-center">
                <div className="text-xl font-semibold text-white sm:text-2xl" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                  {item.stat}
                </div>
                <div className="mt-0.5 text-xs text-white/75 uppercase tracking-wide">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
