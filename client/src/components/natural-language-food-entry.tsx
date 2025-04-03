import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NaturalLanguageFoodEntryProps {
  onAdd: (items: { name: string; calories: number }[]) => void;
  onClose: () => void;
}

export default function NaturalLanguageFoodEntry({ onAdd, onClose }: NaturalLanguageFoodEntryProps) {
  const [foodText, setFoodText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodText.trim()) {
      setError("Please enter what you ate.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to analyze the food text
      const response = await apiRequest("POST", "/api/analyze-food", {
        foodText: foodText.trim()
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze food text");
      }
      
      const result = await response.json();
      
      // Pass the food items to the parent component
      onAdd(result.foodItems);
    } catch (err) {
      console.error("Error analyzing food:", err);
      setError("Failed to analyze food. Please try again or use manual entry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add What You Ate</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="food-text" className="mb-2 block">
            Describe what you ate in natural language:
          </Label>
          <Textarea
            id="food-text"
            value={foodText}
            onChange={(e) => setFoodText(e.target.value)}
            placeholder="e.g., I had 2 slices of wheat bread with 1 tbsp of peanut butter, a medium apple, and a glass of orange juice."
            className="min-h-24"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Be as specific as possible with quantities and types of food for accurate calorie estimation.
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="w-1/2" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="w-1/2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Analyze & Add
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}