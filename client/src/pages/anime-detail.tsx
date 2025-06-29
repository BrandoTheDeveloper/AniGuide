import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewForm from "@/components/review-form";
import ReviewList from "@/components/review-list";
import type { AnimeMedia } from "@shared/schema";

interface AnimeDetailResponse {
  data: {
    Media: AnimeMedia;
  };
}

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();
  const animeId = parseInt(id || "0");

  const { data, isLoading, error } = useQuery<AnimeDetailResponse>({
    queryKey: [`/api/anime/${animeId}`],
    enabled: !!animeId,
  });

  const anime = data?.data?.Media;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Skeleton className="w-full md:w-64 aspect-[3/4] rounded-xl bg-slate-700" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4 bg-slate-700" />
              <Skeleton className="h-4 w-1/2 bg-slate-700" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-slate-700" />
                <Skeleton className="h-6 w-16 rounded-full bg-slate-700" />
                <Skeleton className="h-6 w-16 rounded-full bg-slate-700" />
              </div>
              <Skeleton className="h-24 w-full bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Anime Not Found</h2>
          <p className="text-slate-400">The anime you're looking for doesn't exist or failed to load.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: any) => {
    if (!date?.year) return "Unknown";
    return `${date.year}${date.month ? `-${date.month.toString().padStart(2, '0')}` : ''}${date.day ? `-${date.day.toString().padStart(2, '0')}` : ''}`;
  };

  const formatNextEpisode = (nextEpisode: any) => {
    if (!nextEpisode) return null;
    const date = new Date(nextEpisode.airingAt * 1000);
    return `Episode ${nextEpisode.episode} airs on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-slate-300 hover:text-white"
          onClick={() => window.history.back()}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Discovery
        </Button>

        {/* Anime Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <img 
              src={anime.coverImage.large}
              alt={anime.title.english || anime.title.romaji}
              className="w-full rounded-xl"
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {anime.title.english || anime.title.romaji}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {anime.averageScore && (
                <div className="flex items-center space-x-1">
                  <div className="star-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i 
                        key={i}
                        className={`fas fa-star star ${i < Math.floor(anime.averageScore! / 20) ? 'active' : ''}`}
                      ></i>
                    ))}
                  </div>
                  <span className="font-medium">{anime.averageScore / 10}/10</span>
                </div>
              )}
              
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                anime.status === 'RELEASING' ? 'bg-green-500 text-white' :
                anime.status === 'FINISHED' ? 'bg-blue-500 text-white' :
                'bg-slate-500 text-white'
              }`}>
                {anime.status.replace('_', ' ').toLowerCase()}
              </span>
              
              {anime.startDate?.year && (
                <span className="text-slate-400">{anime.startDate.year}</span>
              )}
              
              {anime.episodes && (
                <span className="text-slate-400">{anime.episodes} Episodes</span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map((genre) => (
                <span key={genre} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                  {genre}
                </span>
              ))}
            </div>
            
            {anime.description && (
              <p className="text-slate-300 mb-6 leading-relaxed">
                {anime.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
            
            {/* Next Episode Info */}
            {anime.nextAiringEpisode && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-primary">
                  <i className="fas fa-clock"></i>
                  <span className="font-medium">Next Episode</span>
                </div>
                <p className="text-white mt-1">
                  {formatNextEpisode(anime.nextAiringEpisode)}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button className="bg-primary hover:bg-primary/90 px-6 py-3">
            <i className="fas fa-plus mr-2"></i>Add to My List
          </Button>
          <Button variant="secondary" className="bg-slate-700 hover:bg-slate-600 px-6 py-3">
            <i className="fas fa-heart mr-2"></i>Mark as Favorite
          </Button>
          <Button variant="secondary" className="bg-slate-700 hover:bg-slate-600 px-6 py-3">
            <i className="fas fa-share mr-2"></i>Share
          </Button>
        </div>
        
        {/* Reviews Section */}
        <div className="border-t border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-6">Reviews & Ratings</h2>
          
          <ReviewForm animeId={animeId} />
          <ReviewList animeId={animeId} />
        </div>
      </div>
    </div>
  );
}
