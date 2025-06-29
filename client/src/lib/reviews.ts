import type { Review, InsertReview } from "@shared/schema";

const STORAGE_KEY = 'aniguide_reviews';

// Get all reviews from localStorage
export function getAllReviews(): Review[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading reviews from localStorage:', error);
    return [];
  }
}

// Save reviews to localStorage
function saveReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Error saving reviews to localStorage:', error);
    throw new Error('Failed to save review');
  }
}

// Get reviews for a specific anime
export function getReviews(animeId: number): Review[] {
  const allReviews = getAllReviews();
  return allReviews.filter(review => review.animeId === animeId);
}

// Add a new review
export function addReview(reviewData: InsertReview): Review {
  const allReviews = getAllReviews();
  
  const newReview: Review = {
    id: Date.now(), // Simple ID generation for local storage
    ...reviewData,
    timestamp: new Date().toISOString(),
  };
  
  allReviews.push(newReview);
  saveReviews(allReviews);
  
  return newReview;
}

// Delete a review (optional feature)
export function deleteReview(reviewId: number): boolean {
  try {
    const allReviews = getAllReviews();
    const filteredReviews = allReviews.filter(review => review.id !== reviewId);
    
    if (filteredReviews.length === allReviews.length) {
      return false; // Review not found
    }
    
    saveReviews(filteredReviews);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

// Get review statistics for an anime
export function getReviewStats(animeId: number): {
  count: number;
  averageRating: number;
  ratingDistribution: number[];
} {
  const reviews = getReviews(animeId);
  
  if (reviews.length === 0) {
    return {
      count: 0,
      averageRating: 0,
      ratingDistribution: [0, 0, 0, 0, 0],
    };
  }
  
  const ratings = reviews.map(r => r.rating);
  const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  
  const ratingDistribution = [0, 0, 0, 0, 0];
  ratings.forEach(rating => {
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating - 1]++;
    }
  });
  
  return {
    count: reviews.length,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
  };
}
