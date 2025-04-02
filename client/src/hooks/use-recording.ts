import { useState, useRef, useCallback } from "react";
import { convertAudioToBase64, recognizeFood } from "@/lib/openai";
import { FoodRecognitionResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [foodResult, setFoodResult] = useState<FoodRecognitionResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  
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
      
      // Convert audio to base64
      const base64Audio = await convertAudioToBase64(audioBlob);
      
      // Send to server for processing
      const result = await recognizeFood(base64Audio);
      
      // Update state with the result
      setFoodResult(result);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to process recording:", error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process your recording.",
        variant: "destructive"
      });
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
    startRecording,
    stopRecording,
    processRecording,
    closeResults
  };
}
