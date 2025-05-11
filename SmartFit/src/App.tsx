import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home/homePage";
import Dashboard from "@/pages/Dashboard/dashboardPage";
import Login from "@/pages/Login/loginPage";
import Register from "@/pages/Register/registerPage";
import QuizPage from "@/pages/Quiz/quizPage";
import GeminiPage from "@/pages/Gemini/geminiPage";
import ProgramPage from "@/pages/WorkoutProgram/ProgramPage";
import WorkoutPage from "@/pages/Workout/workoutPage";


function App() {

  return (
    <Router>
      <Routes>
        {/* home*/}
        <Route path = "/" element = {<Home/>}/>

        {/*dashboard*/}
        <Route path = "/Dashboard" element = {<Dashboard/>}/>

        {/*login*/}
        <Route path = "/Login" element = {<Login/>}/>

        {/*Register*/}
        <Route path = "/Register" element = {<Register/>}/>

         {/*Quiz*/}
         <Route path = "/quizPage" element = {<QuizPage/>}/>


          {/*Gemini*/}
         <Route path = "/geminiPage" element = {<GeminiPage/>}/>
         
         {/*Program*/}
         <Route path = "/program" element = {<ProgramPage/>}/>
         <Route path = "/program/:programId" element = {<ProgramPage/>}/>
         
         {/*Workout*/}
         <Route path = "/workout/:workoutId" element = {<WorkoutPage/>}/>
         
      </Routes>
    </Router>
    
  )
}

export default App
