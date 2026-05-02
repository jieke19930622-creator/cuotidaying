import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY 未配置。' 
      });
    }

    const { question, knowledgePoint } = req.body;
    const ai = new GoogleGenAI(apiKey);
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["content", "answer", "explanation"],
          }
        }
      }
    });

    const prompt = `Based on the following original question and its core knowledge point "${knowledgePoint}", generate 3 similar variation questions.
    Original Question: ${question}
    
    Requirements:
    1. Cover the same knowledge point from different angles.
    2. Include correct answers and explanations focusing on common mistakes (易错点解析).`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    res.status(200).json(JSON.parse(responseText));
  } catch (error: any) {
    console.error('Variation Error:', error);
    res.status(500).json({ error: error.message });
  }
}
