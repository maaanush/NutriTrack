import { z } from 'zod';

// User login schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Audio input schema
export const audioSchema = z.object({
  audio: z.string(), // Base64 encoded audio
});

// Food text schema
export const foodTextSchema = z.object({
  text: z.string().min(1, 'Food description is required'),
});