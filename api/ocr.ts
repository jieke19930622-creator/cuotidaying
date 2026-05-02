import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    const { image } = req.body;
    const ai = new GoogleGenAI({ apiKey });
    // Use gemini-1.5-flash as it is more robust for serverless environments
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            knowledgePoint: { type: Type.STRING },
          },
          required: ["content", "knowledgePoint"],
        }
      }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/png",
          data: image.split(",")[1],
        },
      },
      {
        text: "Extract the educational question from this image. Identify the question content, options (if any), answer (if visible), and explanation (if visible). Also, determine the single most relevant core knowledge point. Return strictly as JSON object.",
      },
    ]);

    const responseText = result.response.text();
    res.status(200).json(JSON.parse(responseText));
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: error.message });
  }
}
