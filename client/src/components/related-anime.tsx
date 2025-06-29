import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, BookOpen } from "lucide-react";
import type { AnimeMedia } from "@shared/schema";

interface RelatedAnimeProps {
  relations?: AnimeMedia['relations'];
}

export default function RelatedAnime({ relations }: RelatedAnimeProps) {
  if (!relations?.edges || relations.edges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Related Anime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No related anime found</p>
        </CardContent>
      </Card>
    );
  }

  const getRelationIcon = (type: string, format: string) => {
    if (format === "MOVIE") return <Film className="h-4 w-4" />;
    if (format === "TV" || format === "TV_SHORT") return <Tv className="h-4 w-4" />;
    if (format === "MANGA" || format === "NOVEL") return <BookOpen className="h-4 w-4" />;
    return <Tv className="h-4 w-4" />;
  };

  const getRelationColor = (relationType: string) => {
    switch (relationType) {
      case "SEQUEL": return "bg-primary/10 text-primary border-primary/20";
      case "PREQUEL": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "SIDE_STORY": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "SPIN_OFF": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "ALTERNATIVE": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "ADAPTATION": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-accent text-accent-foreground";
    }
  };

  const formatRelationType = (relationType: string) => {
    return relationType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Group by relation type
  const groupedRelations = relations.edges.reduce((acc, edge) => {
    const type = edge.relationType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(edge);
    return acc;
  }, {} as Record<string, typeof relations.edges>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Related Anime & Movies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedRelations).map(([relationType, items]) => (
            <div key={relationType}>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                {formatRelationType(relationType)}
              </h4>
              <div className="grid gap-3">
                {items.map((edge) => {
                  const anime = edge.node;
                  return (
                    <div
                      key={edge.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <img
                        src={anime.coverImage.medium}
                        alt={anime.title.english || anime.title.romaji}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          {getRelationIcon(anime.type, anime.format)}
                          <h5 className="font-medium text-sm leading-tight">
                            {anime.title.english || anime.title.romaji}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRelationColor(relationType)}`}
                          >
                            {formatRelationType(relationType)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {anime.format?.replace(/_/g, ' ')}
                          </Badge>
                          {anime.episodes && (
                            <Badge variant="outline" className="text-xs">
                              {anime.episodes} episodes
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}