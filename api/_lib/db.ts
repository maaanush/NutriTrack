import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte } from 'drizzle-orm';
import { 
  users, foodLogs, dailyCalories,
  type User, type InsertUser,
  type FoodLog, type InsertFoodLog,
  type DailyCalorie, type InsertDailyCalorie
} from '../../shared/schema';

// Create a postgres pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Create a drizzle instance
export const db = drizzle(pool);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Food log operations
  getFoodLog(id: number): Promise<FoodLog | undefined>;
  getFoodLogsByUserId(userId: number): Promise<FoodLog[]>;
  getFoodLogsByDateRange(userId: number, start: Date, end: Date): Promise<FoodLog[]>;
  createFoodLog(log: InsertFoodLog): Promise<FoodLog>;
  
  // Daily calorie operations
  getDailyCalorie(id: number): Promise<DailyCalorie | undefined>;
  getDailyCalorieByDate(userId: number, date: Date): Promise<DailyCalorie | undefined>;
  getDailyCaloriesByDateRange(userId: number, start: Date, end: Date): Promise<DailyCalorie[]>;
  createDailyCalorie(dailyCalorie: InsertDailyCalorie): Promise<DailyCalorie>;
  updateDailyCalorie(id: number, dailyCalorie: Partial<DailyCalorie>): Promise<DailyCalorie>;
}

// PostgreSQL Storage Implementation
export class PgStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getFoodLog(id: number): Promise<FoodLog | undefined> {
    const [log] = await db.select().from(foodLogs).where(eq(foodLogs.id, id));
    return log;
  }

  async getFoodLogsByUserId(userId: number): Promise<FoodLog[]> {
    return db.select().from(foodLogs).where(eq(foodLogs.userId, userId));
  }

  async getFoodLogsByDateRange(userId: number, start: Date, end: Date): Promise<FoodLog[]> {
    return db
      .select()
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

  async createFoodLog(insertLog: InsertFoodLog): Promise<FoodLog> {
    const [log] = await db
      .insert(foodLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getDailyCalorie(id: number): Promise<DailyCalorie | undefined> {
    const [dailyCalorie] = await db.select().from(dailyCalories).where(eq(dailyCalories.id, id));
    return dailyCalorie;
  }

  async getDailyCalorieByDate(userId: number, date: Date): Promise<DailyCalorie | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [dailyCalorie] = await db
      .select()
      .from(dailyCalories)
      .where(
        and(
          eq(dailyCalories.userId, userId),
          gte(dailyCalories.date, startOfDay),
          lte(dailyCalories.date, endOfDay)
        )
      );
    
    return dailyCalorie;
  }

  async getDailyCaloriesByDateRange(userId: number, start: Date, end: Date): Promise<DailyCalorie[]> {
    return db
      .select()
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

  async createDailyCalorie(insertCalorie: InsertDailyCalorie): Promise<DailyCalorie> {
    const [dailyCalorie] = await db
      .insert(dailyCalories)
      .values(insertCalorie)
      .returning();
    return dailyCalorie;
  }

  async updateDailyCalorie(id: number, calorieData: Partial<DailyCalorie>): Promise<DailyCalorie> {
    const [dailyCalorie] = await db
      .update(dailyCalories)
      .set(calorieData)
      .where(eq(dailyCalories.id, id))
      .returning();
    return dailyCalorie;
  }
}

// Create and export a storage instance
export const storage: IStorage = new PgStorage();