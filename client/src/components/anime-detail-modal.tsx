import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReviewForm from "./review-form";
import ReviewList from "./review-list";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
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
                    <span className="font-medium">{(anime.averageScore / 10).toFixed(1)}/10</span>
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
            <h4 className="text-xl font-bold mb-6">Reviews & Ratings</h4>
            
            <ReviewForm animeId={anime.id} />
            <ReviewList animeId={anime.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
