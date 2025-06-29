import { useState, useEffect } from "react";
import { Bookmark, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimeCard from "@/components/anime-card";
import AnimeDetailModal from "@/components/anime-detail-modal";
import type { AnimeMedia } from "@shared/schema";

export default function Favorites() {
  const [favorites, setFavorites] = useState<AnimeMedia[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeMedia | null>(null);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('anime-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const removeFavorite = (animeId: number) => {
    const updatedFavorites = favorites.filter(anime => anime.id !== animeId);
    setFavorites(updatedFavorites);
    localStorage.setItem('anime-favorites', JSON.stringify(updatedFavorites));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('anime-favorites');
  };

  const handleAnimeClick = (anime: AnimeMedia) => {
    setSelectedAnime(anime);
  };

  const handleCloseModal = () => {
    setSelectedAnime(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bookmark className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Favorites</h1>
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {favorites.length}
                </Badge>
              )}
            </div>
            {favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFavorites}
                className="text-destructive hover:text-destructive"
                aria-label="Clear all favorites"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start exploring anime and add them to your favorites by clicking the heart icon
            </p>
            <Button asChild>
              <a href="/">Discover Anime</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map((anime) => (
              <div key={anime.id} className="relative group">
                <AnimeCard
                  anime={anime}
                  onClick={() => handleAnimeClick(anime)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(anime.id);
                  }}
                  aria-label={`Remove ${anime.title.english || anime.title.romaji} from favorites`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          isOpen={!!selectedAnime}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}