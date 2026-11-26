"use client";

import { useEffect } from "react";

/**
 * Publishes the classic vertical scrollbar width as a CSS variable.
 *
 * `window.innerWidth` includes a classic scrollbar while
 * `documentElement.clientWidth` is the usable layout width. Overlay
 * scrollbars measure zero, so this stays inert on macOS/mobile.
 */
export function ViewportScrollbarWidth() {
  useEffect(() => {
    const update = () => {
      const width = Math.max(
        0,
        window.innerWidth - document.documentElement.clientWidth
      );
      document.documentElement.style.setProperty(
        "--classic-scrollbar-width",
        `${width}px`
      );
    };

    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      document.documentElement.style.removeProperty("--classic-scrollbar-width");
    };
  }, []);

  return null;
}
