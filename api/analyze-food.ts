import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeFoodText } from './_lib/openai';
import { foodTextSchema } from './_lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Rate limiting could be added here
    
    // Validate request body
    const { text } = foodTextSchema.parse(req.body);
    
    // Analyze the food text using OpenAI
    const result = await analyzeFoodText(text);
    
    // Return the result
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in food text analysis API:', error);
    
    // Determine if it's an OpenAI API error
    if (error.name === 'OpenAIError' || error.message?.includes('OpenAI')) {
      return res.status(502).json({ 
        message: 'OpenAI API error. Please try again later.',
        error: error.message
      });
    }
    
    // Otherwise, return a 400 Bad Request
    res.status(400).json({ message: error.message });
  }
}