"use client";

declare global {
  interface Window {
    Cookiebot?: {
      renew: () => void;
      show: () => void;
    };
  }
}

function openCookieSettings() {
  if (typeof window === "undefined" || !window.Cookiebot) return;
  window.Cookiebot.renew();
}

interface CookieSettingsButtonProps {
  className?: string;
}

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={
        className ??
        "inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      }
    >
      Cookie Settings
    </button>
  );
}
