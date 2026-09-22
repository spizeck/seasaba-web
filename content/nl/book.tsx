import { BookingWidget } from "@/components/booking-widget";
import { CheckCircle2, MessageSquare } from "lucide-react";
import type { TranslationReview } from "@/lib/locale";

/**
 * Dutch draft of `app/(en)/book/page.tsx` (#151). Only Sea Saba-owned copy
 * is translated — the Checkfront widget stays English, and the intro text
 * says so explicitly rather than pretending the booking flow is Dutch.
 */
export const review: TranslationReview = {
  status: "draft",
  reviewedBy: null,
  reviewedAt: null,
  source: "app/(en)/book/page.tsx",
  sourceHash: "347e495489a954081a96fc1aebcb8ecccd39f574",
};

export const nlMetadata = {
  title: "Boek je duiken",
  description:
    "Reserveer je duikervaring op Saba. Bekijk de beschikbaarheid en boek duiken, cursussen en pakketten online.",
};

const DISCOUNT_HIGHLIGHTS = [
  "Kortingen worden automatisch toegepast op opeenvolgende Classic- en Advanced 2-Tank-duikdagen",
  "Eén rustdag mag worden ingelast zonder dat de pakketprijs opnieuw begint",
  "Middagduiken kunnen worden toegevoegd om triple-tank-dagen te maken",
  "Afzonderlijke middagduiken krijgen geen korting",
];

export function NlBook({ item }: { item?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Boek je duiken
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Bekijk de beschikbaarheid en reserveer hieronder je duiken, cursussen
        of pakketten. Alle boekingen worden veilig verwerkt via Checkfront —
        het boekingssysteem zelf is in het Engels.
      </p>

      {/* Multi-day discounts section */}
      <section className="mt-8 rounded-lg border border-border/40 bg-muted/20 p-5">
        <h2 className="text-base font-semibold text-foreground">
          Langer blijven. Meer duiken. Meer besparen.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          De meeste gasten duiken meerdere dagen langs Saba&apos;s wereldberoemde
          pinnacles, wanden en riffen. Oplopende meerdaagse kortingen worden
          automatisch toegepast op kwalificerende two-tank-duikpakketten, met
          extra korting op huuruitrusting.
        </p>

        <ul className="mt-3 space-y-1.5">
          {DISCOUNT_HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>

        {/* Custom itinerary callout */}
        <div className="mt-4 rounded border border-border/50 bg-card px-4 py-3">
          <div className="flex items-start gap-2.5">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                 Speciale wensen voor je planning?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Combineer Classic- en Advanced-dagen, voeg een rustdag toe of
                maak triple-tank-dagen. Laat gewoon een notitie achter tijdens
                het boeken of reageer op je bevestigingsmail. Ons team past je
                reservering graag aan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8">
        {/* Checkfront widget stays English — no Dutch flow is configured. */}
        <BookingWidget key={item ?? "all"} item={item} />
      </div>
    </div>
  );
}
