import {
  SUPPORT_REQUEST_CATEGORIES,
  SUPPORT_TYPES,
  WHO_CAN_REQUEST,
  SUPPORT_STANDARDS,
  SUPPORT_REQUEST_STEPS,
  SUPPORT_REQUEST_NO_GUARANTEE,
} from "@/data/community-support";
import { SupportRequestForm } from "./support-request-form";

/**
 * The request side of /donate (#171): who may ask Sea Saba for support, what
 * kinds of help are possible, the ground rules, the process, and the request
 * form. All policy content renders from data/community-support.ts — edit the
 * wording there, not here. DRAFT copy pending owner review.
 */
export function CommunitySupportSection() {
  return (
    <section className="mt-14" aria-labelledby="request-support">
      <h2 id="request-support" className="text-xl font-semibold text-foreground">
        Request Support from Sea Saba
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Sea Saba has been part of this island since 1985, and giving back is part
        of how we operate: a raffle prize for a school fundraiser, air fills for
        a beach cleanup, sponsorship for a youth team. If you&apos;re working on
        something worthwhile on Saba, we&apos;d like to hear about it.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We&apos;re a small local business, so we keep a few clear ground rules,
        not to make asking harder, but so we can keep saying yes to good
        projects and know our support lands where it&apos;s meant to.
      </p>

      {/* Who can ask */}
      <h3 className="mt-8 text-base font-semibold text-foreground">Who can ask</h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
        {WHO_CAN_REQUEST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">
        Requests we see most often fall into a few areas (
        {SUPPORT_REQUEST_CATEGORIES.map((c) => c.label).join(", ").replace(/, ([^,]*)$/, " or $1")}
        ), but anything that benefits the island is worth asking about.
      </p>

      {/* What support can look like */}
      <h3 className="mt-8 text-base font-semibold text-foreground">
        What support can look like
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        It doesn&apos;t have to be money. Depending on the request, Sea Saba can help with:
      </p>
      <ul role="list" className="mt-3 grid list-none gap-3 pl-0 sm:grid-cols-2">
        {SUPPORT_TYPES.map((type) => (
          <li
            key={type.value}
            className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">{type.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {type.description}
            </p>
          </li>
        ))}
      </ul>

      {/* Ground rules */}
      <h3 className="mt-8 text-base font-semibold text-foreground">
        A few ground rules
      </h3>
      <ul role="list" className="mt-3 grid list-none gap-3 pl-0 sm:grid-cols-2">
        {SUPPORT_STANDARDS.map((standard) => (
          <li
            key={standard.title}
            className="rounded-lg border border-border/50 px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">{standard.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {standard.description}
            </p>
          </li>
        ))}
      </ul>

      {/* How it works */}
      <h3 className="mt-8 text-base font-semibold text-foreground">How it works</h3>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
        {SUPPORT_REQUEST_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {SUPPORT_REQUEST_NO_GUARANTEE}
      </p>

      {/* The form */}
      <h3 className="mt-8 text-base font-semibold text-foreground">Send a request</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This gives us what we need to evaluate your request fairly. It&apos;s
        not a grant application. Short, honest answers are perfect.
      </p>
      <div className="mt-4 rounded-lg border border-border/60 bg-card p-6">
        <SupportRequestForm />
      </div>
    </section>
  );
}
