"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setCanPlay(true);
    video.addEventListener("canplay", handleCanPlay);
    return () => video.removeEventListener("canplay", handleCanPlay);
  }, []);

  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[#0B0F3B]">
      {/* Video background — hidden on mobile, poster fallback */}
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          canPlay ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/images/heroimage.jpg"
      >
        <source src="/videos/final_cut.mp4" type="video/mp4" />
      </video>

      {/* Poster fallback — shown until video loads or on mobile */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/heroimage.jpg')",
          opacity: canPlay ? 0 : 1,
          transition: "opacity 700ms",
        }}
      />

      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl drop-shadow-lg">
          See it for yourself
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/85 drop-shadow">
          Crystal-clear water. Pristine reefs. Unforgettable encounters.
        </p>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-base font-semibold"
          >
            <Link href="/diving">Explore Dive Sites</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
