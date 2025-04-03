import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from './_lib/db';
import { loginSchema } from './_lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate login data
    const { username, password } = loginSchema.parse(req.body);
    
    // Check if user exists
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Simple password check (in a real app, use proper password hashing)
    if (password !== 'password') { // Demo password
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Return user data (excluding sensitive fields if needed)
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}