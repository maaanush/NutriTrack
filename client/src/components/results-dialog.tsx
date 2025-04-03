import { FoodRecognitionResult } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import ManualFoodEntry from './manual-food-entry';
import { useState } from 'react';

interface ResultsDialogProps {
  result: FoodRecognitionResult;
  onAdd: () => void;
  onClose: () => void;
  isPending: boolean;
  isOfflineMode?: boolean;
  onManualAdd?: (items: { name: string; calories: number }[]) => void;
}

export default function ResultsDialog({ 
  result, 
  onAdd, 
  onClose,
  isPending,
  isOfflineMode = false,
  onManualAdd
}: ResultsDialogProps) {
  const [showManualEntry, setShowManualEntry] = useState<boolean>(isOfflineMode && result.foodItems.length === 0);
  
  const handleManualAdd = (items: { name: string; calories: number }[]) => {
    if (onManualAdd) {
      onManualAdd(items);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
        {showManualEntry ? (
          <ManualFoodEntry 
            onAdd={handleManualAdd} 
            onClose={onClose} 
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {isOfflineMode ? "Offline Mode" : "Food Recognized"}
              </h3>
              <button 
                onClick={onClose} 
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {!isOfflineMode && (
              <div className="mb-4 rounded-lg bg-neutral-100 p-3">
                <p className="text-neutral-500">"{result.transcript}"</p>
              </div>
            )}
            
            {isOfflineMode && result.foodItems.length === 0 ? (
              <div className="mb-4 text-center">
                <p className="text-neutral-500 mb-4">
                  You're currently offline. Please add food items manually.
                </p>
                <Button 
                  onClick={() => setShowManualEntry(true)}
                  className="w-full"
                >
                  Add Food Items Manually
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-3">
                  {result.foodItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border-b">
                      <div>{item.name}</div>
                      <div className="font-medium">{item.calories} kcal</div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center p-2 font-medium">
                    <div>Total</div>
                    <div>{result.totalCalories} kcal</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={onAdd}
                    disabled={isPending || (isOfflineMode && result.foodItems.length === 0)}
                  >
                    Add to Log
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
