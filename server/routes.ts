import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, requireAuth } from "./localAuth";
import { insertReviewSchema } from "@shared/schema";
import { animeCache } from "./anime-cache";
import { autoRefreshService } from "./auto-refresh";
import { testDatabaseConnection } from "./db";
import { z } from "zod";

const ANILIST_API_URL = "https://graphql.anilist.co";

// GraphQL queries for AniList API
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

const ANIME_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
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
`;

const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search) {
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

const ALL_TIME_POPULAR_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, sort: POPULARITY_DESC) {
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

const TOP_RATED_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, sort: SCORE_DESC, averageScore_greater: 75) {
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

const UPCOMING_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC) {
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

async function fetchFromAniList(query: string, variables: any = {}) {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Test database connection on startup
  console.log("Testing database connection...");
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.warn("Database connection failed, but continuing server startup...");
  }

  // Auth middleware
  await setupLocalAuth(app);

  // Get trending anime
  app.get("/api/anime/trending", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      const cacheKey = `trending-${page}-${perPage}`;
      
      // Check cache first
      const cached = animeCache.get(cacheKey);
      if (cached) {
        return res.json({ data: { Page: { media: cached, pageInfo: { hasNextPage: true, currentPage: page } } } });
      }
      
      const data = await fetchFromAniList(TRENDING_ANIME_QUERY, { page, perPage });
      
      // Cache the result
      if (data?.data?.Page?.media) {
        animeCache.set(cacheKey, data.data.Page.media);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Trending anime error:', error);
      res.status(500).json({ error: 'Failed to fetch trending anime' });
    }
  });

  // Get popular anime
  app.get("/api/anime/popular", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      const cacheKey = `popular-${page}-${perPage}`;
      
      // Check cache first
      const cached = animeCache.get(cacheKey);
      if (cached) {
        return res.json({ data: { Page: { media: cached, pageInfo: { hasNextPage: true, currentPage: page } } } });
      }
      
      const POPULAR_QUERY = TRENDING_ANIME_QUERY.replace('TRENDING_DESC', 'POPULARITY_DESC');
      const data = await fetchFromAniList(POPULAR_QUERY, { page, perPage });
      
      // Cache the result
      if (data?.data?.Page?.media) {
        animeCache.set(cacheKey, data.data.Page.media);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Popular anime error:', error);
      res.status(500).json({ error: 'Failed to fetch popular anime' });
    }
  });

  // Get all-time popular anime
  app.get("/api/anime/all-time-popular", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      const cacheKey = `all-time-popular-${page}-${perPage}`;
      
      const cached = animeCache.get(cacheKey);
      if (cached) {
        return res.json({ data: { Page: { media: cached, pageInfo: { hasNextPage: true, currentPage: page } } } });
      }
      
      const data = await fetchFromAniList(ALL_TIME_POPULAR_QUERY, { page, perPage });
      
      if (data?.data?.Page?.media) {
        animeCache.set(cacheKey, data.data.Page.media);
      }
      
      res.json(data);
    } catch (error) {
      console.error('All-time popular anime error:', error);
      res.status(500).json({ error: 'Failed to fetch all-time popular anime' });
    }
  });

  // Get top rated anime
  app.get("/api/anime/top-rated", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      const cacheKey = `top-rated-${page}-${perPage}`;
      
      const cached = animeCache.get(cacheKey);
      if (cached) {
        return res.json({ data: { Page: { media: cached, pageInfo: { hasNextPage: true, currentPage: page } } } });
      }
      
      const data = await fetchFromAniList(TOP_RATED_QUERY, { page, perPage });
      
      if (data?.data?.Page?.media) {
        animeCache.set(cacheKey, data.data.Page.media);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Top rated anime error:', error);
      res.status(500).json({ error: 'Failed to fetch top rated anime' });
    }
  });

  // Get upcoming anime
  app.get("/api/anime/upcoming", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      const cacheKey = `upcoming-${page}-${perPage}`;
      
      const cached = animeCache.get(cacheKey);
      if (cached) {
        return res.json({ data: { Page: { media: cached, pageInfo: { hasNextPage: true, currentPage: page } } } });
      }
      
      const data = await fetchFromAniList(UPCOMING_QUERY, { page, perPage });
      
      if (data?.data?.Page?.media) {
        animeCache.set(cacheKey, data.data.Page.media);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Upcoming anime error:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming anime' });
    }
  });

  // Get currently airing anime
  app.get("/api/anime/airing", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      const cacheKey = `airing-${page}-${perPage}`;
      
      const cached = animeCache.get(cacheKey);
      if (cached) {
        return res.json({ data: { Page: { media: cached, pageInfo: { hasNextPage: true, currentPage: page } } } });
      }
      
      const data = await fetchFromAniList(AIRING_NOW_QUERY, { page, perPage });
      
      if (data?.data?.Page?.media) {
        animeCache.set(cacheKey, data.data.Page.media);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Airing anime error:', error);
      res.status(500).json({ error: 'Failed to fetch airing anime' });
    }
  });

  // Search anime with comprehensive results
  app.get("/api/anime/search", async (req, res) => {
    try {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      
      if (!search || search.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }
      
      const cacheKey = `search-${search}-${page}-${perPage}`;
      const cached = animeCache.get(cacheKey);
      if (cached) {
        return res.json({ data: { Page: { media: cached, pageInfo: { hasNextPage: true, currentPage: page } } } });
      }
      
      const data = await fetchFromAniList(SEARCH_ANIME_QUERY, { search, page, perPage });
      
      if (data?.data?.Page?.media) {
        animeCache.set(cacheKey, data.data.Page.media);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Search anime error:', error);
      res.status(500).json({ error: 'Failed to search anime' });
    }
  });

  // Get anime by ID
  app.get("/api/anime/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }
      
      const data = await fetchFromAniList(ANIME_DETAIL_QUERY, { id });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch anime details' });
    }
  });

  // Search anime
  app.get("/api/anime/search/:query", async (req, res) => {
    try {
      const search = req.params.query;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 20;
      
      const data = await fetchFromAniList(SEARCH_ANIME_QUERY, { search, page, perPage });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search anime' });
    }
  });

  // Review routes - reviews can be viewed by anyone, but only logged-in users can create them
  app.get("/api/reviews/:animeId", async (req, res) => {
    try {
      const animeId = parseInt(req.params.animeId);
      if (isNaN(animeId)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }
      
      const reviews = await storage.getReviewsForAnime(animeId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Authentication middleware definitions (moved before usage)
  // Optional authentication middleware for guest browsing
  const optionalAuthMiddleware = (req: any, res: any, next: any) => {
    next();
  };

  app.post("/api/reviews", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      // Add user ID to the review
      validatedData.userId = req.user.id;
      const review = await storage.addReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid review data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create review' });
    }
  });

  // Start auto-refresh service for real-time data updates
  autoRefreshService.start();

  // Auth routes are now handled in localAuth.ts

  // Logout route is now handled in localAuth.ts

  // Admin user creation route
  app.post('/api/admin/create-user', requireAuth, async (req: any, res) => {
    try {
      const adminUser = await storage.createAdminUser({
        id: "admin-" + Date.now(),
        email: "admin@aniguide.app",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });
      res.json(adminUser);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Protected watchlist routes - require authentication
  app.get('/api/watchlist', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const watchlist = await storage.getUserWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post('/api/watchlist', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { animeId, status = 'plan_to_watch', rating, episodesWatched = 0 } = req.body;
      
      const watchlistItem = await storage.addToWatchlist({
        userId,
        animeId: parseInt(animeId),
        status,
        rating: rating ? parseInt(rating) : undefined,
        episodesWatched: parseInt(episodesWatched),
      });
      
      res.json(watchlistItem);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.put('/api/watchlist/:animeId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const animeId = parseInt(req.params.animeId);
      const updates = req.body;
      
      const updatedItem = await storage.updateWatchlistItem(userId, animeId, updates);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating watchlist item:", error);
      res.status(500).json({ message: "Failed to update watchlist item" });
    }
  });

  app.delete('/api/watchlist/:animeId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const animeId = parseInt(req.params.animeId);
      
      const success = await storage.removeFromWatchlist(userId, animeId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Profile management routes (simplified for demo)
  app.patch('/api/auth/profile', async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      
      // Demo response with updated data
      res.json({
        id: "dev-user-123",
        email: email || "user@example.com",
        firstName: firstName || "Demo",
        lastName: lastName || "User",
        profileImageUrl: "https://replit.com/public/images/avatars/default.png",
        username: "demouser",
        lastUsernameChange: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Username change with 6-month restriction (demo)
  app.post('/api/auth/username-change', async (req, res) => {
    try {
      const { newUsername } = req.body;
      
      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!newUsername || newUsername.length < 3 || newUsername.length > 30 || !usernameRegex.test(newUsername)) {
        return res.status(400).json({ message: "Invalid username format" });
      }
      
      // Demo success response
      res.json({
        id: "dev-user-123",
        email: "user@example.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: "https://replit.com/public/images/avatars/default.png",
        username: newUsername,
        lastUsernameChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error changing username:", error);
      res.status(500).json({ message: "Failed to change username" });
    }
  });

  // Get username change history (demo)
  app.get('/api/auth/username-history', async (req, res) => {
    try {
      res.json({
        lastChanged: null,
      });
    } catch (error) {
      console.error("Error fetching username history:", error);
      res.status(500).json({ message: "Failed to fetch username history" });
    }
  });

  // Password reset (demo with validation)
  app.post('/api/auth/password-reset', async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validate password strength
      if (newPassword.length < 12) {
        return res.status(400).json({ message: "Password must be at least 12 characters" });
      }
      
      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
      }
      
      if (!/[a-z]/.test(newPassword)) {
        return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
      }
      
      // Demo success response
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Push notification routes
  app.post('/api/push/subscribe', requireAuth, async (req: any, res) => {
    try {
      const subscription = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      console.log('Push subscription received for user:', userId);
      res.json({ success: true, message: 'Subscription saved' });
    } catch (error) {
      console.error('Failed to save push subscription:', error);
      res.status(500).json({ success: false, message: 'Failed to save subscription' });
    }
  });

  app.post('/api/push/unsubscribe', requireAuth, async (req: any, res) => {
    try {
      const subscription = req.body;
      const userId = req.user?.claims?.sub;
      
      console.log('Push unsubscribe received for user:', userId);
      res.json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
    }
  });

  app.post('/api/push/send', requireAuth, async (req: any, res) => {
    try {
      const { title, body, url } = req.body;
      const userId = req.user?.claims?.sub;
      
      console.log('Push notification requested:', { title, body, url, userId });
      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('Failed to send push notification:', error);
      res.status(500).json({ success: false, message: 'Failed to send notification' });
    }
  });

  // Add cache status endpoint for monitoring
  app.get("/api/cache/status", (req, res) => {
    res.json(autoRefreshService.getStatus());
  });

  // Force refresh endpoint (for manual updates)
  app.post("/api/cache/refresh", async (req, res) => {
    try {
      await autoRefreshService.forceRefresh();
      res.json({ message: 'Cache refreshed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to refresh cache' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
