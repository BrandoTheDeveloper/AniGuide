import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull(),
  userId: text("user_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  season: text("season"),
  episode: integer("episode"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// AniList API types
export interface AnimeMedia {
  id: number;
  title: {
    english?: string;
    romaji: string;
    native?: string;
  };
  coverImage: {
    large: string;
    medium: string;
  };
  description?: string;
  genres: string[];
  startDate: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate: {
    year?: number;
    month?: number;
    day?: number;
  };
  status: string;
  averageScore?: number;
  tags: Array<{
    name: string;
  }>;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
  };
  episodes?: number;
  season?: string;
  seasonYear?: number;
  relations?: {
    edges: Array<{
      id: number;
      relationType: string;
      node: {
        id: number;
        title: {
          english?: string;
          romaji: string;
        };
        type: string;
        format: string;
        episodes?: number;
        coverImage: {
          medium: string;
        };
      };
    }>;
  };
}

export interface AniListResponse {
  data: {
    Page: {
      media: AnimeMedia[];
      pageInfo: {
        hasNextPage: boolean;
        currentPage: number;
      };
    };
  };
}

export interface AnimeSearchResponse {
  data: {
    Page: {
      media: AnimeMedia[];
    };
  };
}
