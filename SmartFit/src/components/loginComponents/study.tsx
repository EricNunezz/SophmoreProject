//import the utility function for combining css classes 
import { cn } from "@/lib/utils"
//import the button component from UI components folder
import { Button } from "@/components/ui/button"
//import card-related components from ui components folder 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
//import the input component from our UI components
import { Input } from "@/components/ui/input"
//import the label component from our UI component 
import { Label } from "@/components/ui/label"
//import the useState hook from react (used to create and manage state variables)
import { useState } from "react"
//import the supabase client that connects to our backend database
import { supabase } from "@/lib/supabaseClient"
//import link for navigation and useNavigate hook from react-router-dom
import { Link, useNavigate } from "react-router-dom"


//define and export a functional component names loginform 
//it accepts classname and other props that a div woul dnormally accept 
export function LoginForm({
  className, 
  ...props
}: React.ComponentProps<"div">){
  //get the navigate function from react router for programatic navigation 
  const navigate = useNavigate();

  //create state variables and their setter functions using useState

  //for storing the email input value
  const[email, setEmail] = useState("");
  //for storing the password input data 
  const[password, setPassword] = useState("");
  //for storing error or success messages
  const[message, setMessage] = useState("");
  //for tracking if an authentification request is in progress
  const [isLoading, setIsLoading] = useState(false);


  //need to define a function to handle form submission 
  //this is an async function because it will make an api call to supabase
  const handleSubmit = async (event: React.FormEvent) => {
    //prevent the default form submission behavior (page reload)
    event.preventDefault();
    //clear any previous messages 
    setMessage("")

    //set loading state to true to show loading indicator
    setIsLoading(true)


    try{
      //call supabase authentification apu to sign in with email and password 
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email, 
        password: password,
      });

      //if there was an error during authentification
      if(error){
        //display the error message 
        setMessage(error.message);
        //clear the password field for security 
        setPassword("")
        //exit the function early 
        return;
      }

      //if authentification was successfull (data exists)
      if (data){
        //navigate to the dashboard page (need to change)
        navigate("/dashboard");
      }
    }catch(error){
      //handle any unexpected errors that werent returned 
      setMessage("An unexpected error occured")
    }finally{
      //whether the login was successful or not, set loading state to false
      setIsLoading(false)
    }
  };
  //return jsx to rendor the component 
  return (
    // Main container div with className combining default styles and any passed in className
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      {/* Card component for the login form */}
      <Card className="w-full">
        {/* Card header section with title and description */}
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-3xl font-bold">Login to your account</CardTitle>
          <CardDescription className="text-lg">
            Enter your email and password to access your SmartFit profile
          </CardDescription>
        </CardHeader>
        
        {/* Card content section containing the form */}
        <CardContent>
          {/* Form element with onSubmit handler */}
          <form onSubmit={handleSubmit}>
            {/* Container for form elements with vertical layout */}
            <div className="flex flex-col gap-8">
              {/* Conditional rendering: only show message if it exists */}
              {message && (
                <div className="bg-destructive/15 text-destructive text-base p-4 rounded-md">
                  {message}
                </div>
              )}
              
              {/* Email input section */}
              <div className="grid gap-4">
                {/* Label for the email input */}
                <Label htmlFor="email" className="text-lg font-medium">Email</Label>
                
                {/* Email input field */}
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email} // Controlled input - value comes from state
                  onChange={(e) => setEmail(e.target.value)} // Update state when input changes
                  required // HTML validation - field must be filled
                  className="h-14 text-lg px-4" // Custom styling
                />
              </div>
              
              {/* Password input section */}
              <div className="grid gap-4">
                <div className="flex items-center">
                  {/* Label for the password input */}
                  <Label htmlFor="password" className="text-lg font-medium">Password</Label>
                </div>
                
                {/* Password input field */}
                <Input 
                  id="password" 
                  type="password" // Hide input text for security
                  value={password} // Controlled input - value comes from state
                  onChange={(e) => setPassword(e.target.value)} // Update state when input changes
                  required // HTML validation - field must be filled
                  className="h-14 text-lg px-4" // Custom styling
                />
              </div>
              
              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-medium mt-2"
                disabled={isLoading} // Disable button during loading
              >
                {/* Button text changes based on loading state */}
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            
            {/* Sign up link section */}
            <div className="mt-8 text-center text-lg">
              Don&apos;t have an account?{" "}
              {/* Link to registration page */}
              <Link to="/register" className="text-primary underline underline-offset-4 hover:text-primary/90 font-semibold">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

/*
Key Concepts

1. Component Structure: 
  - this is a react functional component that renders a login form 
  - its exported so it can be imported and used in other parts of the application 

2. Props Handling: 
  - The component accepts className and other props that would normally 
    be accepted by a div element 
  - React.ComponentProps<"div"> is a TypeScript utility type that specifies the component 
    accepts all props a standard HTML div would accept
  - The ...props syntax uses the spread operator to pass through any addditional props to
    the root div element

3. React Router Integration: 
  - useNavigate is a hook from react router that returns a navigation function 
  - this function is stored in navigate and used to programmatically redirect users
    after successful login 
  - Link is a component from react router used to create navigation links (to registration page)

4. State Management: 
  - Four state variables are created using teh useState hook: 
      - email: stores the users email input 
      - password: stores the users password 
      - message: stores error or success messages 
      - isLoading: tracks whether authentification is in progress 

5. Form Handling: 
  - handleSubmit is an async function that processes the form submission 
  - event.preventDefault() stops the default browser form submision behavior
  - controlled inputs are used, where React state manages the input values 





*/