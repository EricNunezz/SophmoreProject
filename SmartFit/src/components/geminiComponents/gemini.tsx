import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getGeminiResponse } from "@/lib/api";
import { 
  saveWorkoutProgram, 
  saveWorkoutSplit,
  getCurrentUser,
  getUserFitnessProfile
} from "@/lib/database";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface QuizData {
  userProfile: {
    fitnessLevel: string;
    fitnessGoals: string;
    workoutSchedule: {
      daysPerWeek: string;
      sessionLength: string;
    };
    equipment: string;
    limitations: string;
    workoutPreference: string;
    bodyStats: {
      height: string;
      weight: string;
      age: string;
      gender: string;
    };
  };
}

export function GeminiCard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [fitnessProfileId, setFitnessProfileId] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      setIsLoadingProfile(true);
      
      // Check and get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
      
      // Load fitness profile from database
      try {
        const fitnessProfile = await getUserFitnessProfile(currentUser.id);
        
        if (fitnessProfile) {
          console.log("Loaded fitness profile from database:", fitnessProfile);
          setFitnessProfileId(fitnessProfile.id);
          
          // Convert database quiz_data to the format expected by the component
          const formattedQuizData: QuizData = {
            userProfile: fitnessProfile.quiz_data
          };
          
          setQuizData(formattedQuizData);
        } else {
          console.log("No fitness profile found in database");
          
          // Fallback to localStorage if no profile in database
          const storedData = localStorage.getItem("quizData");
          const storedProfileId = localStorage.getItem("fitnessProfileId");
          
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              setQuizData(parsedData);
              console.log("Loaded quiz data from localStorage as fallback:", parsedData);
            } catch (error) {
              console.error("Error parsing stored quiz data:", error);
            }
          }
          
          if (storedProfileId) {
            setFitnessProfileId(storedProfileId);
          }
        }
      } catch (error) {
        console.error("Error loading fitness profile from database:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkUserAndLoadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const parseWorkoutSplit = (content: string): { dayNumber: number, name: string, exercises: any[] } => {
    const dayMatch = content.match(/day\s*(\d+)[:\s-]+([^:]+?)(?:\n|$)/i);
    
    return {
      dayNumber: dayMatch ? parseInt(dayMatch[1]) : 1,
      name: dayMatch ? dayMatch[2].trim() : "Full Body Workout",
      exercises: []
    };
  };

  const generateWorkoutPlan = async () => {
    if (!user) {
      alert("You must be logged in to generate a workout plan");
      navigate("/login");
      return;
    }

    if (!quizData) {
      setResponse("No quiz data available. Please complete the fitness assessment quiz first.");
      return;
    }

    if (!fitnessProfileId) {
      setResponse("Fitness profile ID not found. Please retake the quiz.");
      return;
    }

    console.log("Generating workout plan with quiz data:", quizData);
    setIsLoading(true);
    setResponse("Generating your personalized workout plan...");

    try {
      const prompt = `Create a personalized workout plan for a ${quizData.userProfile.fitnessLevel} fitness level ${quizData.userProfile.bodyStats.gender || ""} user who wants to focus on ${quizData.userProfile.fitnessGoals}. 
      They can workout ${quizData.userProfile.workoutSchedule.daysPerWeek} days per week for ${quizData.userProfile.workoutSchedule.sessionLength} each session. 
      They have access to ${quizData.userProfile.equipment} and prefer ${quizData.userProfile.workoutPreference} style workouts. 
      Their body stats are: height ${quizData.userProfile.bodyStats.height}, weight ${quizData.userProfile.bodyStats.weight}, age ${quizData.userProfile.bodyStats.age}, gender ${quizData.userProfile.bodyStats.gender || "not specified"}. 
      ${quizData.userProfile.limitations && quizData.userProfile.limitations !== 'None' ? 'They have the following limitations: ' + quizData.userProfile.limitations : ''}
      
      For now, create a single workout day that includes a full-body routine.
      
      Please provide:
      1. A clear title for the workout day (e.g., "Day 1: Full Body Workout")
      2. Specific exercises with sets and reps recommendations
      3. Any modifications based on their equipment and limitations
      4. General fitness advice tailored to their goals
      
      Format the response with a clear title for the workout day on its own line at the beginning.`;

      // Handle Gemini API request with retry
      let result;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          result = await getGeminiResponse(prompt);
          if (result && !result.startsWith("Error:")) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
          attempts++;
        } catch (error) {
          console.error(`Attempt ${attempts + 1} failed:`, error);
          if (attempts >= maxAttempts - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }
      
      if (!result || result.startsWith("Error:")) {
        throw new Error(result || "Failed to get response from Gemini API after multiple attempts");
      }
      
      console.log("API Result:", result);
      setResponse(result);

      try {
        // Process and save the workout data
        const workoutSplit = parseWorkoutSplit(result);
        
        const workoutProgram = {
          user_id: user.id,
          fitness_profile_id: fitnessProfileId,
          title: `${quizData.userProfile.fitnessGoals} Workout Plan`,
          description: result.split('\n').slice(0, 3).join('\n')
        };
        
        console.log("Saving workout program:", workoutProgram);
        const savedProgram = await saveWorkoutProgram(workoutProgram);
        console.log("Saved workout program:", savedProgram);
        
        if (savedProgram?.id) {
          setSavedProgramId(savedProgram.id);
          
          const splitToSave = {
            program_id: savedProgram.id,
            name: workoutSplit.name,
            day_number: workoutSplit.dayNumber,
            exercises: workoutSplit.exercises
          };
          
          console.log("Saving workout split:", splitToSave);
          const savedSplit = await saveWorkoutSplit(splitToSave);
          console.log("Saved workout split:", savedSplit);
        } else {
          console.error("Workout program saved but ID not returned");
          // The workout plan is still displayed but not saved to database
        }
      } catch (dbError) {
        console.error("Database error saving workout data:", dbError);
        // Show a message that the plan was generated but not saved
        setResponse(result + "\n\n⚠️ Note: Your workout plan was generated but couldn't be saved to your account due to a technical issue.");
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : "Failed to generate workout plan"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your Personalized Workout Plan</h1>
      
      {isLoadingProfile ? (
        <p className="text-gray-600 dark:text-gray-400 mb-4">Loading your fitness profile...</p>
      ) : quizData ? (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">Your Fitness Profile:</h2>
          <p className="dark:text-gray-300"><strong className="dark:text-white">Fitness Level:</strong> {quizData.userProfile.fitnessLevel}</p>
          <p className="dark:text-gray-300"><strong className="dark:text-white">Goals:</strong> {quizData.userProfile.fitnessGoals}</p>
          <p className="dark:text-gray-300"><strong className="dark:text-white">Schedule:</strong> {quizData.userProfile.workoutSchedule.daysPerWeek} days per week, {quizData.userProfile.workoutSchedule.sessionLength}</p>
          <p className="dark:text-gray-300"><strong className="dark:text-white">Equipment:</strong> {quizData.userProfile.equipment}</p>
          <p className="dark:text-gray-300"><strong className="dark:text-white">Body Stats:</strong> {quizData.userProfile.bodyStats.height}, {quizData.userProfile.bodyStats.weight}, Age: {quizData.userProfile.bodyStats.age}{quizData.userProfile.bodyStats.gender ? `, Gender: ${quizData.userProfile.bodyStats.gender}` : ''}</p>
        </div>
      ) : (
        <p className="text-yellow-600 dark:text-yellow-500 mb-4">No fitness profile found. Please complete the fitness assessment quiz first.</p>
      )}

      <Button 
        size="lg" 
        onClick={generateWorkoutPlan} 
        disabled={isLoading || !quizData || !user || isLoadingProfile}
        className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700 mb-6"
      >
        {isLoading ? "Generating..." : savedProgramId ? "Regenerate Workout Plan" : "Generate Workout Plan"}
      </Button>

      {response && (
        <div className="mt-4 p-6 border rounded shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-xl mb-4 dark:text-white">Your Personalized Workout Plan:</h3>
          <div className="whitespace-pre-wrap prose max-w-none dark:text-gray-300">{response}</div>
          {savedProgramId && (
            <div className="mt-4 text-teal-600 dark:text-teal-400">
              Your workout plan has been saved to your account.
            </div>
          )}
        </div>
      )}
    </div>
  );
}