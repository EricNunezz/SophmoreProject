import { GeminiCard } from "@/components/geminiComponents/gemini"; 
import Layout from "@/components/layoutComponent/Layout";

function GeminiPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-800 dark:to-[#2E382E]">
        <GeminiCard /> 
      </div>
    </Layout>
  );
}

export default GeminiPage;