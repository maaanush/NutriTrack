import OpenAI from 'openai';
import { foodRecognitionSchema } from '../../shared/schema';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Process audio for food recognition
export async function processAudioForFood(base64Audio: string) {
  try {
    // Convert base64 to buffer for Whisper API
    const buffer = Buffer.from(base64Audio, 'base64');
    
    // Create a File object from the buffer
    const audioBlob = new Blob([buffer]);
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    
    // Use Whisper API to transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    });
    
    // If transcription was successful, analyze the text
    if (transcription.text) {
      const result = await analyzeFoodText(transcription.text);
      return {
        transcription: transcription.text,
        ...result
      };
    } else {
      throw new Error('No transcription was generated');
    }
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
}

// Analyze food text to extract food items and calories
export async function analyzeFoodText(foodText: string) {
  try {
    // Create a prompt for GPT-4 to analyze the food text
    const prompt = `
      I ate the following: "${foodText}". 
      
      Please identify all the food items I mentioned and estimate their calorie content.
      
      Return the results in the exact JSON format below:
      {
        "items": [
          {
            "name": "food item name",
            "calories": estimated calories (number)
          }
        ],
        "totalCalories": sum of all calories (number)
      }
      
      Be specific with the food items, and give reasonable calorie estimates based on standard portions.
      Only include food items, not drinks like water. If a quantity is mentioned, account for it.
      IMPORTANT: Your entire response should be ONLY the JSON object, nothing else.
    `;

    // Use GPT-4o for analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });

    // Parse the response and validate against our schema
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const result = JSON.parse(content);
    return foodRecognitionSchema.parse(result);
  } catch (error) {
    console.error('Error analyzing food text:', error);
    throw error;
  }
}