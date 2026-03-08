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
        <h1 className="text-5xl leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl font-heading italic" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          Dive the Sea Saba Difference...
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/95 sm:text-xl" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
          Far from your usual Caribbean Dive shop, we have large uncrowded boats, fantastic guides, and an unmatched service.
        </p>
        <div className="mt-64">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-base font-semibold"
          >
            <Link href="/book">Book Your Dive</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
