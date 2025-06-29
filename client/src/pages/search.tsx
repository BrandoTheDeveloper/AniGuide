import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimeCard from "@/components/anime-card";
import AnimeDetailModal from "@/components/anime-detail-modal";
import type { AnimeMedia } from "@shared/schema";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedAnime, setSelectedAnime] = useState<AnimeMedia | null>(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/anime/search", searchQuery, selectedGenre],
    enabled: searchQuery.length > 2,
  });

  const { data: genresData } = useQuery({
    queryKey: ["/api/anime/genres"],
  });

  const handleAnimeClick = (anime: AnimeMedia) => {
    setSelectedAnime(anime);
  };

  const handleCloseModal = () => {
    setSelectedAnime(null);
  };

  const genres = genresData?.genres || [];
  const animeList = searchResults?.data?.Page?.media || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search anime"
              />
            </div>
            <Button variant="outline" size="icon" aria-label="Filter results">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Genre filters */}
          {genres.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              <Button
                variant={selectedGenre === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre("")}
              >
                All
              </Button>
              {genres.map((genre: string) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                  className="whitespace-nowrap"
                >
                  {genre}
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {searchQuery.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Search Anime</h2>
            <p className="text-muted-foreground">
              Enter at least 3 characters to start searching
            </p>
          </div>
        ) : searchQuery.length < 3 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Enter at least 3 characters to search
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] bg-muted rounded-t-lg" />
                  <div className="p-3">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : animeList.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No results found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                Search Results ({animeList.length})
              </h1>
              {selectedGenre && (
                <Badge variant="secondary" className="text-sm">
                  {selectedGenre}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {animeList.map((anime: AnimeMedia) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onClick={() => handleAnimeClick(anime)}
                />
              ))}
            </div>
          </>
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