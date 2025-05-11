import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WORKOUT_TYPE_ICONS: Record<string, string> = {
  "Strength": "💪",
  "Cardio": "🖥️",
  "HIIT": "⏱️",
  "Cycling": "🚲",
  "Rest": "🏠",
  "Running": "🏃",
  "Swimming": "🏊",
  "Yoga": "🧘",
  "Stretching": "🤸‍♂️",
  "Pilates": "🧠",
  "CrossFit": "⚡",
  "Walking": "👣",
  "Functional": "🔄",
  "Calisthenics": "🏋️‍♂️"
};

interface WorkoutDayCardProps {
  day: string;
  workoutName?: string;
  workoutType: string;
  onClick: () => void;
  isActive?: boolean;
  hasWorkout: boolean;
}

export default function WorkoutDayCard({ 
  day, 
  workoutName, 
  workoutType, 
  onClick, 
  isActive = false,
  hasWorkout = true
}: WorkoutDayCardProps) {
  
  const icon = WORKOUT_TYPE_ICONS[workoutType] || "💪";
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${
        hasWorkout ? 'border-teal-100 dark:border-teal-900' : 'opacity-70'
      } ${
        isActive ? 'border-teal-500 dark:border-teal-600' : ''
      }`}
      onClick={hasWorkout ? onClick : undefined}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-center font-bold">{day}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-2 pt-0">
        <div className="text-3xl mb-1">{icon}</div>
        <div className="text-sm">{workoutName || workoutType}</div>
      </CardContent>
    </Card>
  );
} 