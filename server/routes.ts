import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { foodRecognitionSchema, insertFoodLogSchema } from "@shared/schema";
import OpenAI from "openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  // Create a new user
  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get a user
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update a user's profile (including calorie goal)
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login user
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ id: user.id, username: user.username, dailyCalorieGoal: user.dailyCalorieGoal });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get food logs for a user for today
  app.get("/api/users/:id/food-logs/today", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const logs = await storage.getFoodLogsByDateRange(userId, todayStart, todayEnd);
      res.json(logs);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get food logs for a date range
  app.get("/api/users/:id/food-logs", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const startParam = req.query.start as string;
      const endParam = req.query.end as string;
      
      const start = startParam ? new Date(startParam) : new Date();
      start.setHours(0, 0, 0, 0);
      
      const end = endParam ? new Date(endParam) : new Date();
      end.setHours(23, 59, 59, 999);
      
      const logs = await storage.getFoodLogsByDateRange(userId, start, end);
      res.json(logs);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Add a food log entry
  app.post("/api/users/:id/food-logs", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const logData = insertFoodLogSchema.parse({
        ...req.body,
        userId
      });
      
      const log = await storage.createFoodLog(logData);
      
      // Update daily calories
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let dailyCalorie = await storage.getDailyCalorieByDate(userId, today);
      
      if (dailyCalorie) {
        dailyCalorie = await storage.updateDailyCalorie(
          dailyCalorie.id,
          { totalCalories: dailyCalorie.totalCalories + log.calories }
        );
      } else {
        dailyCalorie = await storage.createDailyCalorie({
          userId,
          date: today,
          totalCalories: log.calories
        });
      }
      
      res.json({ log, dailyCalorie });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get daily calories for a date range
  app.get("/api/users/:id/daily-calories", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const startParam = req.query.start as string;
      const endParam = req.query.end as string;
      
      const start = startParam ? new Date(startParam) : new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 7); // Default to last 7 days
      
      const end = endParam ? new Date(endParam) : new Date();
      end.setHours(23, 59, 59, 999);
      
      const dailyCalories = await storage.getDailyCaloriesByDateRange(userId, start, end);
      res.json(dailyCalories);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Process audio for food recognition
  app.post("/api/food-recognition", async (req, res) => {
    try {
      // Validate input
      const schema = z.object({
        base64Audio: z.string(),
      });
      
      const { base64Audio } = schema.parse(req.body);
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Audio, 'base64');
      
      // Call Whisper API for transcription
      const transcription = await openai.audio.transcriptions.create({
        file: {
          data: buffer,
          name: "recording.wav",
        },
        model: "whisper-1",
      });
      
      const transcript = transcription.text;
      
      // Use GPT-4 to identify food items and estimate calories
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Identify the food items mentioned in the transcribed text and estimate their calorie content. Provide the results in JSON format with the following structure: { foodItems: [{ name: string, calories: number }], totalCalories: number }"
          },
          {
            role: "user",
            content: transcript
          }
        ],
      });
      
      const foodResult = JSON.parse(completion.choices[0].message.content);
      
      // Validate the response against our schema
      const response = foodRecognitionSchema.parse({
        transcript,
        foodItems: foodResult.foodItems,
        totalCalories: foodResult.totalCalories
      });
      
      res.json(response);
    } catch (error) {
      console.error("Food recognition error:", error);
      res.status(400).json({ 
        message: "Failed to process food recognition",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
