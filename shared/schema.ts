import { pgTable, text, serial, integer, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  lastUsernameChange: timestamp("last_username_change"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  season: text("season"),
  episode: integer("episode"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  timestamp: true,
});

export type UpsertUser = typeof users.$inferInsert;
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
