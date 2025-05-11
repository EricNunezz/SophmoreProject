import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layoutComponent/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getUserWorkoutProgram, getUserFitnessProfile } from "@/lib/database";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [workoutProgram, setWorkoutProgram] = useState<any>(null);
  const [fitnessProfile, setFitnessProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          navigate("/login");
          return;
        }
        
        setUser(currentUser);
        
        const profile = await getUserFitnessProfile(currentUser.id);
        setFitnessProfile(profile);
        
        const program = await getUserWorkoutProgram(currentUser.id);
        setWorkoutProgram(program);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleNewWorkout = () => {
    navigate("/quizPage");
  };

  const viewWorkoutProgram = () => {
    navigate("/geminiPage");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Fitness Dashboard</h1>
          <Button 
            className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
            onClick={handleNewWorkout}
          >
            {fitnessProfile ? "Update Fitness Profile" : "Create Fitness Profile"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center p-8">Loading your fitness information...</div>
        ) : (
          <div>
            {workoutProgram ? (
              <div className="grid grid-cols-1 gap-6">
                <Card className="overflow-hidden border-teal-100 dark:border-teal-900 dark:bg-gray-800">
                  <CardHeader className="bg-teal-50 dark:bg-gray-700 pb-3">
                    <CardTitle className="text-xl dark:text-white">{workoutProgram.title}</CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Created: {new Date(workoutProgram.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {workoutProgram.description}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-teal-500 text-teal-500 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-gray-700"
                      onClick={viewWorkoutProgram}
                    >
                      View Workout
                    </Button>
                  </CardContent>
                </Card>

                {fitnessProfile && (
                  <Card className="overflow-hidden border-teal-100 dark:border-teal-900 dark:bg-gray-800">
                    <CardHeader className="bg-teal-50 dark:bg-gray-700 pb-3">
                      <CardTitle className="text-xl dark:text-white">Your Fitness Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="dark:text-gray-300"><strong className="dark:text-white">Fitness Level:</strong> {fitnessProfile.quiz_data.fitnessLevel}</p>
                          <p className="dark:text-gray-300"><strong className="dark:text-white">Goals:</strong> {fitnessProfile.quiz_data.fitnessGoals}</p>
                          <p className="dark:text-gray-300"><strong className="dark:text-white">Equipment:</strong> {fitnessProfile.quiz_data.equipment}</p>
                        </div>
                        <div>
                          <p className="dark:text-gray-300"><strong className="dark:text-white">Days per Week:</strong> {fitnessProfile.quiz_data.workoutSchedule.daysPerWeek}</p>
                          <p className="dark:text-gray-300"><strong className="dark:text-white">Session Length:</strong> {fitnessProfile.quiz_data.workoutSchedule.sessionLength}</p>
                          <p className="dark:text-gray-300"><strong className="dark:text-white">Workout Style:</strong> {fitnessProfile.quiz_data.workoutPreference}</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                        onClick={handleNewWorkout}
                      >
                        Update Profile
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h2 className="text-xl font-medium mb-2 dark:text-white">No Workout Program Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Complete the fitness assessment quiz to get your personalized workout plan.
                </p>
                <Button 
                  className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                  onClick={handleNewWorkout}
                >
                  Take Fitness Quiz
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;