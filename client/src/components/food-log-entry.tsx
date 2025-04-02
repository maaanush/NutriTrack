import { format } from 'date-fns';
import { FoodLog } from '@shared/schema';
import { ChevronDown } from 'lucide-react';

interface FoodLogEntryProps {
  log: FoodLog;
}

export default function FoodLogEntry({ log }: FoodLogEntryProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
      <div>
        <div className="font-medium">{log.foodName}</div>
        <div className="text-sm text-neutral-400">
          {format(new Date(log.createdAt), 'h:mm a')}
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-medium text-neutral-500">{log.calories} kcal</span>
        <button className="ml-4 text-neutral-300 hover:text-neutral-500">
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
