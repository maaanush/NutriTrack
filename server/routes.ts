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
      // Check if API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
        return res.status(500).json({ 
          message: "OpenAI API key not configured",
          error: "Missing API key" 
        });
      }
      
      // Validate input
      const schema = z.object({
        base64Audio: z.string(),
      });
      
      const { base64Audio } = schema.parse(req.body);
      
      // Verify that audio data exists
      if (!base64Audio || base64Audio.trim() === "") {
        return res.status(400).json({ 
          message: "No audio recorded",
          error: "Empty audio data" 
        });
      }
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Audio, 'base64');
      
      // Check if buffer has data
      if (buffer.length === 0) {
        return res.status(400).json({ 
          message: "No audio recorded",
          error: "Empty buffer" 
        });
      }
      
      // Call Whisper API for transcription with retries
      let transcriptionError = null;
      let transcription = null;
      
      // Try up to 3 times with increasing delays between retries
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          // Create a File object from the buffer for the OpenAI API
          const blob = new Blob([buffer], { type: "audio/wav" });
          const file = new File([blob], "recording.wav", { type: "audio/wav" });
          
          transcription = await openai.audio.transcriptions.create({
            file,
            model: "whisper-1",
          });
          
          transcriptionError = null;
          break; // Success, exit the retry loop
        } catch (err) {
          const error = err as Error;
          transcriptionError = error;
          console.log(`Transcription attempt ${attempt + 1} failed:`, error.message);
          
          // Wait before retrying (exponential backoff)
          if (attempt < 2) { // Don't wait after the last attempt
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      }
      
      if (transcriptionError || !transcription) {
        throw transcriptionError || new Error("Transcription failed after multiple attempts");
      }
      
      const transcript = transcription.text;
      
      if (!transcript || transcript.trim() === "") {
        return res.status(400).json({ 
          message: "No speech detected in the recording",
          error: "Empty transcription" 
        });
      }
      
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
      
      // Parse the OpenAI response safely
      const content = completion.choices[0].message.content || "{}";
      const foodResult = JSON.parse(content);
      
      // Validate the response against our schema
      const response = foodRecognitionSchema.parse({
        transcript,
        foodItems: foodResult.foodItems || [],
        totalCalories: foodResult.totalCalories || 0
      });
      
      res.json(response);
    } catch (error: any) {
      console.error("Food recognition error:", error);
      res.status(400).json({ 
        message: "Failed to process food recognition",
        error: error.message || "Unknown error" 
      });
    }
  });
  
  // Analyze food from text input
  app.post("/api/analyze-food", async (req, res) => {
    try {
      // Check if API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
        return res.status(500).json({ 
          message: "OpenAI API key not configured",
          error: "Missing API key" 
        });
      }
      
      // Validate input
      const schema = z.object({
        foodText: z.string().min(1, "Please enter what you ate")
      });
      
      const { foodText } = schema.parse(req.body);
      
      // Use GPT-4o to analyze the food description and estimate calories
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert. Analyze the user's food description and provide detailed calorie content.
            Extract all food items mentioned and estimate their calories accurately.
            Break down meals into individual components for more accurate tracking.
            Format your response as valid JSON with this structure:
            { 
              "foodItems": [
                { "name": "food item 1", "calories": estimated_calories_as_number }, 
                { "name": "food item 2", "calories": estimated_calories_as_number }
              ], 
              "totalCalories": sum_of_all_calories 
            }`
          },
          {
            role: "user",
            content: `Analyze this food description and provide calorie estimates: "${foodText}"`
          }
        ],
      });
      
      // Parse the OpenAI response safely
      const content = completion.choices[0].message.content || "{}";
      const foodResult = JSON.parse(content);
      
      // Validate the response against our schema
      const response = foodRecognitionSchema.parse({
        transcript: foodText,
        foodItems: foodResult.foodItems || [],
        totalCalories: foodResult.totalCalories || 0
      });
      
      res.json(response);
    } catch (error: any) {
      console.error("Food analysis error:", error);
      res.status(400).json({ 
        message: "Failed to analyze food description",
        error: error.message || "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
