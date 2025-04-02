import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ManualFoodEntryProps {
  onAdd: (items: { name: string; calories: number }[]) => void;
  onClose: () => void;
}

export default function ManualFoodEntry({ onAdd, onClose }: ManualFoodEntryProps) {
  const [foodItems, setFoodItems] = useState<{ name: string; calories: number }[]>([
    { name: "", calories: 0 }
  ]);

  const handleAddItem = () => {
    setFoodItems([...foodItems, { name: "", calories: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index));
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const newItems = [...foodItems];
    newItems[index].name = value;
    setFoodItems(newItems);
  };

  const handleCaloriesChange = (index: number, value: string) => {
    const newItems = [...foodItems];
    newItems[index].calories = parseInt(value) || 0;
    setFoodItems(newItems);
  };

  const handleSubmit = () => {
    // Filter out empty items
    const validItems = foodItems.filter(item => item.name.trim() !== "" && item.calories > 0);
    
    if (validItems.length === 0) {
      return; // Don't submit if no valid items
    }
    
    onAdd(validItems);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Manual Food Entry</h3>
        <p className="text-sm text-muted-foreground">
          You're in offline mode. Add your food items manually.
        </p>
      </div>

      <div className="space-y-2">
        {foodItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor={`food-name-${index}`}>Food</Label>
              <Input
                id={`food-name-${index}`}
                value={item.name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder="e.g., Apple"
              />
            </div>
            <div className="w-24">
              <Label htmlFor={`calories-${index}`}>Calories</Label>
              <Input
                id={`calories-${index}`}
                type="number"
                value={item.calories || ""}
                onChange={(e) => handleCaloriesChange(index, e.target.value)}
                placeholder="95"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mt-6"
              onClick={() => handleRemoveItem(index)}
              disabled={foodItems.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleAddItem}>
          Add Another Item
        </Button>
        <div className="space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Items
          </Button>
        </div>
      </div>
    </div>
  );
}