import { promises as fs } from 'fs';
import path from 'path';
import { IStorage } from './storage';
import { User, InsertUser, FoodLog, InsertFoodLog, DailyCalorie, InsertDailyCalorie } from '@shared/schema';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Initial data structure
interface DataStore {
  users: User[];
  foodLogs: FoodLog[];
  dailyCalories: DailyCalorie[];
  counters: {
    userId: number;
    foodLogId: number;
    dailyCalorieId: number;
  };
}

// Default data
const initialData: DataStore = {
  users: [
    // Demo user
    {
      id: 1,
      username: 'demo',
      password: 'password',
      email: 'demo@example.com',
      dailyCalorieGoal: 2000,
      pushNotifications: 1,
      darkMode: 0
    }
  ],
  foodLogs: [],
  dailyCalories: [],
  counters: {
    userId: 2, // Start after demo user
    foodLogId: 1,
    dailyCalorieId: 1
  }
};

export class JsonStorage implements IStorage {
  private dataCache: DataStore | null = null;

  // Load data from JSON file
  private async loadData(): Promise<DataStore> {
    if (this.dataCache) {
      return this.dataCache;
    }

    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      this.dataCache = JSON.parse(data) as DataStore;
      return this.dataCache;
    } catch (error) {
      // If file doesn't exist or has invalid JSON, create with initial data
      await this.saveData(initialData);
      this.dataCache = initialData;
      return initialData;
    }
  }

  // Save data to JSON file
  private async saveData(data: DataStore): Promise<void> {
    this.dataCache = data;
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const data = await this.loadData();
    return data.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const data = await this.loadData();
    return data.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const data = await this.loadData();
    const id = data.counters.userId++;
    
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      dailyCalorieGoal: insertUser.dailyCalorieGoal || 2000,
      pushNotifications: 1,
      darkMode: 0
    };
    
    data.users.push(user);
    await this.saveData(data);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const data = await this.loadData();
    const userIndex = data.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = {
      ...data.users[userIndex],
      ...userData
    };
    
    data.users[userIndex] = updatedUser;
    await this.saveData(data);
    return updatedUser;
  }

  // Food log operations
  async getFoodLog(id: number): Promise<FoodLog | undefined> {
    const data = await this.loadData();
    return data.foodLogs.find(log => log.id === id);
  }

  async getFoodLogsByUserId(userId: number): Promise<FoodLog[]> {
    const data = await this.loadData();
    return data.foodLogs.filter(log => log.userId === userId);
  }

  async getFoodLogsByDateRange(userId: number, start: Date, end: Date): Promise<FoodLog[]> {
    const data = await this.loadData();
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    return data.foodLogs.filter(log => {
      // Ensure we have a valid date object
      const logDate = log.createdAt instanceof Date 
        ? log.createdAt 
        : new Date(String(log.createdAt));
      
      const logTime = logDate.getTime();
      return log.userId === userId && logTime >= startTime && logTime <= endTime;
    });
  }

  async createFoodLog(insertLog: InsertFoodLog): Promise<FoodLog> {
    const data = await this.loadData();
    const id = data.counters.foodLogId++;
    
    const log: FoodLog = {
      ...insertLog,
      id,
      createdAt: new Date()
    };
    
    data.foodLogs.push(log);
    await this.saveData(data);
    return log;
  }

  // Daily calorie operations
  async getDailyCalorie(id: number): Promise<DailyCalorie | undefined> {
    const data = await this.loadData();
    return data.dailyCalories.find(calorie => calorie.id === id);
  }

  async getDailyCalorieByDate(userId: number, date: Date): Promise<DailyCalorie | undefined> {
    const data = await this.loadData();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return data.dailyCalories.find(calorie => {
      // Ensure we have a valid date object
      const calorieDate = calorie.date instanceof Date 
        ? new Date(calorie.date) 
        : new Date(String(calorie.date));
      
      calorieDate.setHours(0, 0, 0, 0);
      
      return (
        calorie.userId === userId &&
        calorieDate.getTime() === targetDate.getTime()
      );
    });
  }

  async getDailyCaloriesByDateRange(userId: number, start: Date, end: Date): Promise<DailyCalorie[]> {
    const data = await this.loadData();
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    return data.dailyCalories.filter(calorie => {
      // Ensure we have a valid date object
      const calorieDate = calorie.date instanceof Date 
        ? calorie.date 
        : new Date(String(calorie.date));
      
      const calorieTime = calorieDate.getTime();
      return calorie.userId === userId && calorieTime >= startTime && calorieTime <= endTime;
    });
  }

  async createDailyCalorie(insertCalorie: InsertDailyCalorie): Promise<DailyCalorie> {
    const data = await this.loadData();
    const id = data.counters.dailyCalorieId++;
    
    const dailyCalorie: DailyCalorie = {
      ...insertCalorie,
      id
    };
    
    data.dailyCalories.push(dailyCalorie);
    await this.saveData(data);
    return dailyCalorie;
  }

  async updateDailyCalorie(id: number, calorieData: Partial<DailyCalorie>): Promise<DailyCalorie> {
    const data = await this.loadData();
    const calorieIndex = data.dailyCalories.findIndex(calorie => calorie.id === id);
    
    if (calorieIndex === -1) {
      throw new Error(`Daily calorie with ID ${id} not found`);
    }
    
    const updatedCalorie = {
      ...data.dailyCalories[calorieIndex],
      ...calorieData
    };
    
    data.dailyCalories[calorieIndex] = updatedCalorie;
    await this.saveData(data);
    return updatedCalorie;
  }
}