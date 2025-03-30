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
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("")
    setIsLoading(true)

    try {
      //register user with supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data && data.user) {  //checks if data exists and has a user Object
        setMessage("Account created successfully!");
        //after the user is created insert additional data into custom users table
        const {error: profileError} = await supabase
        .from("users")//my custom table
        .insert([
          {
            user_id: data.user.id,
            name: name, 
            email: data.user.email,
          }
        ]);

        if(profileError){
          setMessage("Error saving user profile: " + profileError.message);
          return;
        }
        setMessage("Account and profile created successfully!");
      } else{
          setMessage("Error: User Data Not Found");
      }

      //clear fields after successful registration
      setName("")
      setEmail("")
      setPassword("")
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
                <div className={`${message.includes("success") ? "bg-green-100 text-green-700" : "bg-destructive/15 text-destructive"} text-base p-4 rounded-md`}>
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
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="h-14 text-lg px-4"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-medium mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Register"}
              </Button>
            </div>
            
            <div className="mt-8 text-center text-lg">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline underline-offset-4 hover:text-primary/90 font-semibold">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
