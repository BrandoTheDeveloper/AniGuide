import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface CacheStatus {
  isRunning: boolean;
  hasInterval: boolean;
  cacheStats: {
    listCacheSize: number;
    detailCacheSize: number;
    entries: Array<{
      key: string;
      age: number;
      expires: number;
    }>;
  };
}

export default function DataStatus() {
  const { data: status, isLoading } = useQuery<CacheStatus>({
    queryKey: ['/api/cache/status'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  if (isLoading || !status) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Wifi className="h-3 w-3 mr-1" />
        Checking...
      </Badge>
    );
  }

  const totalCacheItems = status.cacheStats.listCacheSize + status.cacheStats.detailCacheSize;
  const isDataFresh = status.isRunning && status.hasInterval;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isDataFresh ? "default" : "secondary"} 
        className="text-xs"
      >
        {isDataFresh ? (
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <WifiOff className="h-3 w-3 mr-1" />
        )}
        {isDataFresh ? "Live Data" : "Cached"}
      </Badge>
      
      {totalCacheItems > 0 && (
        <Badge variant="outline" className="text-xs">
          {totalCacheItems} items cached
        </Badge>
      )}
    </div>
  );
}