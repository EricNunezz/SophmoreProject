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
import { Link, useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setMessage(error.message);
        setPassword("")
        return;
      }

      if (data) {
        navigate("/dashboard");
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
          <CardTitle className="text-3xl font-bold">Login to your account</CardTitle>
          <CardDescription className="text-lg">
            Enter your email and password to access your SmartFit profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              {message && (
                <div className="bg-destructive/15 text-destructive text-base p-4 rounded-md">
                  {message}
                </div>
              )}
              
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
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-medium mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            
            <div className="mt-8 text-center text-lg">
              Don&apos;t have an account?{" "}
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
