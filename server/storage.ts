import { users, type User, type InsertUser, foodLogs, type FoodLog, type InsertFoodLog, dailyCalories, type DailyCalorie, type InsertDailyCalorie } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodLogs: Map<number, FoodLog>;
  private dailyCalories: Map<number, DailyCalorie>;
  
  private userId: number;
  private foodLogId: number;
  private dailyCalorieId: number;
  
  constructor() {
    this.users = new Map();
    this.foodLogs = new Map();
    this.dailyCalories = new Map();
    
    this.userId = 1;
    this.foodLogId = 1;
    this.dailyCalorieId = 1;
    
    // Add a default user
    this.createUser({
      username: "demo",
      password: "password",
      email: "demo@example.com",
      dailyCalorieGoal: 2000
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, pushNotifications: 1, darkMode: 0 };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Food log methods
  async getFoodLog(id: number): Promise<FoodLog | undefined> {
    return this.foodLogs.get(id);
  }
  
  async getFoodLogsByUserId(userId: number): Promise<FoodLog[]> {
    return Array.from(this.foodLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getFoodLogsByDateRange(userId: number, start: Date, end: Date): Promise<FoodLog[]> {
    return Array.from(this.foodLogs.values())
      .filter(log => {
        const logDate = new Date(log.createdAt);
        return log.userId === userId && 
               logDate >= start && 
               logDate <= end;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createFoodLog(insertLog: InsertFoodLog): Promise<FoodLog> {
    const id = this.foodLogId++;
    const log: FoodLog = { 
      ...insertLog, 
      id, 
      createdAt: new Date() 
    };
    this.foodLogs.set(id, log);
    return log;
  }
  
  // Daily calorie methods
  async getDailyCalorie(id: number): Promise<DailyCalorie | undefined> {
    return this.dailyCalories.get(id);
  }
  
  async getDailyCalorieByDate(userId: number, date: Date): Promise<DailyCalorie | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.dailyCalories.values())
      .find(cal => {
        const calDate = new Date(cal.date);
        return cal.userId === userId && 
               calDate >= startOfDay && 
               calDate <= endOfDay;
      });
  }
  
  async getDailyCaloriesByDateRange(userId: number, start: Date, end: Date): Promise<DailyCalorie[]> {
    return Array.from(this.dailyCalories.values())
      .filter(cal => {
        const calDate = new Date(cal.date);
        return cal.userId === userId && 
               calDate >= start && 
               calDate <= end;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async createDailyCalorie(insertCalorie: InsertDailyCalorie): Promise<DailyCalorie> {
    const id = this.dailyCalorieId++;
    const dailyCalorie: DailyCalorie = { ...insertCalorie, id };
    this.dailyCalories.set(id, dailyCalorie);
    return dailyCalorie;
  }
  
  async updateDailyCalorie(id: number, calorieData: Partial<DailyCalorie>): Promise<DailyCalorie> {
    const dailyCalorie = await this.getDailyCalorie(id);
    if (!dailyCalorie) {
      throw new Error("Daily calorie record not found");
    }
    
    const updatedCalorie = { ...dailyCalorie, ...calorieData };
    this.dailyCalories.set(id, updatedCalorie);
    return updatedCalorie;
  }
}

export const storage = new MemStorage();
