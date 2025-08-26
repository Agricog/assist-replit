import {
  users,
  chatMessages,
  farmFields,
  weatherCache,
  type User,
  type UpsertUser,
  type InsertChatMessage,
  type ChatMessage,
  type InsertFarmField,
  type FarmField,
  type WeatherCache,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Chat operations
  getChatHistory(userId: string, chatType: string): Promise<ChatMessage[]>;
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Farm data operations
  getFarmFields(userId: string): Promise<FarmField[]>;
  createFarmField(field: InsertFarmField): Promise<FarmField>;
  updateFarmField(id: string, field: Partial<InsertFarmField>): Promise<FarmField>;
  deleteFarmField(id: string): Promise<void>;
  
  // Weather operations
  getWeatherCache(postcode: string): Promise<WeatherCache | undefined>;
  saveWeatherCache(postcode: string, data: any, expiresAt: Date): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async getChatHistory(userId: string, chatType: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.userId, userId), eq(chatMessages.chatType, chatType)))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);
  }

  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [savedMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return savedMessage;
  }

  async getFarmFields(userId: string): Promise<FarmField[]> {
    return await db
      .select()
      .from(farmFields)
      .where(eq(farmFields.userId, userId))
      .orderBy(desc(farmFields.createdAt));
  }

  async createFarmField(field: InsertFarmField): Promise<FarmField> {
    const [savedField] = await db
      .insert(farmFields)
      .values(field)
      .returning();
    return savedField;
  }

  async updateFarmField(id: string, field: Partial<InsertFarmField>): Promise<FarmField> {
    const [updatedField] = await db
      .update(farmFields)
      .set({ ...field, updatedAt: new Date() })
      .where(eq(farmFields.id, id))
      .returning();
    return updatedField;
  }

  async deleteFarmField(id: string): Promise<void> {
    await db.delete(farmFields).where(eq(farmFields.id, id));
  }

  async getWeatherCache(postcode: string): Promise<WeatherCache | undefined> {
    const [cache] = await db
      .select()
      .from(weatherCache)
      .where(eq(weatherCache.postcode, postcode));
    
    if (cache && cache.expiresAt > new Date()) {
      return cache;
    }
    return undefined;
  }

  async saveWeatherCache(postcode: string, data: any, expiresAt: Date): Promise<void> {
    await db
      .insert(weatherCache)
      .values({ postcode, data, expiresAt })
      .onConflictDoUpdate({
        target: weatherCache.postcode,
        set: { data, expiresAt, createdAt: new Date() },
      });
  }
}

export const storage = new DatabaseStorage();
