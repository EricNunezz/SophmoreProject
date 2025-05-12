import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layoutComponent/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getUserWorkoutProgram, getWorkoutSplitsByProgramId } from "@/lib/database";
import { User } from "@supabase/supabase-js";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday", 
  "Saturday",
  "Sunday"
];

function ProgramPage() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [program, setProgram] = useState<any>(null);
  const [workoutSplits, setWorkoutSplits] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1); 
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
        
        const userProgram = await getUserWorkoutProgram(currentUser.id);
        if (userProgram) {
          setProgram(userProgram);
          
          const splits = await getWorkoutSplitsByProgramId(userProgram.id);
          setWorkoutSplits(splits || []);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error loading program data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, programId]);

  const getWorkoutTypeFromName = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("strength") || lowerName.includes("weight")) return "Strength";
    if (lowerName.includes("cardio")) return "Cardio";
    if (lowerName.includes("hiit")) return "HIIT";
    if (lowerName.includes("cycling")) return "Cycling";
    if (lowerName.includes("rest")) return "Rest";
    if (lowerName.includes("running")) return "Running";
    if (lowerName.includes("yoga")) return "Yoga";
    return "Strength"; 
  };

  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  const handleViewWorkout = () => {
    const workout = workoutSplits.find(split => split.day_number === selectedDay);
    if (workout) {
      navigate(`/workout/${workout.id}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">Loading your workout program...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Your AI Workout Split</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayNumber = index + 1;
            const workout = workoutSplits.find(split => split.day_number === dayNumber);
            const workoutType = workout ? getWorkoutTypeFromName(workout.name) : "Rest";
            
            return (
              <Card 
                key={day}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  workout ? 'border-teal-100 dark:border-teal-900' : 'opacity-70'
                } ${
                  dayNumber === selectedDay ? 'border-teal-500 dark:border-teal-600' : ''
                }`}
                onClick={() => workout && handleDayClick(dayNumber)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-center font-bold">{day}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-2 pt-0">
                  <div className="text-sm">{workout ? workoutType : "Rest"}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {workoutSplits.length > 0 && (
          <Card className="mt-6 border-teal-100 dark:border-teal-900 dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">
                {DAYS_OF_WEEK[selectedDay - 1]} Workout Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const workout = workoutSplits.find(split => split.day_number === selectedDay);
                
                if (!workout) {
                  return (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No workout scheduled for this day. Select another day or create a workout.
                    </p>
                  );
                }
                
                return (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{workout.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {workout.exercises && workout.exercises.length 
                        ? `${workout.exercises.length} exercises scheduled` 
                        : "No exercises defined for this workout"}
                    </p>
                    <Button
                      onClick={handleViewWorkout}
                      className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                      View Full Workout
                    </Button>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end mt-6">
          <Button 
            onClick={() => navigate("/dashboard")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default ProgramPage; 