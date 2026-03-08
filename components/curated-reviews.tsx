import { Star } from "lucide-react";

interface Review {
  text: string;
  author: string;
  source: string;
  rating: number;
}

interface CuratedReviewsProps {
  reviews: Review[];
}

/**
 * Display curated reviews from Firestore
 * These are handpicked testimonials you've added to your database
 */
export function CuratedReviews({ reviews }: CuratedReviewsProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-center text-xl font-semibold text-foreground mb-8">
        What Our Divers Say
      </h3>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, index) => (
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
    </div>
  );
}
