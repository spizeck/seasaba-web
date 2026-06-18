import Link from "next/link";
import { Button } from "@/components/ui/button";

const TRUST_INDICATORS = [
  { stat: "Since 1985", label: "Established" },
  { stat: "30+", label: "Dive Sites" },
  { stat: "Marine Park", label: "Since 1987" },
] as const;

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/optimized/divers-above-reef-saba.webp')" }}
      />

      {/* Subtle gradient behind text for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      <div className="relative z-10 mx-auto max-w-3xl flex-1 flex flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-20 lg:px-8">
        <h1 className="font-heading italic text-3xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
          Dive the Extraordinary.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}>
          Just 5 square miles above.<br className="hidden sm:block" />{" "}
          Some of the Caribbean&apos;s most unique diving below.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
          <Button
            asChild
            size="lg"
            className="bg-[#9D2235] text-white hover:bg-[#8a1e2e] text-base font-semibold"
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
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {TRUST_INDICATORS.map((item) => (
              <div key={item.stat} className="text-center">
                <div className="text-base font-semibold text-white sm:text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
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
