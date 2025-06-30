import { users, reviews, watchlist, type User, type UpsertUser, type Review, type InsertReview, type WatchlistItem, type InsertWatchlistItem } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User>;
  updateUsername(id: string, username: string): Promise<User>;
  createAdminUser(userData: UpsertUser): Promise<User>;
  // Review operations
  getReviewsForAnime(animeId: number): Promise<Review[]>;
  addReview(review: InsertReview): Promise<Review>;
  // Watchlist operations
  getUserWatchlist(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  updateWatchlistItem(userId: string, animeId: number, updates: Partial<WatchlistItem>): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, animeId: number): Promise<boolean>;
  getWatchlistItem(userId: string, animeId: number): Promise<WatchlistItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getReviewsForAnime(animeId: number): Promise<Review[]> {
    const reviewList = await db.select().from(reviews).where(eq(reviews.animeId, animeId));
    return reviewList;
  }

  async addReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUsername(id: string, username: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        username,
        lastUsernameChange: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async createAdminUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        isAdmin: true,
      })
      .returning();
    return user;
  }

  // Watchlist operations
  async getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
    return await db.select().from(watchlist).where(eq(watchlist.userId, userId));
  }

  async addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem> {
    const [watchlistItem] = await db
      .insert(watchlist)
      .values(item)
      .onConflictDoUpdate({
        target: [watchlist.userId, watchlist.animeId],
        set: {
          status: item.status,
          rating: item.rating,
          episodesWatched: item.episodesWatched,
          updatedAt: new Date(),
        },
      })
      .returning();
    return watchlistItem;
  }

  async updateWatchlistItem(userId: string, animeId: number, updates: Partial<WatchlistItem>): Promise<WatchlistItem> {
    const [item] = await db
      .update(watchlist)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(watchlist.userId, userId), eq(watchlist.animeId, animeId)))
      .returning();
    return item;
  }

  async removeFromWatchlist(userId: string, animeId: number): Promise<boolean> {
    const result = await db
      .delete(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.animeId, animeId)));
    return (result.rowCount || 0) > 0;
  }

  async getWatchlistItem(userId: string, animeId: number): Promise<WatchlistItem | undefined> {
    const [item] = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.animeId, animeId)));
    return item;
  }
}

export const storage = new DatabaseStorage();
