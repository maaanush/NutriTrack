import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../_lib/db';
import { insertFoodLogSchema } from '../../../_lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user ID from the URL
  const { id } = req.query;
  const userId = parseInt(id as string);

  // Handle GET requests
  if (req.method === 'GET') {
    try {
      // Get date range from query parameters
      const startParam = req.query.start as string;
      const endParam = req.query.end as string;
      
      const start = startParam ? new Date(startParam) : new Date();
      start.setHours(0, 0, 0, 0);
      
      const end = endParam ? new Date(endParam) : new Date();
      end.setHours(23, 59, 59, 999);
      
      // Get food logs for the date range
      const logs = await storage.getFoodLogsByDateRange(userId, start, end);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } 
  // Handle POST requests
  else if (req.method === 'POST') {
    try {
      // Parse and validate the request body
      const logData = insertFoodLogSchema.parse({
        ...req.body,
        userId
      });
      
      // Create the food log
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
      
      res.status(200).json({ log, dailyCalorie });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } 
  // Handle other HTTP methods
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}