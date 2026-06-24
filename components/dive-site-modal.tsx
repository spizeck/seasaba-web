"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { DiveSite } from "@/data/dive-site-videos";

type Props = {
  site: DiveSite;
  allSites: DiveSite[];
  onClose: () => void;
  onNavigate: (site: DiveSite) => void;
};

export function DiveSiteModal({ site, allSites, onClose, onNavigate }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const currentIndex = allSites.findIndex((s) => s.name === site.name);
  const prevSite = currentIndex > 0 ? allSites[currentIndex - 1] : null;
  const nextSite = currentIndex < allSites.length - 1 ? allSites[currentIndex + 1] : null;

  // Focus trap: collect focusable elements inside modal
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" && prevSite) {
        onNavigate(prevSite);
        return;
      }
      if (e.key === "ArrowRight" && nextSite) {
        onNavigate(nextSite);
        return;
      }
      // Focus trap
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
    [onClose, onNavigate, prevSite, nextSite]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    // Focus close button on open
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const embedSrc = site.videoId
    ? `https://www.youtube.com/embed/${site.videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${site.name} dive site`}
    >
      <div
        ref={modalRef}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Video / fallback */}
        <div className="relative aspect-video w-full bg-black">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={site.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
              <svg
                className="h-12 w-12 opacity-30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <p className="text-sm font-medium">Video coming soon</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {site.area}
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">{site.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {site.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <button
              onClick={() => prevSite && onNavigate(prevSite)}
              disabled={!prevSite}
              aria-label={prevSite ? `Previous: ${prevSite.name}` : "No previous site"}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              {prevSite ? (
                <span className="max-w-[120px] truncate">{prevSite.name}</span>
              ) : (
                <span>Previous</span>
              )}
            </button>

            <span className="text-xs text-muted-foreground/60">
              {currentIndex + 1} / {allSites.length}
            </span>

            <button
              onClick={() => nextSite && onNavigate(nextSite)}
              disabled={!nextSite}
              aria-label={nextSite ? `Next: ${nextSite.name}` : "No next site"}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              {nextSite ? (
                <span className="max-w-[120px] truncate">{nextSite.name}</span>
              ) : (
                <span>Next</span>
              )}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
