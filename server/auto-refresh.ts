import { animeCache } from "./anime-cache";

const ANILIST_API_URL = "https://graphql.anilist.co";

async function fetchFromAniList(query: string, variables: any = {}) {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('AniList GraphQL errors:', data.errors);
      throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    throw error;
  }
}

const TRENDING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, sort: TRENDING_DESC, status_not: NOT_YET_RELEASED) {
        id
        title {
          english
          romaji
          native
        }
        coverImage {
          large
          medium
        }
        description
        genres
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        status
        averageScore
        tags {
          name
        }
        nextAiringEpisode {
          airingAt
          episode
        }
        episodes
        season
        seasonYear
      }
    }
  }
`;

const AIRING_NOW_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
        id
        title {
          english
          romaji
          native
        }
        coverImage {
          large
          medium
        }
        description
        genres
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        status
        averageScore
        tags {
          name
        }
        nextAiringEpisode {
          airingAt
          episode
        }
        episodes
        season
        seasonYear
      }
    }
  }
`;

class AutoRefreshService {
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting auto-refresh service for anime data...');
    
    // Initial refresh
    this.refreshCriticalData();
    
    // Refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshCriticalData();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isRunning = false;
    console.log('Auto-refresh service stopped');
  }

  private async refreshCriticalData() {
    const criticalEndpoints = [
      { key: 'trending-1-50', query: TRENDING_ANIME_QUERY, variables: { page: 1, perPage: 50 } },
      { key: 'airing-1-50', query: AIRING_NOW_QUERY, variables: { page: 1, perPage: 50 } },
      { key: 'trending-1-25', query: TRENDING_ANIME_QUERY, variables: { page: 1, perPage: 25 } },
      { key: 'airing-1-25', query: AIRING_NOW_QUERY, variables: { page: 1, perPage: 25 } },
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        console.log(`Refreshing cache for ${endpoint.key}...`);
        const data = await fetchFromAniList(endpoint.query, endpoint.variables);
        
        if (data?.data?.Page?.media) {
          animeCache.set(endpoint.key, data.data.Page.media);
          console.log(`Successfully refreshed ${endpoint.key} with ${data.data.Page.media.length} items`);
        }
        
        // Small delay between requests to be respectful to AniList API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to refresh ${endpoint.key}:`, error);
      }
    }
    
    console.log('Auto-refresh cycle completed');
  }

  async forceRefresh() {
    console.log('Force refreshing all cached data...');
    animeCache.clear();
    await this.refreshCriticalData();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.refreshInterval !== null,
      cacheStats: animeCache.getStats()
    };
  }
}

export const autoRefreshService = new AutoRefreshService();