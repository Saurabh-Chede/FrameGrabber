import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Analyzes an image using the Gemini 2.5 Flash model.
 * 
 * @param base64Image The base64 encoded string of the image (without the data prefix).
 * @param mimeType The mime type of the image (e.g., 'image/png').
 * @param promptText The question or instruction for the AI.
 * @returns The generated text response.
 */
export const analyzeImage = async (
  base64Image: string,
  mimeType: string = "image/png",
  promptText: string = "Describe this image in detail, focusing on key visual elements, lighting, and mood."
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing in environment variables.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Clean base64 string if it contains the data prefix
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze image. Please check your API key and try again.");
  }
};
