import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function Quiz() {
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
    age: ""
  })

  const handleChange = (field: string, value: string) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    console.log("Quiz responses:", quizData)
    // Here you'll send the data to Gemini API later
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Fitness Assessment Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question 1 */}
        <div className="space-y-2">
          <Label className="text-lg">What is your current fitness level?</Label>
          <Select
            value={quizData.fitnessLevel}
            onValueChange={(value) => handleChange("fitnessLevel", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your fitness level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (New to exercise)</SelectItem>
              <SelectItem value="intermediate">Intermediate (1-3 years experience)</SelectItem>
              <SelectItem value="advanced">Advanced (3+ years experience)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question 2 */}
        <div className="space-y-2">
          <Label className="text-lg">What are your primary fitness goals?</Label>
          <Select
            value={quizData.fitnessGoals}
            onValueChange={(value) => handleChange("fitnessGoals", value)}
          >
            <SelectTrigger className="w-full">
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

        {/* Question 3 */}
        <div className="space-y-4">
          <Label className="text-lg">How often can you work out?</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Days per week</Label>
              <Select
                value={quizData.daysPerWeek}
                onValueChange={(value) => handleChange("daysPerWeek", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="4">4 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Session Length</Label>
              <Select
                value={quizData.sessionLength}
                onValueChange={(value) => handleChange("sessionLength", value)}
              >
                <SelectTrigger>
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

        {/* Question 4 */}
        <div className="space-y-2">
          <Label className="text-lg">What equipment do you have access to?</Label>
          <Select
            value={quizData.equipment}
            onValueChange={(value) => handleChange("equipment", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select equipment access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Equipment (Bodyweight only)</SelectItem>
              <SelectItem value="minimal">Basic Home Equipment (Dumbbells, Bands)</SelectItem>
              <SelectItem value="full">Full Gym Access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question 5 - Keep Textarea for limitations */}
        <div className="space-y-2">
          <Label className="text-lg">Do you have any physical limitations or injuries?</Label>
          <Textarea
            placeholder="Describe any injuries or limitations. Write 'None' if not applicable."
            value={quizData.limitations}
            onChange={(e) => handleChange("limitations", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Question 6 */}
        <div className="space-y-2">
          <Label className="text-lg">What type of workouts do you prefer?</Label>
          <Select
            value={quizData.workoutPreference}
            onValueChange={(value) => handleChange("workoutPreference", value)}
          >
            <SelectTrigger className="w-full">
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

        {/* Question 7 - Updated Body Stats */}
        <div className="space-y-2">
          <Label className="text-lg">
            What are your current body stats?
          </Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex gap-2">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Feet</Label>
                  <input
                    type="number"
                    min="4"
                    max="8"
                    value={quizData.heightFeet}
                    onChange={(e) => handleChange("heightFeet", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="5"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Inches</Label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={quizData.heightInches}
                    onChange={(e) => handleChange("heightInches", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Weight (lbs)</Label>
              <input
                type="number"
                min="50"
                max="500"
                value={quizData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="150"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Age</Label>
              <input
                type="number"
                min="13"
                max="100"
                value={quizData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="23"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSubmit}
          >
            Generate Workout Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}