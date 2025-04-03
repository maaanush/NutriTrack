import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../_lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user ID from the URL
  const { id } = req.query;
  const userId = parseInt(id as string);

  // Handle GET requests (get user)
  if (req.method === 'GET') {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } 
  // Handle PATCH requests (update user)
  else if (req.method === 'PATCH') {
    try {
      const updatedUser = await storage.updateUser(userId, req.body);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } 
  // Handle other HTTP methods
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}