import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../_lib/db';
import { insertUserSchema } from '../_lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate user data
    const userData = insertUserSchema.parse(req.body);
    
    // Create new user
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}