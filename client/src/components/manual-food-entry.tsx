import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Check } from "lucide-react";

interface ManualFoodEntryProps {
  onAdd: (items: { name: string; calories: number }[]) => void;
  onClose: () => void;
}

export default function ManualFoodEntry({ onAdd, onClose }: ManualFoodEntryProps) {
  const [foodItems, setFoodItems] = useState<{ id: number; name: string; calories: string }[]>([
    { id: 1, name: "", calories: "" },
  ]);

  const addFoodItem = () => {
    const newId = foodItems.length > 0 ? Math.max(...foodItems.map(item => item.id)) + 1 : 1;
    setFoodItems([...foodItems, { id: newId, name: "", calories: "" }]);
  };

  const removeFoodItem = (id: number) => {
    if (foodItems.length === 1) return; // Keep at least one item
    setFoodItems(foodItems.filter((item) => item.id !== id));
  };

  const updateFoodItem = (id: number, field: "name" | "calories", value: string) => {
    setFoodItems(
      foodItems.map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and convert data
    const validItems = foodItems
      .filter(item => item.name.trim() && !isNaN(Number(item.calories)))
      .map(item => ({
        name: item.name.trim(),
        calories: parseInt(item.calories)
      }));
    
    if (validItems.length === 0) return;
    
    onAdd(validItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add Food Items</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {foodItems.map((item) => (
          <div key={item.id} className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor={`food-name-${item.id}`} className="text-xs">
                Food Item
              </Label>
              <Input
                id={`food-name-${item.id}`}
                value={item.name}
                onChange={(e) => updateFoodItem(item.id, "name", e.target.value)}
                placeholder="e.g., Apple"
                required
              />
            </div>
            
            <div className="w-24">
              <Label htmlFor={`calories-${item.id}`} className="text-xs">
                Calories
              </Label>
              <Input
                id={`calories-${item.id}`}
                value={item.calories}
                onChange={(e) => updateFoodItem(item.id, "calories", e.target.value)}
                placeholder="e.g., 95"
                type="number"
                min="0"
                required
              />
            </div>
            
            {foodItems.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFoodItem(item.id)}
                className="mb-0.5"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFoodItem}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Item
        </Button>
        
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="w-1/2" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="w-1/2">
            <Check className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}