import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getReviews } from "@/lib/reviews";
import type { Review } from "@shared/schema";

interface ReviewListProps {
  animeId: number;
}

export default function ReviewList({ animeId }: ReviewListProps) {
  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey: [`reviews-${animeId}`],
    queryFn: () => getReviews(animeId),
  });

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getUserInitial = (userId: string) => {
    return userId.charAt(0).toUpperCase();
  };

  const getUserColor = (userId: string) => {
    const colors = [
      'from-primary to-accent',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-yellow-500 to-red-500',
      'from-blue-500 to-cyan-500',
    ];
    const index = userId.length % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-slate-700/30 rounded-lg p-6">
            <div className="flex items-start space-x-3 mb-3">
              <Skeleton className="w-10 h-10 rounded-full bg-slate-600" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-slate-600" />
                <Skeleton className="h-3 w-32 bg-slate-600" />
              </div>
            </div>
            <Skeleton className="h-16 w-full bg-slate-600" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
        <p className="text-red-400">Failed to load reviews</p>
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-comments text-3xl text-slate-600 mb-4"></i>
        <p className="text-slate-400 mb-2">No reviews yet</p>
        <p className="text-slate-500 text-sm">Be the first to write a review for this anime!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-slate-700/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${getUserColor(review.userId)} rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">
                  {getUserInitial(review.userId)}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#2F2D2E]">
                  {review.userId === 'anonymous' ? 'Anonymous User' : review.userId}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="star-rating text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star star ${i < review.rating ? 'active' : ''}`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-[#2F2D2E] text-sm">
                    {formatTimestamp(review.timestamp)}
                  </span>
                  {(review.season || review.episode) && (
                    <span className="text-slate-500 text-xs bg-slate-600 px-2 py-1 rounded">
                      {review.season && review.episode ? 
                        `${review.season} • Ep ${review.episode}` :
                        review.season || `Episode ${review.episode}`
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[#2F2D2E] leading-relaxed">
            {review.text}
          </p>
        </div>
      ))}
    </div>
  );
}
