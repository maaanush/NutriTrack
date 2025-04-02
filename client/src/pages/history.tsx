import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import CalorieChart from "@/components/calorie-chart";
import { format, subDays } from "date-fns";

export default function History() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  
  // Calculate date range
  const today = new Date();
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  let startDate: Date;
  
  switch (timeframe) {
    case "day":
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate = new Date(today);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
    default:
      startDate = subDays(today, 6);
      startDate.setHours(0, 0, 0, 0);
      break;
  }
  
  // Query for daily calorie data
  const { data: dailyCalories = [] } = useQuery({
    queryKey: [
      `/api/users/${user?.id}/daily-calories`,
      { start: startDate.toISOString(), end: endDate.toISOString() }
    ],
    enabled: !!user,
  });
  
  // Query for previous days' logs
  const { data: previousDays = [] } = useQuery({
    queryKey: [
      `/api/users/${user?.id}/food-logs`,
      { start: startDate.toISOString(), end: endDate.toISOString() }
    ],
    enabled: !!user,
  });
  
  // Group logs by day
  const logsByDay = previousDays.reduce((acc: Record<string, any>, log: any) => {
    const date = format(new Date(log.createdAt), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = {
        date,
        totalCalories: 0,
        logs: []
      };
    }
    acc[date].totalCalories += log.calories;
    acc[date].logs.push(log);
    return acc;
  }, {});
  
  // Convert to array and sort by date (newest first)
  const dayEntries = Object.values(logsByDay).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="space-y-4">
      {/* History filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="font-medium mb-3">Calorie History</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeframe("day")}
            className={`py-1 px-3 rounded-full text-sm ${
              timeframe === "day" 
                ? "bg-primary text-white" 
                : "bg-neutral-200 text-neutral-500"
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeframe("week")}
            className={`py-1 px-3 rounded-full text-sm ${
              timeframe === "week" 
                ? "bg-primary text-white" 
                : "bg-neutral-200 text-neutral-500"
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setTimeframe("month")}
            className={`py-1 px-3 rounded-full text-sm ${
              timeframe === "month" 
                ? "bg-primary text-white" 
                : "bg-neutral-200 text-neutral-500"
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      {/* Calorie chart */}
      <CalorieChart 
        data={dailyCalories} 
        calorieGoal={user?.dailyCalorieGoal || 2000}
        timeframe={timeframe}
      />
      
      {/* Previous days */}
      <div className="space-y-3">
        {dayEntries.map((day: any) => (
          <div key={day.date} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">
                {format(new Date(day.date), 'MMMM d')}
              </h3>
              <span className="font-medium">
                {day.totalCalories} / {user?.dailyCalorieGoal || 2000} kcal
              </span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  day.totalCalories > (user?.dailyCalorieGoal || 2000) 
                    ? "bg-danger" 
                    : day.totalCalories > (user?.dailyCalorieGoal || 2000) * 0.75 
                      ? "bg-secondary" 
                      : "bg-primary"
                }`}
                style={{ 
                  width: `${Math.min(100, (day.totalCalories / (user?.dailyCalorieGoal || 2000)) * 100)}%` 
                }}
              />
            </div>
          </div>
        ))}
        
        {dayEntries.length === 0 && (
          <div className="bg-white rounded-lg shadow p-4 text-center text-neutral-400">
            No history data available
          </div>
        )}
      </div>
    </div>
  );
}
