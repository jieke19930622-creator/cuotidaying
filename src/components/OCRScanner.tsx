import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Check, ChevronRight, Loader2, RefreshCw, Save, Sparkles, Plus } from 'lucide-react';
import { performOCR, generateVariations } from '../services/geminiService';
import { OCRResult, Variation, Question } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface OCRScannerProps {
  onSave: (question: Question) => void;
}

export default function OCRScanner({ onSave }: OCRScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setOcrResult(null);
        setVariations([]);
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startOCR = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const result = await performOCR(image);
      setOcrResult(result);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!ocrResult) return;
    setIsGenerating(true);
    try {
      const result = await generateVariations(ocrResult);
      setVariations(result);
    } catch (error) {
      console.error('Generation Error:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!ocrResult) return;
    const question: Question = {
      id: crypto.randomUUID(),
      originalImage: image || undefined,
      content: ocrResult.content,
      options: ocrResult.options,
      answer: ocrResult.answer || '',
      explanation: ocrResult.explanation || '',
      knowledgePoint: ocrResult.knowledgePoint,
      variations: variations,
      createdAt: Date.now(),
    };
    onSave(question);
    setSaved(true);
  };

  const reset = () => {
    setImage(null);
    setOcrResult(null);
    setVariations([]);
    setIsGenerating(false);
    setIsProcessing(false);
    setSaved(false);
  };

  if (ocrResult) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">原题识别内容</label>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> 识别成功
              </h3>
            </div>
            <button className="text-primary text-xs font-semibold">手动修正</button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
               <textarea 
                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 text-sm font-medium leading-relaxed resize-none"
                value={ocrResult.content}
                onChange={(e) => setOcrResult({...ocrResult, content: e.target.value})}
                rows={4}
               />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">知识点诊断</label>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-xs font-semibold border border-primary/20">
                  {ocrResult.knowledgePoint}
                </span>
                <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-md text-xs font-semibold border border-slate-200">
                  AI 分析
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <h4 className="text-amber-800 text-xs font-bold mb-1">识别建议</h4>
          <p className="text-amber-700 text-sm leading-snug">
            系统已自动提取题目核心信息。若解析部分包含特殊公式，建议手动检查以确保打印无误。
          </p>
        </div>

        {!variations.length ? (
          <button
            onClick={handleGenerateVariations}
            disabled={isGenerating}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在生成举一反三题目...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成举一反三题目
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">举一反三变式推荐 (3道题)</h2>
              <button 
                onClick={handleGenerateVariations}
                disabled={isGenerating}
                className="text-gray-500 text-sm hover:text-primary flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                重新生成
              </button>
            </div>

            {variations.map((v, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">变式 0{i + 1} / 考点巩固</span>
                </div>
                <div className="markdown-body text-gray-800 font-medium leading-relaxed mb-4">
                  <ReactMarkdown>{v.content}</ReactMarkdown>
                </div>
                
                <details className="group">
                  <summary className="text-xs font-bold text-slate-400 cursor-pointer list-none flex items-center gap-1 group-open:text-primary transition-colors">
                    查看解析及易错点 ▼
                  </summary>
                  <div className="mt-3 pt-3 border-t border-dashed border-slate-100 text-sm">
                    <div className="text-gray-600 mb-2">
                       <span className="font-bold text-slate-800">答案：</span>
                       <span className="text-green-600 font-bold">{v.answer}</span>
                    </div>
                    <div className="text-gray-600 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100/50">
                       <span className="font-bold text-amber-800 block mb-1">易错提示：</span>
                       <ReactMarkdown>{v.explanation}</ReactMarkdown>
                    </div>
                  </div>
                </details>
              </motion.div>
            ))}

            <div className="h-20" /> {/* Spacer for floating buttons if needed */}
            
            <div className="flex gap-4 pt-4 sticky bottom-6 bg-slate-50/80 backdrop-blur-md p-2 rounded-2xl">
              <button
                disabled={saved}
                onClick={handleSave}
                className={cn(
                  "flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                  saved 
                    ? "bg-green-100 text-green-700 pointer-events-none" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-sm active:scale-95"
                )}
              >
                {saved ? <><Check className="w-5 h-5" /> 已保存至错题库</> : "保存至错题库"}
              </button>
              <button
                onClick={handleSave} // Simplified for UI demonstration, actual print logic in History
                className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                立即打印 PDF
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div 
        className={cn(
          "w-full aspect-[4/3] max-w-sm rounded-[2.5rem] bg-white border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group relative overflow-hidden",
          image && "border-solid border-primary/20"
        )}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        {image ? (
          <>
            <img src={image} className="w-full h-full object-cover" alt="Captured" />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
               <button 
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-rose-500 transition-colors"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
               <button 
                onClick={(e) => { e.stopPropagation(); startOCR(); }}
                disabled={isProcessing}
                className="bg-primary p-3 px-6 rounded-full text-white font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors"
               >
                 {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                 识别错题
               </button>
            </div>
            {isProcessing && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                 <div className="relative">
                   <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
                   <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                 </div>
                 <p className="text-sm font-bold text-primary-dark uppercase tracking-widest animate-pulse">AI 正在深度解析中...</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
               <Camera className="w-10 h-10 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-bold">拍摄错题照片</p>
              <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                 <Plus className="w-3 h-3" /> 点击或拖拽上传
              </p>
            </div>
          </>
        )}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
      />

      <div className="mt-12 w-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-slate-200" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 px-2">使用提示</span>
          <div className="h-[1px] flex-1 bg-slate-200" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
           <StepInfo 
            number="01" 
            title="拍照识别" 
            desc="对准错题并保持清晰" 
           />
           <StepInfo 
            number="02" 
            title="AI 变式" 
            desc="智能生成同类考点变式题" 
           />
           <StepInfo 
            number="03" 
            title="整理打印" 
            desc="收藏错题一键生成 PDF" 
           />
        </div>
      </div>
    </div>
  );
}

function StepInfo({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center">
      <span className="text-primary/20 text-4xl font-extrabold mb-2 leading-none">{number}</span>
      <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-[10px] text-slate-400 font-medium leading-tight">{desc}</p>
    </div>
  );
}
