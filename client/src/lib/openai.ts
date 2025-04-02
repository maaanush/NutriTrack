import { apiRequest } from "./queryClient";
import { FoodRecognitionResult } from "@shared/schema";

// Audio recording and processing
export async function convertAudioToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Extract the base64 part (remove the data URL prefix)
      const base64Content = base64data.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

// Food recognition API
export async function recognizeFood(audioBase64: string): Promise<FoodRecognitionResult> {
  try {
    const response = await apiRequest("POST", "/api/food-recognition", {
      base64Audio: audioBase64
    });
    
    if (!response.ok) {
      throw new Error(`Recognition failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as FoodRecognitionResult;
  } catch (error) {
    console.error("Food recognition error:", error);
    throw error;
  }
}
