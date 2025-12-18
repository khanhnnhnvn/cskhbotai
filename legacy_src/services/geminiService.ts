
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DocumentFile, Message, BotConfig } from "../types";

// Initialize AI with the pre-configured API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const queryDocuments = async (
  query: string,
  documents: DocumentFile[],
  botConfig: BotConfig,
  history: Message[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure it in the environment.");
  }

  // Use model from environment variable or fallback to the latest stable flash model
  const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  
  // Prepare document parts for Gemini
  const docParts = documents.map(doc => ({
    inlineData: {
      mimeType: doc.type,
      data: doc.base64
    }
  }));

  // Build the dynamic system instruction based on Admin settings
  const systemInstruction = `
    You are ${botConfig.name}, a professional customer support assistant.
    
    CORE RULES:
    1. Answer user questions accurately based ONLY on the provided documents.
    2. If multiple documents are provided, analyze all of them to find the answer.
    3. If the answer is not found in the documents, politely state that you do not have that information based on the current knowledge base.
    4. Always be helpful, concise, and professional.
    5. Format your responses using Markdown for better readability.
    
    SPECIFIC GUIDELINES FROM ADMIN:
    ${botConfig.rules || "None provided."}
  `;

  const contents = [
    {
      parts: [
        ...docParts,
        { text: `System Instruction: ${systemInstruction}` },
        { text: `Context: There are ${documents.length} document(s) uploaded. Use them to answer the question.` },
        { text: `User Question: ${query}` }
      ]
    }
  ];

  try {
    const result = await ai.models.generateContent({
      model,
      contents,
      config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      }
    });

    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to get response from AI model (${model}). Please check your configuration.`);
  }
};
