"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ExternalLink, MapPin, Clock, UtensilsCrossed, Waves, DollarSign, Star } from "lucide-react";

export interface Hotel {
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  website: string;
  village: string;
  minutesFromSeaSaba: number;
  restaurant: boolean;
  pool: boolean;
  priceCategory: "$" | "$$" | "$$$";
  bestFor: string;
}

interface HotelModalProps {
  hotel: Hotel;
  onClose: () => void;
}

export function HotelModal({ hotel, onClose }: HotelModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus close button on open
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // ESC to close + focus trap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const priceFull = { "$": "$", "$$": "$$", "$$$": "$$$" }[hotel.priceCategory];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={hotel.name}
    >
      <div
        ref={modalRef}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        style={{ animation: "hotelModalIn 0.18s ease-out both" }}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close hotel details"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 16:9 hero image */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden">
          <Image
            src={hotel.image}
            alt={hotel.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">{hotel.name}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{hotel.description}</p>

          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-lg border border-border/40 bg-muted/20 p-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{hotel.village}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{hotel.minutesFromSeaSaba} min from Sea Saba</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UtensilsCrossed className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{hotel.restaurant ? "Restaurant on site" : "No restaurant"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Waves className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{hotel.pool ? "Pool" : "No pool"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{priceFull} &mdash; Price range</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{hotel.bestFor}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href={hotel.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Visit Hotel Website
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hotelModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
