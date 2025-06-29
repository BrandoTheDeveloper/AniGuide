import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addReview } from "@/lib/reviews";
import type { InsertReview } from "@shared/schema";

interface ReviewFormProps {
  animeId: number;
}

export default function ReviewForm({ animeId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addReviewMutation = useMutation({
    mutationFn: async (review: InsertReview) => {
      return addReview(review);
    },
    onSuccess: () => {
      toast({
        title: "Review Added",
        description: "Your review has been saved successfully!",
      });
      setRating(0);
      setReviewText('');
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/${animeId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Review Text Required",
        description: "Please write a review before submitting.",
        variant: "destructive",
      });
      return;
    }

    const review: InsertReview = {
      animeId,
      userId: 'anonymous', // For now, using anonymous users
      rating,
      text: reviewText.trim(),
    };

    addReviewMutation.mutate(review);
  };

  return (
    <div className="bg-slate-700/50 rounded-xl p-6 mb-8">
      <h5 className="font-semibold mb-4">Write a Review</h5>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Rating
          </label>
          <div className="star-rating text-xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <i
                key={i}
                className={`fas fa-star star cursor-pointer ${
                  i < (hoveredRating || rating) ? 'active' : ''
                }`}
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
              ></i>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Review
          </label>
          <Textarea
            rows={4}
            placeholder="Share your thoughts about this anime..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>
        
        <Button
          type="submit"
          disabled={addReviewMutation.isPending}
          className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg font-medium"
        >
          {addReviewMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </form>
    </div>
  );
}
