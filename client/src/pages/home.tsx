import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useRecording } from "@/hooks/use-recording";
import { useToast } from "@/hooks/use-toast";
import CalorieProgress from "@/components/calorie-progress";
import RecordButton from "@/components/record-button";
import ProcessingDialog from "@/components/processing-dialog";
import ResultsDialog from "@/components/results-dialog";
import FoodLog from "@/components/food-log";
import { FoodLog as FoodLogType } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isRecording,
    isProcessing,
    foodResult,
    showResults,
    startRecording,
    processRecording,
    closeResults
  } = useRecording();

  // Fetch today's food logs
  const { data: todayLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: [`/api/users/${user?.id}/food-logs/today`],
    enabled: !!user,
  });

  // Calculate today's calories
  const todayCalories = todayLogs.reduce(
    (sum: number, log: FoodLogType) => sum + log.calories,
    0
  );

  // Mutation to add food logs
  const addFoodLogMutation = useMutation({
    mutationFn: async (foodItems: { name: string; calories: number }[]) => {
      const promises = foodItems.map(item =>
        apiRequest("POST", `/api/users/${user?.id}/food-logs`, {
          foodName: item.name,
          calories: item.calories,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      refetchLogs();
      closeResults();
      toast({
        title: "Food Added",
        description: "Your food has been logged successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add food log: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle adding food to log
  const handleAddFood = () => {
    if (!foodResult) return;
    addFoodLogMutation.mutate(foodResult.foodItems);
  };

  // Handle press and release for recording
  const handleRecordPress = () => {
    startRecording();
  };

  const handleRecordRelease = () => {
    processRecording();
  };

  return (
    <div className="space-y-4">
      <CalorieProgress 
        currentCalories={todayCalories}
        targetCalories={user?.dailyCalorieGoal || 2000}
      />

      <div className="flex justify-center my-6">
        <RecordButton
          isRecording={isRecording}
          onPress={handleRecordPress}
          onRelease={handleRecordRelease}
        />
      </div>

      <FoodLog logs={todayLogs} />

      {isProcessing && <ProcessingDialog />}
      
      {showResults && foodResult && (
        <ResultsDialog
          result={foodResult}
          onAdd={handleAddFood}
          onClose={closeResults}
          isPending={addFoodLogMutation.isPending}
        />
      )}
    </div>
  );
}
