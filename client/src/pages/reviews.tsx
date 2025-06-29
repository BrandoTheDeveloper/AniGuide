import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@shared/schema";

export default function Reviews() {
  const [filter, setFilter] = useState<'all' | 'my-reviews'>('all');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["/api/reviews", filter],
  });

  const reviewList = reviews?.reviews || [];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Reviews</h1>
              {reviewList.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {reviewList.length}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Reviews
              </Button>
              <Button
                variant={filter === 'my-reviews' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('my-reviews')}
              >
                My Reviews
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviewList.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Reviews Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start watching anime and share your thoughts with the community
            </p>
            <Button asChild>
              <a href="/">Discover Anime</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewList.map((review: Review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${review.userId}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {review.animeTitle || `Anime #${review.animeId}`}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>User #{review.userId}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getScoreBadgeVariant(review.rating)}
                        className="flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        {review.rating}/10
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-4">
                    {review.review}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {review.episodesWatched && (
                      <span>Episodes watched: {review.episodesWatched}</span>
                    )}
                    {review.watchStatus && (
                      <Badge variant="outline" className="text-xs">
                        {review.watchStatus}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Action buttons for user's own reviews */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}