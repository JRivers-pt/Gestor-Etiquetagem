import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
};

export const enhanceProductDescription = async (desc: string, variety: string, origin: string, lang: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return desc + " (AI Disabled)";
  try {
    const prompt = `Describe nicely: ${desc}, ${variety}, ${origin}. Lang: ${lang}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text?.trim() || desc;
  } catch { return desc; }
};

export const suggestExpiryDate = async (name: string, lang: string): Promise<number> => {
   const ai = getAiClient();
   if (!ai) return 30;
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `Shelf life days for ${name}? Only number.`
     });
     return parseInt(response.text?.trim() || "10");
   } catch { return 10; }
}