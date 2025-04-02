import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
import { DailyCalorie } from '@shared/schema';

interface CalorieChartProps {
  data: DailyCalorie[];
  calorieGoal: number;
  timeframe: 'day' | 'week' | 'month';
}

export default function CalorieChart({ data, calorieGoal, timeframe }: CalorieChartProps) {
  // Prepare chart data based on timeframe
  const chartData = useMemo(() => {
    const today = new Date();
    let dateRange: Date[] = [];
    
    // Generate date range based on timeframe
    if (timeframe === 'day') {
      dateRange = [today];
    } else if (timeframe === 'week') {
      const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const end = endOfWeek(today, { weekStartsOn: 1 });
      dateRange = eachDayOfInterval({ start, end });
    } else if (timeframe === 'month') {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      dateRange = eachDayOfInterval({ start, end });
    }
    
    // Map data to the date range
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = data.find(d => {
        const dDate = new Date(d.date);
        return format(dDate, 'yyyy-MM-dd') === dateStr;
      });
      
      return {
        date,
        label: format(date, timeframe === 'month' ? 'd' : 'E'),
        value: dayData?.totalCalories || 0,
        percentage: dayData ? (dayData.totalCalories / calorieGoal) * 100 : 0,
        isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      };
    });
  }, [data, calorieGoal, timeframe]);
  
  return (
    <div className="h-64 rounded-lg bg-white p-4 shadow">
      <div className="flex h-full items-end justify-between px-4">
        {chartData.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-8 rounded-t ${
                day.isToday ? 'bg-secondary' : 'bg-primary'
              }`}
              style={{ 
                height: `${Math.max(5, day.percentage)}%`,
                minHeight: '10px' 
              }}
            />
            <span className="mt-1 text-xs">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
