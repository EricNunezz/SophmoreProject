import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function getGeminiResponse(prompt: string): Promise<string> {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      return "No valid response received from Gemini API";
    }
    
    return responseText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    return `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
  }
}
