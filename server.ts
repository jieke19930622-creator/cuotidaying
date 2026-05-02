import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 解析 JSON 请求体，限制大小以支持图片上传
  app.use(express.json({ limit: '10mb' }));

  // 初始化 Gemini AI (仅在服务端)
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // --- API 路由 ---

  // 1. OCR 识别接口
  app.post('/api/ocr', async (req, res) => {
    try {
      if (!ai) throw new Error('GEMINI_API_KEY is not configured on server');
      
      const { image } = req.body; // base64 string

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              mimeType: "image/png",
              data: image.split(",")[1],
            },
          },
          {
            text: "Extract the educational question from this image. Identify the question content, options (if any), answer (if visible), and explanation (if visible). Also, determine the single most relevant core knowledge point. Return as JSON.",
          },
        ],
        config: {
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
          },
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error('Server OCR Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. 举一反三生成接口
  app.post('/api/variations', async (req, res) => {
    try {
      if (!ai) throw new Error('GEMINI_API_KEY is not configured on server');
      
      const { question, knowledgePoint } = req.body;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on the following original question and its core knowledge point "${knowledgePoint}", generate 3 similar variation questions.
        Original Question: ${question}
        
        Requirements:
        1. Cover the same knowledge point from different angles.
        2. Include correct answers and explanations focusing on common mistakes.`,
        config: {
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
            },
          },
        },
      });

      res.json(JSON.parse(response.text || '[]'));
    } catch (error: any) {
      console.error('Server Variations Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite 中介层 ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // 生产环境下提供静态文件
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
