import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layoutComponent/Layout";

function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        { }
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Welcome to <span className="text-teal-500">SmartFit</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mb-8">
              Your personalized AI-powered fitness journey starts here. Get customized workouts based on your goals and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button asChild size="lg" className="px-8 py-6 text-lg bg-teal-500 hover:bg-teal-600">
                <Link to="/Register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg border-teal-500 text-teal-600 hover:bg-teal-50">
                <Link to="/Login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home; 
