import { TripAdvisorWidget } from "@/components/tripadvisor-widget";
import { TripAdvisorReviewsWidget } from "@/components/tripadvisor-reviews-widget";
import { CuratedReviews } from "@/components/curated-reviews";
import { getFeaturedReviews } from "@/lib/firestore/reviews";

// Placeholder reviews until Firestore is set up
// Replace these by adding reviews to Firestore with featured: true
const PLACEHOLDER_REVIEWS = [
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
];

export async function ReviewsSection() {
  // Fetch curated reviews from Firestore
  // Falls back to placeholder reviews if Firestore isn't set up yet
  const firestoreReviews = await getFeaturedReviews();
  const reviews = firestoreReviews.length > 0 ? firestoreReviews : PLACEHOLDER_REVIEWS;

  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* TripAdvisor Traveler's Choice Badge */}
        <div className="mb-12">
          <TripAdvisorWidget />
        </div>

        {/* Live TripAdvisor Reviews Widget */}
        <div className="mb-12">
          <TripAdvisorReviewsWidget />
        </div>

        {/* Curated Reviews from Firestore (or placeholders) */}
        <CuratedReviews reviews={reviews} />

        <div className="mt-8 text-center">
          <a
            href="https://www.tripadvisor.com/Attraction_Review-g147337-d1206831-Reviews-Sea_Saba_Dive_Center-Windwardside_Saba.html"
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
