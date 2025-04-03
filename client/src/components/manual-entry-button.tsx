import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import ManualFoodEntry from "./manual-food-entry";

interface ManualEntryButtonProps {
  onAdd: (items: { name: string; calories: number }[]) => void;
}

export default function ManualEntryButton({ onAdd }: ManualEntryButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleManualAdd = (items: { name: string; calories: number }[]) => {
    onAdd(items);
    setShowDialog(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 mt-2 w-full"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Add Food Item Manually</span>
      </Button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
            <ManualFoodEntry 
              onAdd={handleManualAdd} 
              onClose={() => setShowDialog(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}