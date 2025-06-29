import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReviewSchema } from "@shared/schema";
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
  // Get trending anime
  app.get("/api/anime/trending", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 20;
      
      const data = await fetchFromAniList(TRENDING_ANIME_QUERY, { page, perPage });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trending anime' });
    }
  });

  // Get popular anime
  app.get("/api/anime/popular", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 20;
      
      const POPULAR_QUERY = TRENDING_ANIME_QUERY.replace('TRENDING_DESC', 'POPULARITY_DESC');
      const data = await fetchFromAniList(POPULAR_QUERY, { page, perPage });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch popular anime' });
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

  // Review routes
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

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.addReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid review data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create review' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
