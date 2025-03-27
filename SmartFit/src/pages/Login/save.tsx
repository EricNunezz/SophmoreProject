


import {supabase} from "@/lib/supabaseClient";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//got to 29:28 minutes into video how to integrate supabse & react.js

function Login(){
  const navigate = useNavigate();
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const[message, setMessage] = useState("")

  const handleSubmit = async (event: React.FormEvent) =>{
    event.preventDefault();
    setMessage("")

    const{data, error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password, 

    });
    if(error){
      setMessage(error.message);
      setEmail("")
      setPassword("")
      return;
    }

    if(data){
      navigate("/dashboard");
      return null;
    }

   
  };


  return(
    <div>
      <h1> Login</h1>
      <br></br>

      {message && <span>{message}</span>}
      <form onSubmit={handleSubmit}>
        <input
        onChange={ (e) => setEmail(e.target.value)}
        value = {email}
        type = "email" 
        placeholder="Email"
        required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value = {password}
          type = "password" 
          placeholder="Password"
          required
         />
         
        <button type = "submit">Log In</button>

      </form>
      <span>Dont have an account?</span>
      <br></br>
      <Link to = "/register">Register.</Link>

    </div>
  )
}

export default Login;