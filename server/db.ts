import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { eq, and, gte, lte } from 'drizzle-orm';

const { Pool } = pg;
import { 
  users, type User, type InsertUser,
  foodLogs, type FoodLog, type InsertFoodLog,
  dailyCalories, type DailyCalorie, type InsertDailyCalorie 
} from '@shared/schema';
import { IStorage } from './storage';

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle instance
export const db = drizzle(pool);

export class PgStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...user,
      pushNotifications: 1,
      darkMode: 0
    }).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("User not found");
    }
    
    return result[0];
  }

  // Food log operations
  async getFoodLog(id: number): Promise<FoodLog | undefined> {
    const result = await db.select().from(foodLogs).where(eq(foodLogs.id, id)).limit(1);
    return result[0];
  }

  async getFoodLogsByUserId(userId: number): Promise<FoodLog[]> {
    return await db.select()
      .from(foodLogs)
      .where(eq(foodLogs.userId, userId))
      .orderBy(foodLogs.createdAt);
  }

  async getFoodLogsByDateRange(userId: number, start: Date, end: Date): Promise<FoodLog[]> {
    return await db.select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, userId),
          gte(foodLogs.createdAt, start),
          lte(foodLogs.createdAt, end)
        )
      )
      .orderBy(foodLogs.createdAt);
  }

  async createFoodLog(log: InsertFoodLog): Promise<FoodLog> {
    const result = await db.insert(foodLogs)
      .values(log)
      .returning();
    
    return result[0];
  }

  // Daily calorie operations
  async getDailyCalorie(id: number): Promise<DailyCalorie | undefined> {
    const result = await db.select().from(dailyCalories).where(eq(dailyCalories.id, id)).limit(1);
    return result[0];
  }

  async getDailyCalorieByDate(userId: number, date: Date): Promise<DailyCalorie | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await db.select()
      .from(dailyCalories)
      .where(
        and(
          eq(dailyCalories.userId, userId),
          gte(dailyCalories.date, startOfDay),
          lte(dailyCalories.date, endOfDay)
        )
      )
      .limit(1);
    
    return result[0];
  }

  async getDailyCaloriesByDateRange(userId: number, start: Date, end: Date): Promise<DailyCalorie[]> {
    return await db.select()
      .from(dailyCalories)
      .where(
        and(
          eq(dailyCalories.userId, userId),
          gte(dailyCalories.date, start),
          lte(dailyCalories.date, end)
        )
      )
      .orderBy(dailyCalories.date);
  }

  async createDailyCalorie(dailyCalorie: InsertDailyCalorie): Promise<DailyCalorie> {
    const result = await db.insert(dailyCalories)
      .values(dailyCalorie)
      .returning();
    
    return result[0];
  }

  async updateDailyCalorie(id: number, calorieData: Partial<DailyCalorie>): Promise<DailyCalorie> {
    const result = await db.update(dailyCalories)
      .set(calorieData)
      .where(eq(dailyCalories.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Daily calorie record not found");
    }
    
    return result[0];
  }
}

// Initialize default user
export async function initializeDatabase() {
  // Check if demo user exists
  const existingUser = await db.select()
    .from(users)
    .where(eq(users.username, 'demo'))
    .limit(1);
  
  // If no demo user, create one
  if (existingUser.length === 0) {
    await db.insert(users).values({
      username: 'demo',
      password: 'password',
      email: 'demo@example.com',
      dailyCalorieGoal: 2000,
      pushNotifications: 1,
      darkMode: 0
    });
  }
}

// The PgStorage class is exported but we'll instantiate it in server/index.ts