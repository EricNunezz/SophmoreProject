import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layoutComponent/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getWorkoutSplit, getWorkoutSplitsByProgramId } from "@/lib/database";
import { User } from "@supabase/supabase-js";

interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: number;
}

function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [programId, setProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          navigate("/login");
          return;
        }
        
        setUser(currentUser);
        
        if (workoutId) {
          const workoutData = await getWorkoutSplit(workoutId);
          if (workoutData) {
            setWorkout(workoutData);
            setProgramId(workoutData.program_id);
            
            if (workoutData.exercises && Array.isArray(workoutData.exercises)) {
              setExercises(workoutData.exercises);
            } else {
              setExercises([]);
            }
          } else {
            navigate("/dashboard");
          }
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error loading workout data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, workoutId]);

  const getDayName = (dayNumber: number): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[(dayNumber - 1) % 7];
  };

  const handleBackToProgramClick = () => {
    if (programId) {
      navigate(`/program/${programId}`);
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">Loading your workout...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {workout ? `${getDayName(workout.day_number)} Workout: ${workout.name}` : "Workout"}
          </h1>
          <Button
            onClick={handleBackToProgramClick}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Back to Program
          </Button>
        </div>

        {workout ? (
          <>
            <Card className="mb-6 border-teal-100 dark:border-teal-900 dark:bg-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{getDayName(workout.day_number)} Workout: {workout.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">60 minutes</span>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {exercises.length  > 0 ? (
                exercises.map((exercise, index) => (
                  <Card key={index} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className={index < exercises.length - 1 ? "border-b pb-4" : ""}>
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
                ))
              ) : (
                <Card className="p-6 text-center">
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">No exercises found for this workout</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card className="p-6 text-center">
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Workout not found</p>
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default WorkoutPage;
