export interface Question {
  id: string;
  originalImage?: string;
  content: string;
  options?: string[];
  answer: string;
  explanation: string;
  knowledgePoint: string;
  variations?: Variation[];
  createdAt: number;
}

export interface Variation {
  content: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface OCRResult {
  content: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  knowledgePoint: string;
}
