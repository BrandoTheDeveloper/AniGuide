import { AnimeMedia, AniListResponse } from "@shared/schema";

interface CacheEntry {
  data: AnimeMedia[];
  timestamp: number;
  expires: number;
}

interface DetailCacheEntry {
  data: AnimeMedia;
  timestamp: number;
  expires: number;
}

class AnimeCache {
  private cache = new Map<string, CacheEntry>();
  private detailCache = new Map<number, DetailCacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly DETAIL_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  set(key: string, data: AnimeMedia[]): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expires: now + this.CACHE_DURATION
    });
  }

  get(key: string): AnimeMedia[] | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  setDetail(id: number, data: AnimeMedia): void {
    const now = Date.now();
    this.detailCache.set(id, {
      data,
      timestamp: now,
      expires: now + this.DETAIL_CACHE_DURATION
    });
  }

  getDetail(id: number): AnimeMedia | null {
    const entry = this.detailCache.get(id);
    if (!entry || Date.now() > entry.expires) {
      this.detailCache.delete(id);
      return null;
    }
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
    this.detailCache.clear();
  }

  getStats() {
    return {
      listCacheSize: this.cache.size,
      detailCacheSize: this.detailCache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        expires: entry.expires - Date.now()
      }))
    };
  }
}

export const animeCache = new AnimeCache();