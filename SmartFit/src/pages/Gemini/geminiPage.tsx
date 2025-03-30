import { GeminiCard } from "@/components/geminiComponents/gemini"; // Import the correct component

function GeminiPage() {
  return (
    <div>
      <h1>Welcome to the Gemini page</h1>
      <GeminiCard /> {/* Use GeminiCard instead of Gemini */}
    </div>
  );
}

export default GeminiPage;