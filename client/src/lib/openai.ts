import { apiRequest } from "./queryClient";
import { FoodRecognitionResult } from "@shared/schema";

// Audio recording and processing
export async function convertAudioToBase64(audioBlob: Blob): Promise<string> {
  // Verify we have audio data
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error("No audio recorded. Please try again and make sure your microphone is working.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Extract the base64 part (remove the data URL prefix)
      const base64Content = base64data.split(",")[1];
      
      if (!base64Content) {
        reject(new Error("Failed to convert audio to base64 format"));
        return;
      }
      
      resolve(base64Content);
    };
    reader.onerror = (event) => {
      console.error("Error reading audio file:", event);
      reject(new Error("Failed to read audio data"));
    };
    reader.readAsDataURL(audioBlob);
  });
}

// Food recognition API
export async function recognizeFood(audioBase64: string): Promise<FoodRecognitionResult> {
  try {
    // Verify we have base64 data
    if (!audioBase64 || audioBase64.trim() === "") {
      throw new Error("No audio data available. Please try recording again.");
    }
    
    // Create an AbortSignal with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await apiRequest("POST", "/api/food-recognition", {
      base64Audio: audioBase64
    });
    
    // Clear the timeout since the request completed
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Try to parse the error response for more details
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Recognition failed: ${response.statusText}`);
      } catch (parseError) {
        // If we can't parse the JSON, just use the status text
        throw new Error(`Recognition failed: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    return data as FoodRecognitionResult;
  } catch (error) {
    console.error("Food recognition error:", error);
    
    // Provide more user-friendly error messages based on the error type
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please check your internet connection and try again.");
    } else if (error.message.includes("API key")) {
      throw new Error("OpenAI API key issue. Please check with the administrator.");
    } else if (error.message.includes("No audio")) {
      throw new Error("No audio was detected. Please try speaking more clearly and ensure your microphone is working.");
    } else if (error.message.includes("Connection")) {
      throw new Error("Connection error while contacting the AI service. Please check your internet connection and try again.");
    }
    
    // Pass through the original error if none of the specific cases match
    throw error;
  }
}
