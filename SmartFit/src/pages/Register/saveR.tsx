

import {supabase} from "@/lib/supabaseClient";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function Register(){
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const[message, setMessage] = useState("")

  const handleSubmit = async (event: React.FormEvent) =>{
    event.preventDefault();
    setMessage("")

    const{data, error} = await supabase.auth.signUp({
      email: email,
      password: password, 

    });
    if(error){
      setMessage(error.message);
      return;
    }

    if(data){
      setMessage("User Account Created");
    }

    setEmail("")
    setPassword("")
  };




  return(
    <div>
      <h1> Register</h1>
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
         
        <button type = "submit">Register</button>

      </form>
      <span>Already have an account?</span>
      <br></br>
      <Link to = "/login">Log In.</Link>

    </div>
  )
}

export default Register;