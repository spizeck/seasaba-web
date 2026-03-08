# Firestore Reviews Setup Guide

This guide explains how to set up Firestore to manage curated reviews on your site.

## Current Implementation

The reviews section now has **two sources**:

1. **TripAdvisor Live Widget** - Shows 4 recent reviews automatically from TripAdvisor
2. **Curated Reviews** - Handpicked testimonials you add to Firestore

## Firestore Collection Structure

**Collection Name:** `reviews`

**Document Fields:**
```typescript
{
  text: string           // Review content
  author: string         // Reviewer name (e.g., "Sarah M.")
  source: string         // "TripAdvisor" | "Google" | "Facebook"
  rating: number         // 1-5 stars
  date: timestamp        // When the review was written
  featured: boolean      // Set to true to show on homepage
  createdAt: timestamp   // When you added it to Firestore
  updatedAt: timestamp   // Last update time
}
```

## How to Add Reviews

### Option 1: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Create collection: `reviews`
5. Add documents with the fields above
6. Set `featured: true` for reviews you want on the homepage

### Option 2: Firebase Admin SDK (Programmatic)

Once you have Firebase configured, you can add reviews via code or a simple admin interface.

## Next Steps

1. **Set up Firebase project** (if not already done)
2. **Add Firebase config** to your Next.js app
3. **Implement Firestore connection** in `/lib/firestore/reviews.ts`
4. **Add your first reviews** to Firestore with `featured: true`

## Current Behavior

- **Before Firestore setup:** Shows placeholder reviews
- **After Firestore setup:** Shows your curated reviews from the database
- **TripAdvisor widget:** Always shows live reviews regardless of Firestore

## Benefits

- **Full control** over which reviews appear
- **Mix sources** - TripAdvisor, Google, Facebook
- **Easy updates** - Add/remove reviews anytime via Firebase Console
- **Automatic** - No code changes needed to update reviews
