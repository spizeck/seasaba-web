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

    update();
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--classic-scrollbar-width");
    };
  }, []);

  return null;
}
