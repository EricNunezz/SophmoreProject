import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { saveFitnessProfile, getCurrentUser } from "@/lib/database"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"

export function Quiz() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState({
    fitnessLevel: "",
    fitnessGoals: "",
    daysPerWeek: "",
    sessionLength: "",
    equipment: "",
    limitations: "",
    workoutPreference: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    age: "",
    gender: ""
  })

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
    };

    checkUser();

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

  const formatQuizDataForAI = () => {
    return {
      fitnessLevel: quizData.fitnessLevel,
      fitnessGoals: quizData.fitnessGoals,
      workoutSchedule: {
        daysPerWeek: quizData.daysPerWeek,
        sessionLength: `${quizData.sessionLength} minutes`
      },
      equipment: quizData.equipment,
      limitations: quizData.limitations,
      workoutPreference: quizData.workoutPreference,
      bodyStats: {
        height: `${quizData.heightFeet}'${quizData.heightInches}"`,
        weight: `${quizData.weight} lbs`,
        age: quizData.age,
        gender: quizData.gender
      }
    }
  }

  const handleChange = (field: string, value: string) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to save quiz data");
      navigate("/login");
      return;
    }

    const requiredFields = {
      fitnessLevel: "Fitness level",
      fitnessGoals: "Fitness goals",
      daysPerWeek: "Days per week",
      sessionLength: "Session length",
      equipment: "Equipment access"
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !quizData[key as keyof typeof quizData])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedData = formatQuizDataForAI();
      
      const fitnessProfile = {
        user_id: user.id,
        quiz_data: formattedData
      };
      
      const savedProfile = await saveFitnessProfile(fitnessProfile);
      console.log("Saved fitness profile:", savedProfile);
      
      if (savedProfile && savedProfile.id) {
        navigate("/geminiPage");
      } else {
        throw new Error("Failed to get profile ID from the server");
      }
    } catch (error: any) {
      console.error("Error saving fitness profile:", error);
      const errorMessage = error.message || "There was an error saving your fitness data";
      alert(`Error: ${errorMessage}. Please try again or contact support.`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-3xl font-bold text-center">Fitness Assessment Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        <div className="grid gap-4">
          <Label htmlFor="fitnessLevel" className="text-lg font-medium">What is your current fitness level?</Label>
          <Select
            value={quizData.fitnessLevel}
            onValueChange={(value) => handleChange("fitnessLevel", value)}
          >
            <SelectTrigger id="fitnessLevel" className="w-full h-14 text-lg px-4">
              <SelectValue placeholder="Select your fitness level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (New to exercise)</SelectItem>
              <SelectItem value="intermediate">Intermediate (1-3 years experience)</SelectItem>
              <SelectItem value="advanced">Advanced (3+ years experience)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <Label htmlFor="fitnessGoals" className="text-lg font-medium">What are your primary fitness goals?</Label>
          <Select
            value={quizData.fitnessGoals}
            onValueChange={(value) => handleChange("fitnessGoals", value)}
          >
            <SelectTrigger id="fitnessGoals" className="w-full h-14 text-lg px-4">
              <SelectValue placeholder="Select your main goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength Training</SelectItem>
              <SelectItem value="hypertrophy">Muscle Growth</SelectItem>
              <SelectItem value="weightLoss">Weight Loss</SelectItem>
              <SelectItem value="endurance">Endurance</SelectItem>
              <SelectItem value="general">General Fitness</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <Label className="text-lg font-medium">How often can you work out?</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-4">
              <Label htmlFor="daysPerWeek">Days per week</Label>
              <Select
                value={quizData.daysPerWeek}
                onValueChange={(value) => handleChange("daysPerWeek", value)}
              >
                <SelectTrigger id="daysPerWeek" className="h-14 text-lg px-4">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 days</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="4">4 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="sessionLength">Session Length</Label>
              <Select
                value={quizData.sessionLength}
                onValueChange={(value) => handleChange("sessionLength", value)}
              >
                <SelectTrigger id="sessionLength" className="h-14 text-lg px-4">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90+ minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Label htmlFor="equipment" className="text-lg font-medium">What equipment do you have access to?</Label>
          <Select
            value={quizData.equipment}
            onValueChange={(value) => handleChange("equipment", value)}
          >
            <SelectTrigger id="equipment" className="w-full h-14 text-lg px-4">
              <SelectValue placeholder="Select equipment access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Equipment (Bodyweight only)</SelectItem>
              <SelectItem value="minimal">Basic Home Equipment (Dumbbells, Bands)</SelectItem>
              <SelectItem value="full">Full Gym Access</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-4">
          <Label htmlFor="limitations" className="text-lg font-medium">Do you have any physical limitations or injuries?</Label>
          <Textarea
            id="limitations"
            placeholder="Describe any injuries or limitations. Write 'None' if not applicable."
            value={quizData.limitations}
            onChange={(e) => handleChange("limitations", e.target.value)}
            className="min-h-[100px] text-lg px-4 py-3"
          />
        </div>

        <div className="grid gap-4">
          <Label htmlFor="workoutPreference" className="text-lg font-medium">What type of workouts do you prefer?</Label>
          <Select
            value={quizData.workoutPreference}
            onValueChange={(value) => handleChange("workoutPreference", value)}
          >
            <SelectTrigger id="workoutPreference" className="w-full h-14 text-lg px-4">
              <SelectValue placeholder="Select workout style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="traditional">Traditional Sets & Reps</SelectItem>
              <SelectItem value="circuit">Circuit Training</SelectItem>
              <SelectItem value="hiit">HIIT (High Intensity Interval Training)</SelectItem>
              <SelectItem value="supersets">Supersets</SelectItem>
              <SelectItem value="any">No Preference</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          <Label className="text-lg font-medium">
            What are your current body stats?
          </Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="grid gap-4">
              <Label>Height</Label>
              <div className="flex gap-2">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="heightFeet" className="text-sm">Feet</Label>
                  <input
                    id="heightFeet"
                    type="number"
                    min="4"
                    max="8"
                    value={quizData.heightFeet}
                    onChange={(e) => handleChange("heightFeet", e.target.value)}
                    className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="5"
                  />
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="heightInches" className="text-sm">Inches</Label>
                  <input
                    id="heightInches"
                    type="number"
                    min="0"
                    max="11"
                    value={quizData.heightInches}
                    onChange={(e) => handleChange("heightInches", e.target.value)}
                    className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <input
                id="weight"
                type="number"
                min="50"
                max="500"
                value={quizData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="150"
              />
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="age">Age</Label>
              <input
                id="age"
                type="number"
                min="13"
                max="100"
                value={quizData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="23"
              />
            </div>

            <div className="grid gap-4">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={quizData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger id="gender" className="h-14 text-lg px-4">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          className="w-full h-14 text-lg font-medium mt-4 bg-teal-500 hover:bg-teal-600" 
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Generate Workout Plan"}
        </Button>
      </CardContent>
    </Card>
  )
}