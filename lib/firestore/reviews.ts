/**
 * Firestore reviews collection structure and utilities
 * 
 * Collection: reviews
 * Document structure:
 * {
 *   id: string (auto-generated)
 *   text: string (review content)
 *   author: string (reviewer name)
 *   source: "TripAdvisor" | "Google" | "Facebook"
 *   rating: number (1-5)
 *   date: timestamp
 *   featured: boolean (show on homepage)
 *   createdAt: timestamp
 *   updatedAt: timestamp
 * }
 */

export interface Review {
  id: string;
  text: string;
  author: string;
  source: "TripAdvisor" | "Google" | "Facebook";
  rating: number;
  date: Date;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewInput {
  text: string;
  author: string;
  source: "TripAdvisor" | "Google" | "Facebook";
  rating: number;
  date: Date;
  featured?: boolean;
}

/**
 * Fetch featured reviews from Firestore
 * These are manually curated reviews marked as featured
 */
export async function getFeaturedReviews(): Promise<Review[]> {
  // TODO: Implement Firestore connection
  // For now, return empty array - you'll add Firebase config later
  return [];
}

/**
 * Fetch all reviews from Firestore
 */
export async function getAllReviews(): Promise<Review[]> {
  // TODO: Implement Firestore connection
  return [];
}
