import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Link } from "react-router-dom"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validatePasswords = () => {
    console.log("Validating passwords:", {password, confirmPassword});
    
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    
    if(trimmedPassword !== trimmedConfirmPassword){ 
      console.log("Passwords do not match");
      setPasswordError("Passwords do not match");
      return false;
    }

    if(trimmedPassword.length < 6){
      console.log("Password too short");
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }

    setPasswordError("");
    return true;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("")

    if(!validatePasswords()){
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    
    if(trimmedPassword !== trimmedConfirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    if(trimmedPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    
    setPasswordError("");
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: trimmedPassword,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data && data.user) {  
        setMessage("Account created successfully!");
        
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
      } else{
          setMessage("Error: User Data Not Found");
      }

    } catch (error) {
      setMessage("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="w-full">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-lg">
            Enter your details below to create your SmartFit account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              {message && (
                <div className={`${message.includes("success") ? "bg-teal-100 text-teal-700" : "bg-destructive/15 text-destructive"} text-base p-4 rounded-md`}>
                  {message}
                </div>
              )}
              
              <div className="grid gap-4">
                <Label htmlFor="name" className="text-lg font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-14 text-lg px-4"
                />
              </div>
              
              <div className="grid gap-4">
                <Label htmlFor="email" className="text-lg font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 text-lg px-4"
                />
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-lg font-medium">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setPassword(newValue);
                    if(confirmPassword) {
                      // Compare trimmed values
                      const trimmedNewValue = newValue.trim();
                      const trimmedConfirmPassword = confirmPassword.trim();
                      
                      if(trimmedNewValue !== trimmedConfirmPassword) {
                        setPasswordError("Passwords do not match");
                      } else if(trimmedNewValue.length < 6) {
                        setPasswordError("Password must be at least 6 characters long");
                      } else {
                        setPasswordError("");
                      }
                    }
                  }}
                  required 
                  className="h-14 text-lg px-4"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className = "grid gap-4">
                <div className = "flex items-center">
                  <Label htmlFor="confirmPassword" className="text-lg font-medium">Confirm Password</Label>
                </div>
                <Input
                  id = "confirmPassword"
                  type = "password"
                  value={confirmPassword}
                  onChange = {(e) => {
                    const newValue = e.target.value;
                    setConfirmPassword(newValue);
                    if(password) {
                      // Compare trimmed values
                      const trimmedPassword = password.trim();
                      const trimmedNewValue = newValue.trim();
                      
                      if(trimmedPassword !== trimmedNewValue) {
                        setPasswordError("Passwords do not match");
                      } else if(trimmedPassword.length < 6) {
                        setPasswordError("Password must be at least 6 characters long");
                      } else {
                        setPasswordError("");
                      }
                    }
                  }}
                  required
                  className={`h-14 text-lg px-4 ${passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordError}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-medium mt-2 bg-teal-500 hover:bg-teal-600"
                disabled={isLoading || Boolean(passwordError)}
              >
                {isLoading ? "Creating account..." : "Register"}
              </Button>
            </div>
            
            <div className="mt-8 text-center text-lg">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-500 underline underline-offset-4 hover:text-teal-600 font-semibold">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
