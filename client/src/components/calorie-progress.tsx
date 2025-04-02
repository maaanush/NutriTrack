import { useEffect, useState } from 'react';

interface CalorieProgressProps {
  currentCalories: number;
  targetCalories: number;
}

export default function CalorieProgress({ 
  currentCalories, 
  targetCalories 
}: CalorieProgressProps) {
  const [percentage, setPercentage] = useState(0);
  const [progressColor, setProgressColor] = useState('bg-primary');
  
  useEffect(() => {
    // Calculate percentage with a slight delay for animation
    const timer = setTimeout(() => {
      const calculatedPercentage = Math.min(100, Math.round((currentCalories / targetCalories) * 100));
      setPercentage(calculatedPercentage);
      
      // Set color based on percentage
      if (calculatedPercentage >= 90) {
        setProgressColor('bg-danger');
      } else if (calculatedPercentage >= 75) {
        setProgressColor('bg-secondary');
      } else {
        setProgressColor('bg-primary');
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [currentCalories, targetCalories]);
  
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium">Today's Calories</h2>
        <div className="text-sm">
          <span>{currentCalories}</span> / <span>{targetCalories}</span> kcal
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
