import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult, Variation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function performOCR(base64Image: string): Promise<OCRResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image.split(",")[1],
          },
        },
        {
          text: "Extract the educational question from this image. Identify the question content, options (if any), answer (if visible), and explanation (if visible). Also, determine the single most relevant core knowledge point (e.g., 'Quadratic Equations'). Return as JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          answer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          knowledgePoint: { type: Type.STRING },
        },
        required: ["content", "knowledgePoint"],
      },
    },
  });

  return JSON.parse(response.text || "{}") as OCRResult;
}

export async function generateVariations(question: OCRResult): Promise<Variation[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following original question and its core knowledge point "${question.knowledgePoint}", generate 3 similar variation questions (举一反三). 
    Original Question: ${question.content}
    
    Requirements:
    1. Cover the same knowledge point from different angles or variations.
    2. Difficulty should be similar or slightly more challenging.
    3. Each variation must include: content, options (if applicable), correct answer, and an explanation focusing on common mistakes (易错点解析).
    
    Return the result as a JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["content", "answer", "explanation"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]") as Variation[];
}
