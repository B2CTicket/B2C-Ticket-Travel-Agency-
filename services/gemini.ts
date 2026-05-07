
import { GoogleGenAI, Type } from "@google/genai";
import { Booking, Transaction } from "../types";

export const analyzeAgencyData = async (bookings: Booking[], transactions: Transaction[], query: string) => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("Gemini API Key is missing");
    return "AI service is currently unavailable. Please check configuration.";
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an AI Travel Agency Accounting Expert. 
    Analyze the following data and answer the user query:
    
    Agency Data:
    - Current Bookings: ${JSON.stringify(bookings)}
    - Transaction History: ${JSON.stringify(transactions)}
    - Base Currency: Bangladeshi Taka (BDT, ৳)
    
    User Query: ${query}
    
    Please provide professional, actionable insights in English or Bengali as per the user's language. 
    Focus on profit optimization, pending tasks, and financial health.
    When mentioning amounts, always use the ৳ symbol.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "I am having trouble analyzing the data right now. Please try again later.";
  }
};

export const generateForecast = async (bookings: Booking[]) => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("Gemini API Key is missing");
    return null;
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze these travel agency bookings: ${JSON.stringify(bookings)}.
    Base Currency: Bangladeshi Taka (BDT, ৳).
    1. Identify seasonal patterns (e.g., Hajj, Summer, Year-end).
    2. Forecast revenue and booking volume for the next 3 months in BDT.
    3. Suggest which services (Visa, Ticket, Hotel) will be in highest demand.
    
    Return the response as a valid JSON object with:
    - predictions: Array of { month: string, predictedRevenue: number, confidence: number }
    - insights: Array of string (bullet points, use ৳ for currency)
    - topService: string
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  predictedRevenue: { type: Type.NUMBER },
                  confidence: { type: Type.NUMBER }
                },
                required: ["month", "predictedRevenue", "confidence"]
              }
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            topService: { type: Type.STRING }
          },
          required: ["predictions", "insights", "topService"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Forecast Error:", error);
    return null;
  }
};
