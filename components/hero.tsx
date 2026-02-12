import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: "url('/images/DSC03031.jpg')" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg font-heading italic">
          Dive the Sea Saba Difference...
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl drop-shadow">
          Far from your usual Caribbean Dive shop, we have large uncrowded boats, fantastic guides, and an unmatched service.
        </p>
        <div className="mt-64 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
            className="bg-white/90 text-primary hover:bg-white text-base font-semibold"
          >
            <Link href="/diving">Explore Dive Sites</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
