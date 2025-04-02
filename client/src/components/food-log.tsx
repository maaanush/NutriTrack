import { FoodLog as FoodLogType } from '@shared/schema';
import FoodLogEntry from './food-log-entry';

interface FoodLogProps {
  logs: FoodLogType[];
}

export default function FoodLog({ logs }: FoodLogProps) {
  return (
    <div>
      <h2 className="mb-3 font-medium">Today's Food Log</h2>
      
      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map(log => (
            <FoodLogEntry key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-4 text-center text-neutral-400 shadow">
          No food logged today. Record your meals using the microphone button!
        </div>
      )}
    </div>
  );
}
