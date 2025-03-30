import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getGeminiResponse } from "@/lib/api";

export function GeminiCard() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testGeminiAPI = async () => {
    console.log("Button clicked, testing API...");
    setIsLoading(true);
    setResponse("Loading...");

    try {
      const result = await getGeminiResponse(
        "Hello Gemini! You are a personal trainer can you give me some broad adcice when it comes to lifting, eating right, and overall health."
      );
      console.log("API Result:", result);
      setResponse(result || "No response received");
    } catch (error) {
      console.error("Error testing Gemini API:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : "Failed to get response from Gemini API"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button size="lg" onClick={testGeminiAPI} disabled={isLoading}>
        {isLoading ? "Testing..." : "Test Gemini API"}
      </Button>

      {response && (
        <div className="mt-4 p-4 border rounded max-w-xl">
          <h3 className="font-bold mb-2">API Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}