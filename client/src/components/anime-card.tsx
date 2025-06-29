import type { AnimeMedia } from "@shared/schema";

interface AnimeCardProps {
  anime: AnimeMedia;
  onClick: () => void;
}

export default function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASING':
        return 'bg-green-500';
      case 'FINISHED':
        return 'bg-blue-500';
      case 'NOT_YET_RELEASED':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RELEASING':
        return 'Airing';
      case 'FINISHED':
        return 'Completed';
      case 'NOT_YET_RELEASED':
        return 'Upcoming';
      default:
        return status.replace('_', ' ');
    }
  };

  return (
    <div 
      className="anime-card bg-card border border-border rounded-xl overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[3/4] relative">
        <img 
          src={anime.coverImage.large}
          alt={anime.title.english || anime.title.romaji}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        <div className="absolute top-2 right-2">
          <span className={`${getStatusColor(anime.status)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
            {getStatusLabel(anime.status)}
          </span>
        </div>
        
        {anime.averageScore && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center space-x-1 mb-1">
              <div className="star-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i 
                    key={i}
                    className={`fas fa-star star text-xs ${i < Math.floor(anime.averageScore! / 20) ? 'active' : ''}`}
                  ></i>
                ))}
              </div>
              <span className="text-xs text-slate-300">{(anime.averageScore / 10).toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h4 className="font-semibold text-sm mb-1 line-clamp-2">
          {anime.title.english || anime.title.romaji}
        </h4>
        
        <p className="text-muted-foreground text-xs mb-2">
          {anime.genres.slice(0, 2).join(', ')}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground/70">
            {anime.startDate?.year || 'Unknown'}
          </span>
          <span className="text-primary">
            {anime.episodes ? `${anime.episodes} episodes` : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
}
