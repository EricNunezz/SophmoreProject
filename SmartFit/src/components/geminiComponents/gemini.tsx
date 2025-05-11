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
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
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

interface DayMatch {
  day: string;
  title: string;
  index: number;
}

interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: number;
}

const parseExercisesFromText = (dayContent: string): Exercise[] => {
  const exercises: Exercise[] = [];
  
  const lines = dayContent.split('\n');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || line.toLowerCase().startsWith('day ')) continue;
    
    const exerciseMatch = line.match(/^([^:]+)(?::|-)?\s*(\d+)?\s*(?:sets|set)?\s*(?:x|×)?\s*(\d+)?\s*(?:reps|rep)?/i);
    
    if (exerciseMatch) {
      const name = exerciseMatch[1]?.trim();
      let sets = exerciseMatch[2] ? parseInt(exerciseMatch[2]) : 3;
      let reps = exerciseMatch[3] ? parseInt(exerciseMatch[3]) : 10;
      
      if (isNaN(sets)) sets = 3;
      if (isNaN(reps)) reps = 10;
      
      let description = "";
      if (i + 1 < lines.length && !lines[i + 1].match(/^\d+\s*(?:sets|set)/i)) {
        description = lines[i + 1].trim();
        i++; 
      }
      
      exercises.push({
        name,
        description,
        sets,
        reps
      });
    }
  }
  
  return exercises;
};

const parseMultiDayWorkout = (content: string): { dayNumber: number, name: string, exercises: Exercise[] }[] => {
  const dayRegex = /day\s*(\d+)[:\s-]+([^\n]+)/gi;
  const workoutSplits: { dayNumber: number, name: string, exercises: Exercise[] }[] = [];
  const dayMatches: { day: string, title: string, index: number }[] = [];
  
  let match: RegExpExecArray | null;
  while ((match = dayRegex.exec(content)) !== null) {
    dayMatches.push({
      day: match[1],
      title: match[2].trim(),
      index: match.index
    });
  }
  
  for (let i = 0; i < dayMatches.length; i++) {
    const currentDay = dayMatches[i];
    const nextDayIndex = i < dayMatches.length - 1 ? dayMatches[i + 1].index : content.length;
    const dayContent = content.substring(currentDay.index, nextDayIndex);
    
    const exercises = parseExercisesFromText(dayContent);
    
    workoutSplits.push({
      dayNumber: parseInt(currentDay.day),
      name: currentDay.title,
      exercises: exercises
    });
  }
  
  if (workoutSplits.length === 0) {
    workoutSplits.push({
      dayNumber: 1,
      name: "Full Body Workout",
      exercises: []
    });
  }
  
  return workoutSplits;
};

export function GeminiCard() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [fitnessProfileId, setFitnessProfileId] = useState<string | null>(null);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      setIsLoadingProfile(true);
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
      
      try {
        const fitnessProfile = await getUserFitnessProfile(currentUser.id);
        
        if (fitnessProfile) {
          console.log("Loaded fitness profile from database:", fitnessProfile);
          setFitnessProfileId(fitnessProfile.id);
          
          const formattedQuizData: QuizData = {
            userProfile: fitnessProfile.quiz_data
          };
          
          setQuizData(formattedQuizData);
        } else {
          console.log("No fitness profile found in database");
          setQuizData(null);
        }
      } catch (error) {
        console.error("Error loading fitness profile from database:", error);
        setQuizData(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkUserAndLoadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        } else if (session?.user) {
          setUser(session.user);
          checkUserAndLoadProfile();
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
      
      Please create a ${quizData.userProfile.workoutSchedule.daysPerWeek}-day workout routine with different focus areas. Format it as:
      
      Day 1: [Workout Type] (e.g., Strength, Cardio, HIIT, etc.)
      [Exercise 1] - [Sets] sets x [Reps] reps
      [Brief description of Exercise 1]
      
      [Exercise 2] - [Sets] sets x [Reps] reps
      [Brief description of Exercise 2]
      
      And so on for each exercise, then for Day 2, 3, etc.
      
      For each day, include:
      1. A clear title for the workout day (e.g., Day 1: Upper Body Strength)
      2. 4-6 specific exercises with sets and reps recommendations
      3. Brief description for each exercise
      
      Make the workout progressive and balanced across the week.`;

      // Handle Gemini API request with retry
      let result = "";
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          result = await getGeminiResponse(prompt);
          if (result && !result.startsWith("Error:")) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 2000)); 
          retryCount++;
        } catch (error) {
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (!result || result.startsWith("Error:")) {
        throw new Error(result || "Failed to get response from Gemini API after multiple attempts");
      }
      
      console.log("API Result:", result);
      setResponse(result);

      try {
        const workoutSplits = parseMultiDayWorkout(result);
        
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
          
          for (const split of workoutSplits) {
            const splitToSave = {
              program_id: savedProgram.id,
              name: split.name,
              day_number: split.dayNumber,
              exercises: split.exercises
            };
            
            console.log("Saving workout split:", splitToSave);
            await saveWorkoutSplit(splitToSave);
          }
          
          setTimeout(() => {
            const viewProgramEl = document.createElement("div");
            viewProgramEl.className = "mt-6 text-center";
            viewProgramEl.innerHTML = `
              <p class="mb-4 text-teal-600 dark:text-teal-400">Your workout program has been saved!</p>
              <div class="flex flex-col sm:flex-row justify-center gap-4">
                <button class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md">
                  View Your Program
                </button>
                <button class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md">
                  Return to Dashboard
                </button>
              </div>
            `;
            
            const viewProgramButton = viewProgramEl.querySelector("button:first-child") as HTMLButtonElement;
            if (viewProgramButton) {
              viewProgramButton.onclick = () => {
                navigate(`/program/${savedProgram.id}`);
              };
            }
            
            const dashboardButton = viewProgramEl.querySelector("button:last-child") as HTMLButtonElement;
            if (dashboardButton) {
              dashboardButton.onclick = () => {
                navigate("/dashboard");
              };
            }
            
            const responseDiv = document.querySelector(".whitespace-pre-wrap");
            if (responseDiv && responseDiv.parentElement) {
              responseDiv.parentElement.appendChild(viewProgramEl);
            }
          }, 500);
        } else {
          console.error("Workout program saved but ID not returned");
        }
      } catch (dbError) {
        console.error("Database error saving workout data:", dbError);
        setResponse(result + "\n\n Note: Your workout plan was generated but couldn't be saved to your account due to a technical issue.");
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : "Failed to generate workout plan"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Workout Generator</h2>
        <button 
          onClick={handleBackToDashboard}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md"
        >
          Return to Dashboard
        </button>
      </div>
      
      <div className="mb-4">
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
      </div>

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