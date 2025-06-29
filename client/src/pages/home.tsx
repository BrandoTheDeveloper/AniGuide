import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import AnimeCard from "@/components/anime-card";
import SearchBar from "@/components/search-bar";
import AnimeDetailModal from "@/components/anime-detail-modal";
import MobileNav from "@/components/mobile-nav";
import DataStatus from "@/components/data-status";
import InstallPrompt from "@/components/install-prompt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import type { AniListResponse, AnimeMedia } from "@shared/schema";

const filterOptions = [
  { id: 'trending', label: 'Trending', endpoint: '/api/anime/trending' },
  { id: 'popular', label: 'Popular', endpoint: '/api/anime/popular' },
  { id: 'airing', label: 'Airing Now', endpoint: '/api/anime/airing' },
  { id: 'upcoming', label: 'Upcoming', endpoint: '/api/anime/upcoming' },
  { id: 'top-rated', label: 'Top Rated', endpoint: '/api/anime/top-rated' },
  { id: 'all-time-popular', label: 'All Time Popular', endpoint: '/api/anime/all-time-popular' },
];

export default function Home() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('trending');
  const [selectedAnime, setSelectedAnime] = useState<AnimeMedia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: animeData, isLoading, error } = useQuery<AniListResponse>({
    queryKey: [filterOptions.find(f => f.id === activeFilter)?.endpoint],
    enabled: !searchQuery,
  });

  const { data: searchData, isLoading: isSearching } = useQuery<AniListResponse>({
    queryKey: [`/api/anime/search`, searchQuery],
    queryFn: () => fetch(`/api/anime/search?search=${encodeURIComponent(searchQuery)}&perPage=50`).then(res => res.json()),
    enabled: !!searchQuery && searchQuery.length >= 2,
  });

  const displayData = searchQuery ? searchData : animeData;
  const isLoadingData = searchQuery ? isSearching : isLoading;

  const handleAnimeClick = (anime: AnimeMedia) => {
    setSelectedAnime(anime);
  };

  const handleRefresh = async () => {
    try {
      await fetch('/api/cache/refresh', { method: 'POST' });
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedAnime(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <svg 
                  width="36" 
                  height="36" 
                  viewBox="0 0 36 36" 
                  className="drop-shadow-lg"
                >
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: 'hsl(356, 100%, 55%)', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: 'hsl(311, 21%, 94%)', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <circle cx="18" cy="18" r="16" fill="url(#logoGradient)" />
                  <path 
                    d="M14 12 L24 18 L14 24 Z" 
                    fill="hsl(345, 8%, 18%)" 
                    className="drop-shadow-sm"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-foreground">AniGuide</h1>
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
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
              <Link href="/" className="text-primary font-medium">Discover</Link>
              <Link href="/favorites" className="text-muted-foreground hover:text-foreground transition-colors">My List</Link>
              <Link href="/reviews" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
              <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
            </nav>

            {/* Data Status & Refresh */}
            <div className="hidden md:flex items-center space-x-4">
              <DataStatus />
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="h-8"
                aria-label="Refresh anime data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden text-muted-foreground hover:text-foreground">
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
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
              <img 
                src="https://preview.redd.it/u47pd24jg4z41.jpg?width=1080&crop=smart&auto=webp&s=b2c6f562c1a5ddaaefeb3afd62a4af50f09da20d" 
                alt="Anime and manga collection artwork" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="px-8 max-w-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Amazing Anime</h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
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
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
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
              <p className="text-destructive mb-4">Failed to load anime data</p>
              <p className="text-muted-foreground">Please check your internet connection and try again.</p>
            </div>
          )}
          
          {isLoadingData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
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
              <i className="fas fa-search text-4xl text-muted mb-4"></i>
              <p className="text-muted-foreground mb-2">No anime found</p>
              <p className="text-muted-foreground/60 text-sm">Try adjusting your search query or filters.</p>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Install Prompt */}
      <InstallPrompt />

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
