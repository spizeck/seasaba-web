import { Star } from "lucide-react";

const REVIEWS = [
  {
    text: "Best diving operation in the Caribbean. Professional crew, pristine sites, and they genuinely care about the marine environment.",
    author: "Sarah M.",
    source: "TripAdvisor",
    rating: 5,
  },
  {
    text: "Third Encounter was absolutely incredible. The guides knew exactly where to take us and the boat was spacious and comfortable.",
    author: "Michael R.",
    source: "Google",
    rating: 5,
  },
  {
    text: "Small groups, personal attention, and decades of experience. This is how diving should be done.",
    author: "Jennifer K.",
    source: "TripAdvisor",
    rating: 5,
  },
] as const;

export function ReviewsSection() {
  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-current" />
            ))}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Rated 5 Stars
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Based on hundreds of reviews on TripAdvisor and Google
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <div
              key={index}
              className="rounded-lg border border-border/60 bg-background p-6"
            >
              <div className="flex items-center gap-1 text-primary">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {review.author}
                </p>
                <p className="text-xs text-muted-foreground">{review.source}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://www.tripadvisor.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Read all reviews on TripAdvisor →
          </a>
        </div>
      </div>
    </section>
  );
}
