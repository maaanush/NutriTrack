import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../_lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user ID from the URL
    const { id } = req.query;
    const userId = parseInt(id as string);
    
    // Get date range from query parameters
    const startParam = req.query.start as string;
    const endParam = req.query.end as string;
    
    const start = startParam ? new Date(startParam) : new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 7); // Default to last 7 days
    
    const end = endParam ? new Date(endParam) : new Date();
    end.setHours(23, 59, 59, 999);
    
    // Get daily calories for the date range
    const dailyCalories = await storage.getDailyCaloriesByDateRange(userId, start, end);
    res.status(200).json(dailyCalories);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}