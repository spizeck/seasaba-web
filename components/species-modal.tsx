"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import type { SpeciesInfo } from "@/data/species";

type Props = {
  species: SpeciesInfo;
  onClose: () => void;
};

export function SpeciesModal({ species, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${species.name} species information`}
    >
      <div
        ref={modalRef}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-card shadow-2xl"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-4 p-5">
          <div>
            {species.scientificName && (
              <p className="text-xs font-medium italic text-muted-foreground">{species.scientificName}</p>
            )}
            <h2 className="mt-0.5 text-xl font-bold text-foreground">{species.name}</h2>
            {species.commonName && species.commonName !== species.name && (
              <p className="text-sm text-muted-foreground">Also known as: {species.commonName}</p>
            )}
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Description:</span> {species.description}
            </p>
            <p>
              <span className="font-semibold text-foreground">Habitat:</span> {species.habitat}
            </p>
            {species.funFact && (
              <p>
                <span className="font-semibold text-foreground">Did you know?</span> {species.funFact}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
