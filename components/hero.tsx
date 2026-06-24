import Link from "next/link";

// A/B test toggle: "A" = Sea Saba red CTA, "B" = white CTA with red text
const HERO_CTA_VARIANT: "A" | "B" = "A";

const TRUST_INDICATORS: { stat: string; label: string; href?: string }[] = [
  { stat: "Since 1985", label: "Established" },
  { stat: "30+ Dive Sites", label: "Protected Waters" },
  { stat: "\u2605\u2605\u2605\u2605\u2605 4.8/5", label: "Google & TripAdvisor", href: "https://share.google/WnkPS93TFHU4rCFl9" },
];

const primaryCTAStyle: React.CSSProperties =
  HERO_CTA_VARIANT === "A"
    ? {
        backgroundColor: "#9D2235",
        color: "#ffffff",
      }
    : {
        backgroundColor: "#ffffff",
        color: "#9D2235",
        fontWeight: 700,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      };

const glassStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "#ffffff",
};

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "44px",
  padding: "0 24px",
  borderRadius: "6px",
  fontSize: "0.9375rem",
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "background 0.2s, box-shadow 0.2s",
  cursor: "pointer",
};

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/optimized/divers-above-reef-saba.webp')" }}
      />

      {/* Uniform contrast overlay — subtle, not dramatic */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} />

      {/* Bottom vignette for trust bar separation */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      <div className="relative z-10 mx-auto max-w-3xl flex-1 flex flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-20 lg:px-8">
        <h1 className="font-heading italic text-3xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
          Dive the Extraordinary.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}>
          Just 5 square miles above.<br className="hidden sm:block" />{" "}
          Some of the Caribbean&apos;s most unique diving below.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
          {/* Primary CTA — A/B tested */}
          <Link href="/book" style={{ ...btnBase, ...primaryCTAStyle }}>
            Book Diving
          </Link>
          {/* Secondary CTAs — glassmorphism */}
          <Link href="/plan-your-trip" style={{ ...btnBase, ...glassStyle }}>
            Plan Your Trip
          </Link>
          <Link href="/dive-sites" style={{ ...btnBase, ...glassStyle }}>
            Explore Dive Sites
          </Link>
        </div>
      </div>

      {/* Trust indicator bar — anchored at bottom of hero */}
      <div className="relative z-10 w-full border-t border-white/20 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {TRUST_INDICATORS.map((item) => {
              const inner = (
                <>
                  <div className="text-sm font-semibold text-white sm:text-base" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    {item.stat}
                  </div>
                  <div className="mt-0.5 text-xs text-white/75 uppercase tracking-wide">
                    {item.href ? (
                      <>
                        <span className="sm:hidden">Reviews</span>
                        <span className="hidden sm:inline">{item.label}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </div>
                </>
              );
              return item.href ? (
                <a
                  key={item.stat}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center transition-opacity hover:opacity-80"
                >
                  {inner}
                </a>
              ) : (
                <div key={item.stat} className="text-center">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
