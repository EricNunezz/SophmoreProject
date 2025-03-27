//import { Button } from "@/components/ui/button"
//import { LoginForm } from "@/components/login-form"
//import { Quiz } from "@/components/quizComponents/Quiz"
//import { useState } from "react"

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home/homePage";
import Dashboard from "@/pages/Dashboard/dashboardPage";
import Login from "@/pages/Login/loginPage";
import Register from "@/pages/Register/registerPage";
import QuizPage from "@/pages/Quiz/quizPage";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* home*/}
        <Route path = "/" element = {<Home/>}/>

        {/* dashboard*/}
        <Route path = "/Dashboard" element = {<Dashboard/>}/>

        {/* login*/}
        <Route path = "/Login" element = {<Login/>}/>

        {/* Register*/}
        <Route path = "/Register" element = {<Register/>}/>

         {/* Quiz*/}
         <Route path = "/quizPage" element = {<QuizPage/>}/>
      </Routes>
    </BrowserRouter>
  
  )
}

export default App
