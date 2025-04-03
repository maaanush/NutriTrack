import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FoodRecognitionResult } from "@shared/schema";

interface NaturalLanguageFoodEntryProps {
  onAdd: (items: { name: string; calories: number }[]) => void;
  onClose: () => void;
}

export default function NaturalLanguageFoodEntry({ onAdd, onClose }: NaturalLanguageFoodEntryProps) {
  const [foodDescription, setFoodDescription] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [results, setResults] = useState<{ name: string; calories: number }[] | null>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFoodDescription(e.target.value);
  };

  const analyzeFood = async () => {
    if (!foodDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a food description",
        variant: "destructive",
      });
      return;
    }

    setIsPending(true);
    setResults(null);

    try {
      const result = await apiRequest(
        "POST",
        "/api/analyze-food",
        { foodText: foodDescription }
      ) as FoodRecognitionResult;

      if (result.foodItems.length === 0) {
        toast({
          title: "No food items found",
          description: "Could not recognize any food items in your description. Please try again with more details.",
          variant: "destructive",
        });
        setIsPending(false);
        return;
      }

      setResults(result.foodItems);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to analyze food: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleAdd = () => {
    if (results && results.length > 0) {
      onAdd(results);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe what you ate (e.g., 'I had 2 slices of whole wheat toast with avocado and an apple')"
          className="min-h-[100px]"
          value={foodDescription}
          onChange={handleTextChange}
          disabled={isPending}
        />
        <div className="flex justify-end">
          <Button
            onClick={analyzeFood}
            disabled={!foodDescription.trim() || isPending}
            className="ml-auto"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze
          </Button>
        </div>
      </div>

      {results && results.length > 0 && (
        <div className="border rounded-md p-4 space-y-4">
          <h3 className="font-medium">Recognized Food Items:</h3>
          <ul className="space-y-2">
            {results.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="font-semibold">{item.calories} cal</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-medium">Total Calories:</span>
            <span className="font-bold">
              {results.reduce((sum, item) => sum + item.calories, 0)} cal
            </span>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>
              Add to Log
            </Button>
          </div>
        </div>
      )}

      {!results && !isPending && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}