import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AnimeCard from "@/components/anime-card";
import AnimeDetailModal from "@/components/anime-detail-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, Clock, CheckCircle, Play, Pause } from "lucide-react";
import type { AnimeMedia, WatchlistItem } from "@shared/schema";

interface WatchlistAnime extends WatchlistItem {
  anime?: AnimeMedia;
}

export default function Favorites() {
  const [selectedAnime, setSelectedAnime] = useState<AnimeMedia | null>(null);

  const { data: watchlist = [], isLoading } = useQuery<WatchlistAnime[]>({
    queryKey: ["/api/watchlist"],
  });

  const handleAnimeClick = (anime: AnimeMedia) => {
    setSelectedAnime(anime);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'on_hold':
        return <Pause className="w-4 h-4" />;
      case 'dropped':
        return <Clock className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'dropped':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'watching':
        return 'Watching';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      case 'dropped':
        return 'Dropped';
      default:
        return 'Plan to Watch';
    }
  };

  const groupedWatchlist = watchlist.reduce((acc, item) => {
    if (!acc[item.status]) {
      acc[item.status] = [];
    }
    acc[item.status].push(item);
    return acc;
  }, {} as Record<string, WatchlistAnime[]>);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Watchlist is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Start building your anime collection by adding shows to your watchlist!
          </p>
          <Button onClick={() => window.location.href = '/search'}>
            Discover Anime
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
        <p className="text-muted-foreground">
          Keep track of your anime journey
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedWatchlist).map(([status, items]) => (
          <div key={status}>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className={`${getStatusColor(status)} flex items-center gap-2`}>
                {getStatusIcon(status)}
                {getStatusLabel(status)}
                <span className="ml-1">({items.length})</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                      {item.anime ? (
                        <img
                          src={item.anime.coverImage.large}
                          alt={item.anime.title.english || item.anime.title.romaji}
                          className="w-full h-full object-cover rounded-lg"
                          onClick={() => item.anime && handleAnimeClick(item.anime)}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Anime #{item.animeId}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{item.rating}/10</span>
                        </div>
                      )}
                      
                      {(item.episodesWatched && item.episodesWatched > 0) && (
                        <div className="text-sm text-muted-foreground">
                          Episodes: {item.episodesWatched}
                          {item.anime?.episodes && ` / ${item.anime.episodes}`}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Added {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          isOpen={!!selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
}