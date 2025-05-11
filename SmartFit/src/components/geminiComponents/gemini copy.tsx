import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getGeminiResponse } from "@/lib/api";

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
    };
  };
}

interface GeminiCardProps {
  quizData: QuizData;
}

export function GeminiCard({ quizData }: GeminiCardProps) {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateWorkoutPlan = async () => {
    console.log("Generating workout plan with quiz data:", quizData);
    setIsLoading(true);
    setResponse("Generating your personalized workout plan...");

    try {
      // Create a detailed prompt using the quiz data
      const prompt = `Create a personalized workout plan for a ${quizData.userProfile.fitnessLevel} fitness level user who wants to focus on ${quizData.userProfile.fitnessGoals}. 
      They can workout ${quizData.userProfile.workoutSchedule.daysPerWeek} days per week for ${quizData.userProfile.workoutSchedule.sessionLength} each session. 
      They have access to ${quizData.userProfile.equipment} and prefer ${quizData.userProfile.workoutPreference} style workouts. 
      Their body stats are: height ${quizData.userProfile.bodyStats.height}, weight ${quizData.userProfile.bodyStats.weight}, age ${quizData.userProfile.bodyStats.age}. 
      ${quizData.userProfile.limitations !== 'None' ? 'They have the following limitations: ' + quizData.userProfile.limitations : ''}
      
      Please provide:
      1. A weekly workout schedule
      2. Specific exercises for each day
      3. Sets and reps recommendations
      4. Any modifications based on their equipment and limitations
      5. General fitness advice tailored to their goals`;

      const result = await getGeminiResponse(prompt);
      console.log("API Result:", result);
      setResponse(result || "No response received");
    } catch (error) {
      console.error("Error generating workout plan:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : "Failed to generate workout plan"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button size="lg" onClick={generateWorkoutPlan} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Workout Plan"}
      </Button>

      {response && (
        <div className="mt-4 p-4 border rounded max-w-xl">
          <h3 className="font-bold mb-2">Your Personalized Workout Plan:</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}