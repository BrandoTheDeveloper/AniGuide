import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewForm from "./review-form";
import ReviewList from "./review-list";
import EpisodeList from "./episode-list";
import RelatedAnime from "./related-anime";
import ProtectedFeature from "./protected-feature";
import type { AnimeMedia } from "@shared/schema";

interface AnimeDetailModalProps {
  anime: AnimeMedia;
  isOpen: boolean;
  onClose: () => void;
}

export default function AnimeDetailModal({ anime, isOpen, onClose }: AnimeDetailModalProps) {
  const formatNextEpisode = (nextEpisode: any) => {
    if (!nextEpisode) return null;
    const date = new Date(nextEpisode.airingAt * 1000);
    return `Episode ${nextEpisode.episode} airs on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {anime.title.english || anime.title.romaji}
          </DialogTitle>
          <DialogDescription>
            View detailed information, episodes, reviews, and related anime
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
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
              <h2 className="text-3xl font-bold mb-2">
                {anime.title.english || anime.title.romaji}
              </h2>
              
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
                    <span className="font-medium text-[#2F2D2E] dark:text-[#2F2D2E]">{(anime.averageScore / 10).toFixed(1)}/10</span>
                  </div>
                )}
                
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  anime.status === 'RELEASING' ? 'bg-green-500 text-white' :
                  anime.status === 'FINISHED' ? 'bg-blue-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {anime.status.replace('_', ' ')}
                </span>
                
                {anime.startDate?.year && (
                  <span className="text-[#2F2D2E] dark:text-[#2F2D2E]">{anime.startDate.year}</span>
                )}
                
                {anime.episodes && (
                  <span className="text-[#2F2D2E] dark:text-[#2F2D2E]">{anime.episodes} Episodes</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres.map((genre) => (
                  <span key={genre} className="bg-[#2F2D2E] text-[#DAD2D8] px-3 py-1 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>
              
              {anime.description && (
                <p className="text-[#2F2D2E] dark:text-[#2F2D2E] mb-6 leading-relaxed">
                  {anime.description.replace(/<[^>]*>/g, '').substring(0, 300)}
                  {anime.description.length > 300 && '...'}
                </p>
              )}
              
              {/* Next Episode Info */}
              {anime.nextAiringEpisode && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-primary">
                    <i className="fas fa-clock"></i>
                    <span className="font-medium">Next Episode</span>
                  </div>
                  <p className="text-[#2F2D2E] mt-1">
                    {formatNextEpisode(anime.nextAiringEpisode)}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <ProtectedFeature
              featureName="Watchlist"
              description="Add anime to your personal watchlist to track what you want to watch"
              trigger={
                <Button className="bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8] px-6 py-3">
                  <i className="fas fa-plus mr-2"></i>Add to My List
                </Button>
              }
            >
              <Button className="bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8] px-6 py-3">
                <i className="fas fa-plus mr-2"></i>Add to My List
              </Button>
            </ProtectedFeature>
            
            <ProtectedFeature
              featureName="Favorites"
              description="Mark anime as favorite to easily find them later"
              trigger={
                <Button className="bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8] px-6 py-3">
                  <i className="fas fa-heart mr-2"></i>Mark as Favorite
                </Button>
              }
            >
              <Button className="bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8] px-6 py-3">
                <i className="fas fa-heart mr-2"></i>Mark as Favorite
              </Button>
            </ProtectedFeature>
            
            <Button className="bg-[#9C0D38] hover:bg-[#9C0D38]/90 text-[#DAD2D8] px-6 py-3">
              <i className="fas fa-share mr-2"></i>Share
            </Button>
          </div>
          
          {/* Enhanced Content Sections */}
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reviews" className="mt-6">
              <ProtectedFeature
                featureName="Reviews"
                description="Write and share your thoughts about anime episodes and series"
              >
                <ReviewForm animeId={anime.id} totalEpisodes={anime.episodes} />
              </ProtectedFeature>
              <ReviewList animeId={anime.id} />
            </TabsContent>
            
            <TabsContent value="episodes" className="mt-6">
              <EpisodeList 
                animeId={anime.id} 
                episodes={anime.episodes} 
                nextAiringEpisode={anime.nextAiringEpisode}
              />
            </TabsContent>
            
            <TabsContent value="related" className="mt-6">
              <RelatedAnime relations={anime.relations} />
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">Status</h5>
                    <p className="text-muted-foreground">{anime.status}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Episodes</h5>
                    <p className="text-muted-foreground">{anime.episodes || 'Unknown'}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Season</h5>
                    <p className="text-muted-foreground">
                      {anime.season ? `${anime.season} ${anime.seasonYear}` : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Score</h5>
                    <p className="text-muted-foreground">
                      {anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)}/10` : 'Not rated'}
                    </p>
                  </div>
                </div>
                
                {anime.tags && anime.tags.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-2">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {anime.tags.slice(0, 15).map((tag) => (
                        <span key={tag.name} className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
