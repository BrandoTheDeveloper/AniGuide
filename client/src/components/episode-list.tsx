import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

interface Episode {
  id: number;
  title: string;
  episode: number;
  airingAt?: number;
  description?: string;
}

interface EpisodeListProps {
  animeId: number;
  episodes?: number;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
  };
}

export default function EpisodeList({ animeId, episodes, nextAiringEpisode }: EpisodeListProps) {
  // Generate episode list based on total episodes
  const episodeList: Episode[] = episodes ? 
    Array.from({ length: episodes }, (_, i) => ({
      id: i + 1,
      title: `Episode ${i + 1}`,
      episode: i + 1,
      airingAt: nextAiringEpisode && nextAiringEpisode.episode === i + 1 ? nextAiringEpisode.airingAt : undefined
    })) : [];

  const formatAirDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!episodes || episodes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Episodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Episode information not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Episodes ({episodes} total)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {episodeList.map((episode) => (
            <div
              key={episode.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                  {episode.episode}
                </div>
                <span className="font-medium">{episode.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {episode.airingAt && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatAirDate(episode.airingAt)}
                  </Badge>
                )}
                {nextAiringEpisode && episode.episode === nextAiringEpisode.episode && (
                  <Badge className="text-xs">Next</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}