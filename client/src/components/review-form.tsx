import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addReview } from "@/lib/reviews";
import type { InsertReview } from "@shared/schema";

interface ReviewFormProps {
  animeId: number;
  totalEpisodes?: number;
}

export default function ReviewForm({ animeId, totalEpisodes }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState<number | undefined>();
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
      setSeason('');
      setEpisode(undefined);
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
      season: season || undefined,
      episode: episode || undefined,
    };

    addReviewMutation.mutate(review);
  };

  const episodeOptions = totalEpisodes ? 
    Array.from({ length: totalEpisodes }, (_, i) => i + 1) : [];

  return (
    <div className="bg-card/50 rounded-xl p-6 mb-8 border">
      <h5 className="font-semibold mb-4">Write a Review</h5>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Your Rating
          </Label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="season" className="text-sm font-medium">Season (Optional)</Label>
            <Input
              id="season"
              placeholder="e.g., Season 1, S2, etc."
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-1"
            />
          </div>
          
          {totalEpisodes && totalEpisodes > 0 && (
            <div>
              <Label className="text-sm font-medium">Episode (Optional)</Label>
              <Select value={episode?.toString() || ""} onValueChange={(value) => setEpisode(value ? parseInt(value) : undefined)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select episode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All episodes</SelectItem>
                  {episodeOptions.map((ep) => (
                    <SelectItem key={ep} value={ep.toString()}>
                      Episode {ep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="reviewText" className="text-sm font-medium mb-2 block">
            Your Review
          </Label>
          <Textarea
            id="reviewText"
            rows={4}
            placeholder="Share your thoughts about this anime..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="resize-none"
          />
        </div>
        
        <Button
          type="submit"
          disabled={addReviewMutation.isPending}
          className="w-full"
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
