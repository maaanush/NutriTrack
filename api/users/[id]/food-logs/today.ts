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
    
    // Set date range for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get food logs for today
    const logs = await storage.getFoodLogsByDateRange(userId, todayStart, todayEnd);
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}