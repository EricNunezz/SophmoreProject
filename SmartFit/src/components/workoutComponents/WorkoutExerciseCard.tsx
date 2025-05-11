import { Card, CardContent } from "@/components/ui/card";

export interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: number;
}

interface WorkoutExerciseCardProps {
  exercise: Exercise;
  isLast?: boolean;
}

export default function WorkoutExerciseCard({ exercise, isLast = false }: WorkoutExerciseCardProps) {
  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className={!isLast ? "border-b pb-4" : ""}>
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold text-lg">{exercise.name}</h3>
            <span>{exercise.sets} sets × {exercise.reps} reps</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {exercise.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 