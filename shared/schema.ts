import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for auth and profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
  pushNotifications: integer("push_notifications").default(1),
  darkMode: integer("dark_mode").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  dailyCalorieGoal: true,
});

// Food logs for tracking
export const foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFoodLogSchema = createInsertSchema(foodLogs).pick({
  userId: true,
  foodName: true,
  calories: true,
});

// Daily calorie summaries
export const dailyCalories = pgTable("daily_calories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  totalCalories: integer("total_calories").notNull(),
});

export const insertDailyCaloriesSchema = createInsertSchema(dailyCalories).pick({
  userId: true,
  date: true,
  totalCalories: true,
});

// Food recognition type
export const foodRecognitionSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    calories: z.number(),
  })),
  totalCalories: z.number(),
  transcription: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FoodLog = typeof foodLogs.$inferSelect;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;

export type DailyCalorie = typeof dailyCalories.$inferSelect;
export type InsertDailyCalorie = z.infer<typeof insertDailyCaloriesSchema>;

export type FoodRecognitionResult = z.infer<typeof foodRecognitionSchema>;
