import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports both Replit Auth and traditional signup)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  farmName: varchar("farm_name"),
  location: varchar("location"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  // Traditional authentication fields
  username: varchar("username").unique(),
  password: varchar("password"), // hashed password
  authType: varchar("auth_type").default("replit"), // "replit" or "traditional"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  chatType: varchar("chat_type").notNull(), // 'market' or 'farm'
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Farm fields table
export const farmFields = pgTable("farm_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fieldName: varchar("field_name").notNull(),
  size: decimal("size", { precision: 10, scale: 2 }).notNull(),
  cropType: varchar("crop_type").notNull(),
  soilType: varchar("soil_type").notNull(),
  expectedYield: decimal("expected_yield", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weather cache table
export const weatherCache = pgTable("weather_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: varchar("location").notNull(),
  data: jsonb("data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Machinery service table
export const machinery = pgTable("machinery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  lastServiceDate: timestamp("last_service_date"),
  serviceInterval: integer("service_interval").notNull(), // days
  status: varchar("status").notNull(), // 'good', 'service_due_soon', 'overdue'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  authType: true,
  profileImageUrl: true,
  farmName: true,
  location: true,
  onboardingCompleted: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertFarmFieldSchema = createInsertSchema(farmFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  size: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Size must be a positive number"),
  expectedYield: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Expected yield must be a positive number").optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Registration type for traditional signup
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertFarmField = z.infer<typeof insertFarmFieldSchema>;
export type FarmField = typeof farmFields.$inferSelect;
export type WeatherCache = typeof weatherCache.$inferSelect;

export const insertMachinerySchema = createInsertSchema(machinery).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMachinery = z.infer<typeof insertMachinerySchema>;
export type Machinery = typeof machinery.$inferSelect;
