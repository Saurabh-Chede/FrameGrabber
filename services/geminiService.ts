
/**
 * Service disabled to remove environment variable requirements.
 * AI analysis features are currently turned off.
 */
export const analyzeImage = async (
  base64Image: string,
  mimeType: string = "image/png",
  promptText: string = ""
): Promise<string> => {
  console.warn("AI Analysis is currently disabled.");
  return "AI Analysis disabled.";
};
