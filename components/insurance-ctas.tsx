const DIVE_ASSURE_URL =
  "https://app.diveassure.com/#/registration/main/process/0/int/0/8807/en";

const DAN_SHORT_TERM_URL =
  "https://apps.dan.org/short-term/?token=~d243r01E0g0h0lydq0460v1e2J2h12Qf1o15t2d68r112g1706A7499s1763";

const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const btnOutline =
  "inline-flex items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

interface InsuranceCTAsProps {
  /** Show the general travel insurance CTA (DiveAssure) */
  travel?: boolean;
  /** Show the short-term dive accident insurance CTA (DAN) */
  shortTerm?: boolean;
  /** Render both as equal-weight outline buttons instead of primary+outline */
  equalWeight?: boolean;
}

/**
 * Reusable insurance CTA block.
 * Default: travel=true, shortTerm=true.
 * Desktop: side-by-side. Mobile: stacked.
 */
export function InsuranceCTAs({
  travel = true,
  shortTerm = true,
  equalWeight = false,
}: InsuranceCTAsProps) {
  if (!travel && !shortTerm) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {travel && (
        <a
          href={DIVE_ASSURE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get travel insurance through DiveAssure, opens in a new tab"
          className={
            equalWeight
              ? `${btnOutline} border-primary/50 text-primary focus-visible:outline-primary`
              : `${btnPrimary} focus-visible:outline-primary`
          }
          style={!equalWeight ? { backgroundColor: "#9D2235" } : undefined}
        >
          Get Travel Insurance
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
      {shortTerm && (
        <a
          href={DAN_SHORT_TERM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get short-term dive accident insurance through DAN, opens in a new tab"
          className={`${btnOutline} border-border/60 text-foreground hover:border-primary/40 hover:text-primary focus-visible:outline-primary`}
        >
          Get Short-Term Dive Insurance
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
    </div>
  );
}
