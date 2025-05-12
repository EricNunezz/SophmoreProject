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
  
  const lines = dayContent.split(/\n{1,2}/);
  
  let currentExercise: Partial<Exercise> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || line.match(/^Day \d+:/i)) continue;
    
    if (line.match(/^(important notes|notes|tips|warm-up|cool-down):/i)) continue;
    
    const exerciseMatch = line.match(/^([^-]+)\s*-\s*(\d+)\s*sets?\s*x\s*(\d+(?:-\d+)?)\s*reps?/i);
    
    if (exerciseMatch) {
      const exerciseName = exerciseMatch[1].trim().toLowerCase();
      if (exerciseName.includes('note') || 
          exerciseName.includes('tip') || 
          exerciseName.includes('important') ||
          exerciseName === 'warm-up' ||
          exerciseName === 'cool-down') {
        continue;
      }
      
      if (currentExercise.name) {
        exercises.push(currentExercise as Exercise);
      }
      
      currentExercise = {
        name: exerciseMatch[1].trim(),
        sets: parseInt(exerciseMatch[2]),
        reps: parseInt(exerciseMatch[3].split('-')[0]),  
        description: ''
      };
    } 
    else if (currentExercise.name && !line.match(/^Day \d+:/i)) {
      if (currentExercise.description) {
        currentExercise.description += ' ' + line;
      } else {
        currentExercise.description = line;
      }
    }
  }
  
  if (currentExercise.name) {
    exercises.push(currentExercise as Exercise);
  }
  
  return exercises;
};

const parseMultiDayWorkout = (content: string): { dayNumber: number, name: string, exercises: Exercise[], warmUp?: string, coolDown?: string, notes?: string }[] => {
  const workoutSplits: { dayNumber: number, name: string, exercises: Exercise[], warmUp?: string, coolDown?: string, notes?: string }[] = [];

  const dayRegex = /day\s*(\d+)\s*:\s*([^\n]+)/gi;
  let match: RegExpExecArray | null;
  const dayMatches: DayMatch[] = [];

  while ((match = dayRegex.exec(content)) !== null) {
    dayMatches.push({
      day: match[1],
      title: match[2].trim(),
      index: match.index
    });
  }

  for (let i = 0; i < dayMatches.length; i++) {
    const currentMatch = dayMatches[i];
    const nextMatch = i < dayMatches.length - 1 ? dayMatches[i + 1] : null;
    
    const startIndex = currentMatch.index;
    const endIndex = nextMatch ? nextMatch.index : content.length;
    
    const dayContent = content.substring(startIndex, endIndex);

    const warmUpMatch = dayContent.match(/WARM-UP:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z])/i);
    const coolDownMatch = dayContent.match(/COOL-DOWN:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z])/i);
    const notesMatch = dayContent.match(/NOTES.*?:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    
    const warmUp = warmUpMatch ? warmUpMatch[1].trim() : undefined;
    const coolDown = coolDownMatch ? coolDownMatch[1].trim() : undefined;
    const notes = notesMatch ? notesMatch[1].trim() : undefined;
    
    const exercises = parseExercisesFromText(dayContent);
    
    workoutSplits.push({
      dayNumber: parseInt(currentMatch.day),
      name: currentMatch.title,
      exercises,
      warmUp,
      coolDown,
      notes
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
      const prompt = `Create a structured workout program for a ${quizData.userProfile.fitnessLevel} fitness level ${quizData.userProfile.bodyStats.gender || ""} user who wants to focus on ${quizData.userProfile.fitnessGoals}. 
      They can workout ${quizData.userProfile.workoutSchedule.daysPerWeek} days per week for ${quizData.userProfile.workoutSchedule.sessionLength} each session. 
      They have access to ${quizData.userProfile.equipment} and prefer ${quizData.userProfile.workoutPreference} style workouts. 
      Their body stats are: height ${quizData.userProfile.bodyStats.height}, weight ${quizData.userProfile.bodyStats.weight}, age ${quizData.userProfile.bodyStats.age}, gender ${quizData.userProfile.bodyStats.gender || "not specified"}. 
      ${quizData.userProfile.limitations && quizData.userProfile.limitations !== 'None' ? 'They have the following limitations: ' + quizData.userProfile.limitations : ''}
      
      IMPORTANT FORMATTING INSTRUCTIONS:
      1. DO NOT include any meal plans or nutrition advice
      2. Each day should contain 3-6 actual exercises only
      3. Include a WARM-UP and COOL-DOWN section for each day with specific activities
      4. DO NOT add any explanatory comments about the workout
      
      Format each day's workout EXACTLY as follows:
      
      Day 1: [Muscle Group/Workout Type]
      
      WARM-UP:
      - [Specific warm-up activity 1] - [Duration or reps]
      - [Specific warm-up activity 2] - [Duration or reps]
      
      [Exercise Name 1] - [Sets] sets x [Reps] reps (unless it involves cardio, then use [Time] Minutes)
      [Short exercise description focusing only on form]
      
      [Exercise Name 2] - [Sets] sets x [Reps] reps (unless it involves cardio, then use [Time] Minutes)
      [Short exercise description focusing only on form]
      
      (Continue with exercises for this day)
      
      COOL-DOWN:
      - [Specific cool-down activity 1] - [Duration]
      - [Specific cool-down activity 2] - [Duration]
      
      NOTES (optional):
      - Any important tips or advice for this workout day
      
      Day 2: [Muscle Group/Workout Type]
      
      (and so on for each day)
      
      For ALL exercises:
      1. Exercise names should be specific moves (e.g., "Barbell Squat")
      2. Each exercise MUST have specific sets and reps and/or duration for cardio (e.g., 3 sets x 10 reps)
      3. Keep descriptions brief and form-focused - NO explanatory comments
      4. Include specific warm-up and cool-down activities with durations for each day
      5. DO NOT add any explanatory text between days or at the beginning/end of the plan
      
      Create a ${quizData.userProfile.workoutSchedule.daysPerWeek}-day program that is progressive and balanced.`;

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
            let combinedNotes = '';
            if (split.warmUp) {
              combinedNotes += "WARM-UP:\n" + split.warmUp + "\n\n";
            }
            if (split.coolDown) {
              combinedNotes += "COOL-DOWN:\n" + split.coolDown + "\n\n";
            }
            if (split.notes) {
              combinedNotes += split.notes;
            }
            const splitToSave = {
              program_id: savedProgram.id,
              name: split.name,
              day_number: split.dayNumber,
              exercises: split.exercises,
              notes: combinedNotes || undefined
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
        <div className="mt-4">
          <h3 className="font-bold text-xl mb-4 dark:text-white">Your Personalized Workout Plan:</h3>
          
          <div className="whitespace-pre-wrap prose max-w-none dark:text-gray-300 bg-white dark:bg-gray-800 border rounded-lg shadow-sm p-6 mb-4">
            {response.split(/\n{2,}/).map((paragraph, index) => {
              if (paragraph.trim().startsWith("NOTES") || paragraph.match(/^[A-Z\s]+:$/)) {
                return null;
              }
              
              if (paragraph.trim().startsWith("WARM-UP:")) {
                return (
                  <div key={index} className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="font-medium text-blue-700 dark:text-blue-400">{paragraph}</div>
                  </div>
                );
              }
              
              if (paragraph.trim().startsWith("COOL-DOWN:")) {
                return (
                  <div key={index} className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <div className="font-medium text-green-700 dark:text-green-400">{paragraph}</div>
                  </div>
                );
              }
              
              if (paragraph.match(/^Day \d+:/i)) {
                return (
                  <div key={index} className="mt-6 mb-4">
                    <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 pb-2 border-b border-teal-200 dark:border-teal-800">{paragraph}</h3>
                  </div>
                );
              }
              
              return <div key={index} className="mb-4">{paragraph}</div>;
            })}
          </div>
          
          {response.split(/\n{2,}/).some(p => p.trim().startsWith("NOTES")) && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2">Important Notes</h4>
              {response.split(/\n{2,}/).map((paragraph, index) => {
                if (paragraph.trim().startsWith("NOTES")) {
                  return (
                    <div key={`note-${index}`} className="text-amber-800 dark:text-amber-300">
                      {paragraph.replace(/^NOTES\s*\(optional\)?:/, "").trim()}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
          
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