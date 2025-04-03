import { useState, useRef, useCallback } from "react";
import { convertAudioToBase64, recognizeFood } from "@/lib/openai";
import { FoodRecognitionResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Check for internet connection
const checkInternetConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch a small resource to test connection
    const response = await fetch('/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' } 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [foodResult, setFoodResult] = useState<FoodRecognitionResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  
  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Check internet connection
      const isOnline = await checkInternetConnection();
      setIsOfflineMode(!isOnline);
      
      if (!isOnline) {
        toast({
          title: "Offline Mode",
          description: "You're currently offline. You'll be able to manually enter food items after recording.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) {
      return;
    }
    
    return new Promise<Blob>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current as MediaRecorder;
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks in the stream
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach(track => track.stop());
        
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        resolve(audioBlob);
      };
      
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
    });
  }, [isRecording]);
  
  const processRecording = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      // Stop recording and get the audio blob
      const audioBlob = await stopRecording();
      
      if (!audioBlob) {
        throw new Error("No audio recorded");
      }
      
      // Check if we're in offline mode
      const isOnline = await checkInternetConnection();
      setIsOfflineMode(!isOnline);
      
      if (!isOnline) {
        // Show manual entry dialog in offline mode
        setFoodResult({
          transcription: "Manual entry (offline mode)",
          items: [],
          totalCalories: 0
        });
        setShowResults(true);
        return;
      }
      
      // Convert audio to base64
      const base64Audio = await convertAudioToBase64(audioBlob);
      
      // Send to server for processing
      const result = await recognizeFood(base64Audio);
      
      // Update state with the result
      setFoodResult(result);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to process recording:", error);
      
      // If we get a connection error, try to fall back to offline mode
      if (error.message && (error.message.includes("Connection") || error.message.includes("network") || error.message.includes("internet"))) {
        setIsOfflineMode(true);
        setFoodResult({
          transcription: "Manual entry (offline mode)",
          items: [],
          totalCalories: 0
        });
        setShowResults(true);
        
        toast({
          title: "Offline Mode Activated",
          description: "Connection to the AI service failed. You can manually add food items.",
          variant: "default"
        });
      } else {
        toast({
          title: "Processing Error",
          description: error.message || "Failed to process your recording.",
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [stopRecording, toast]);
  
  const closeResults = useCallback(() => {
    setShowResults(false);
    setFoodResult(null);
  }, []);
  
  return {
    isRecording,
    isProcessing,
    foodResult,
    showResults,
    isOfflineMode,
    startRecording,
    stopRecording,
    processRecording,
    closeResults
  };
}
