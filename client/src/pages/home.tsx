import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AnimeCard from "@/components/anime-card";
import SearchBar from "@/components/search-bar";
import AnimeDetailModal from "@/components/anime-detail-modal";
import MobileNav from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AniListResponse, AnimeMedia } from "@shared/schema";

const filterOptions = [
  { id: 'trending', label: 'Trending', endpoint: '/api/anime/trending' },
  { id: 'popular', label: 'Popular', endpoint: '/api/anime/popular' },
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('trending');
  const [selectedAnime, setSelectedAnime] = useState<AnimeMedia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: animeData, isLoading, error } = useQuery<AniListResponse>({
    queryKey: [filterOptions.find(f => f.id === activeFilter)?.endpoint],
    enabled: !searchQuery,
  });

  const { data: searchData, isLoading: isSearching } = useQuery<AniListResponse>({
    queryKey: [`/api/anime/search/${searchQuery}`],
    enabled: !!searchQuery,
  });

  const displayData = searchQuery ? searchData : animeData;
  const isLoadingData = searchQuery ? isSearching : isLoading;

  const handleAnimeClick = (anime: AnimeMedia) => {
    setSelectedAnime(anime);
  };

  const handleCloseModal = () => {
    setSelectedAnime(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <i className="fas fa-play text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-white">AniGuide</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search anime..."
              />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-accent font-medium">Discover</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">My List</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Reviews</a>
            </nav>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-300 hover:text-white">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        {!searchQuery && (
          <section className="mb-12">
            <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=640" 
                alt="Featured anime artwork" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="px-8 max-w-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Amazing Anime</h2>
                  <p className="text-slate-300 mb-6 line-clamp-3">
                    Explore trending anime, read reviews, and find your next favorite series with AniGuide.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-lg font-medium">
                      <i className="fas fa-search mr-2"></i>Start Exploring
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filter Tabs */}
        {!searchQuery && (
          <section className="mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {filterOptions.map((filter) => (
                <Button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  variant={activeFilter === filter.id ? "default" : "secondary"}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.id 
                      ? "bg-primary text-white" 
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* Anime Grid */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             filterOptions.find(f => f.id === activeFilter)?.label + ' Anime'}
          </h3>
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Failed to load anime data</p>
              <p className="text-slate-400">Please check your internet connection and try again.</p>
            </div>
          )}
          
          {isLoadingData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl bg-slate-700" />
                  <Skeleton className="h-4 w-3/4 bg-slate-700" />
                  <Skeleton className="h-3 w-1/2 bg-slate-700" />
                </div>
              ))}
            </div>
          ) : displayData?.data?.Page?.media?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayData.data.Page.media.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onClick={() => handleAnimeClick(anime)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-slate-600 mb-4"></i>
              <p className="text-slate-400 mb-2">No anime found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search query or filters.</p>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

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
