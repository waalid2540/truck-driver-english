import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
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

// User table with Replit Auth and Stripe integration
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Changed to varchar for Replit user IDs
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  name: text("name"),
  experienceLevel: text("experience_level").notNull().default("beginner"),
  practiceStreak: integer("practice_streak").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(0),
  dailyReminders: boolean("daily_reminders").notNull().default(true),
  voicePractice: boolean("voice_practice").notNull().default(false),
  sessionDuration: integer("session_duration").notNull().default(10),
  darkMode: boolean("dark_mode").notNull().default(false),
  // Stripe integration fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"), // free, active, canceled, past_due
  subscriptionEndDate: timestamp("subscription_end_date"),
  // Conversation limits
  conversationsUsed: integer("conversations_used").notNull().default(0),
  conversationLimit: integer("conversation_limit").notNull().default(10), // 10 free conversations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dotCategories = pgTable("dot_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  questionsCount: integer("questions_count").notNull().default(0),
});

export const dotQuestions = pgTable("dot_questions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
});

export const practiceSessions = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'dot' or 'conversation'
  categoryId: integer("category_id"), // for DOT practice
  duration: integer("duration").notNull(), // in minutes
  score: integer("score"), // percentage for DOT practice
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertDotCategorySchema = createInsertSchema(dotCategories).omit({
  id: true,
});

export const insertDotQuestionSchema = createInsertSchema(dotQuestions).omit({
  id: true,
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSessions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type DotCategory = typeof dotCategories.$inferSelect;
export type InsertDotCategory = z.infer<typeof insertDotCategorySchema>;

export type DotQuestion = typeof dotQuestions.$inferSelect;
export type InsertDotQuestion = z.infer<typeof insertDotQuestionSchema>;

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
