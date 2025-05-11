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
        
        // Get user's fitness profile
        const profile = await getUserFitnessProfile(currentUser.id);
        setFitnessProfile(profile);
        
        // Get user's workout program
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
      (event) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleTakeFitnessQuiz = () => {
    navigate("/quizPage");
  };

  const viewWorkoutProgram = () => {
    if (workoutProgram && workoutProgram.id) {
      navigate(`/program/${workoutProgram.id}`);
    } else {
      navigate("/geminiPage");
    }
  };

  const generateNewWorkout = () => {
    navigate("/geminiPage");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">Loading your fitness information...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Fitness Dashboard</h1>
          
          {!fitnessProfile && (
            <Button 
              className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
              onClick={handleTakeFitnessQuiz}
            >
              Take Fitness Quiz
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {/* Workout Program Card */}
          {workoutProgram ? (
            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Your Workout Program</CardTitle>
                <CardDescription>
                  Created: {new Date(workoutProgram.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {workoutProgram.description || "Your personalized workout program based on your fitness profile."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      className="h-12 font-medium bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                      onClick={viewWorkoutProgram}
                    >
                      View Workout Program
                    </Button>
                    <Button 
                      className="h-12 font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                      onClick={generateNewWorkout}
                    >
                      Generate New Workout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Get Started with a Workout Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {fitnessProfile 
                      ? "Generate your personalized workout program based on your fitness profile." 
                      : "Take the fitness assessment quiz to create your personalized workout plan."}
                  </p>
                  <Button 
                    className="w-full h-12 font-medium bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                    onClick={fitnessProfile ? generateNewWorkout : handleTakeFitnessQuiz}
                  >
                    {fitnessProfile ? "Generate Workout Program" : "Take Fitness Quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fitness Profile Card */}
          {fitnessProfile && (
            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Your Fitness Profile</CardTitle>
                <CardDescription>Personal fitness information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>Fitness Level:</strong> {fitnessProfile.quiz_data.fitnessLevel}</p>
                    <p><strong>Goals:</strong> {fitnessProfile.quiz_data.fitnessGoals}</p>
                    <p><strong>Equipment:</strong> {fitnessProfile.quiz_data.equipment}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Days per Week:</strong> {fitnessProfile.quiz_data.workoutSchedule.daysPerWeek}</p>
                    <p><strong>Session Length:</strong> {fitnessProfile.quiz_data.workoutSchedule.sessionLength}</p>
                    <p><strong>Workout Style:</strong> {fitnessProfile.quiz_data.workoutPreference}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button 
                    className="w-full h-12 font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    onClick={handleTakeFitnessQuiz}
                  >
                    Update Fitness Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;