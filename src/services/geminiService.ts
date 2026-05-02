import { OCRResult, Variation } from "../types";

export async function performOCR(base64Image: string): Promise<OCRResult> {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to perform OCR');
  }

  return response.json() as Promise<OCRResult>;
}

export async function generateVariations(question: OCRResult): Promise<Variation[]> {
  const response = await fetch('/api/variations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      question: question.content, 
      knowledgePoint: question.knowledgePoint 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate variations');
  }

  return response.json() as Promise<Variation[]>;
}
