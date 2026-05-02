import React, { useState } from 'react';
import { Trash2, FileDown, Eye, CheckSquare, Square, Search, Printer, Share2, BookOpen } from 'lucide-react';
import { Question } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { generatePDF } from '../lib/pdfUtils';

interface HistoryListProps {
  questions: Question[];
  onDelete: (id: string) => void;
}

export default function HistoryList({ questions, onDelete }: HistoryListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDetail, setViewingDetail] = useState<Question | null>(null);

  const filteredQuestions = questions.filter(q => 
    q.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.knowledgePoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  };

  const handlePrint = async () => {
    const selected = questions.filter(q => selectedIds.includes(q.id));
    if (selected.length === 0) {
      alert('请选择要打印的错题');
      return;
    }
    await generatePDF(selected);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Controls */}
      <div className="sticky top-[80px] z-40 bg-slate-50/80 backdrop-blur-md py-4 transition-all">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-sm"
              placeholder="搜索题目、知识点..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={selectAll}
                className="px-4 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                全选题目
              </button>
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                已选中 <span className="text-primary">{selectedIds.length}</span> 项
              </span>
            </div>

            <button 
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary-dark disabled:opacity-50 disabled:shadow-none"
            >
              <Printer className="w-4 h-4" /> 批量打印 PDF
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <BookOpen className="w-8 h-8 text-slate-200" />
             </div>
             <p className="text-slate-400 font-medium">暂无记录</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div 
              key={q.id}
              className={cn(
                "group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all",
                selectedIds.includes(q.id) && "ring-2 ring-primary border-primary/20 bg-primary/5 shadow-indigo-100"
              )}
            >
              <div className="flex gap-5">
                <button 
                  onClick={() => toggleSelect(q.id)}
                  className="mt-0.5"
                >
                  {selectedIds.includes(q.id) ? (
                    <div className="w-6 h-6 bg-primary rounded bg-primary flex items-center justify-center">
                       <CheckSquare className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-slate-200 rounded group-hover:border-primary transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/20">
                      {q.knowledgePoint}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-800 font-medium line-clamp-2 mb-4 text-sm leading-relaxed">
                    {q.content}
                  </p>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewingDetail(q)}
                      className="px-4 py-2 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 border border-slate-100"
                    >
                      <Eye className="w-3.5 h-3.5" /> 详情预览
                    </button>
                    <button 
                      onClick={() => onDelete(q.id)}
                      className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {viewingDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setViewingDetail(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h4 className="font-bold text-slate-800">错题详情</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{viewingDetail.knowledgePoint}</p>
                </div>
                <button 
                  onClick={() => setViewingDetail(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <Trash2 className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {/* Original */}
                 <section className="space-y-4">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     原题内容 <div className="h-[1px] flex-1 bg-slate-100" />
                   </div>
                   {viewingDetail.originalImage && (
                     <img src={viewingDetail.originalImage} className="w-full rounded-2xl border border-slate-100 mb-4" />
                   )}
                   <div className="font-serif text-slate-800 leading-relaxed text-lg">
                      <ReactMarkdown>{viewingDetail.content}</ReactMarkdown>
                   </div>
                   {viewingDetail.options && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {viewingDetail.options.map((opt, i) => (
                         <div key={i} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 flex items-start gap-2">
                            <span className="font-bold text-primary">{String.fromCharCode(65 + i)}.</span>
                            <span>{opt}</span>
                         </div>
                       ))}
                     </div>
                   )}
                   <div className="p-4 bg-green-50 rounded-2xl border border-green-100/50">
                      <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest block mb-1">答案</span>
                      <p className="text-green-900 font-bold">{viewingDetail.answer}</p>
                   </div>
                 </section>

                 {/* Variations */}
                 <section className="space-y-6">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     举一反三变式 <div className="h-[1px] flex-1 bg-slate-100" />
                   </div>
                   {viewingDetail.variations?.map((v, i) => (
                     <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                       <div className="text-[10px] font-bold text-primary uppercase tracking-widest">变式 {i + 1}</div>
                       <div className="font-serif text-slate-800 leading-relaxed">
                         <ReactMarkdown>{v.content}</ReactMarkdown>
                       </div>
                       {v.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {v.options.map((opt, oi) => (
                            <div key={oi} className="p-2 px-3 bg-white border border-slate-100 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                              <span className="font-bold text-primary">{String.fromCharCode(65 + oi)}.</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                       )}
                       <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">答案与解析</p>
                          <div className="text-[11px] text-amber-900/80 leading-relaxed mb-1">
                            <ReactMarkdown>{v.explanation}</ReactMarkdown>
                          </div>
                          <p className="text-[11px] font-bold text-amber-900">正确答案: {v.answer}</p>
                       </div>
                     </div>
                   ))}
                 </section>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                 <button 
                  onClick={() => setViewingDetail(null)}
                  className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                 >
                   关闭
                 </button>
                 <button 
                  onClick={() => {
                    generatePDF([viewingDetail]);
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                 >
                   <Printer className="w-4 h-4" /> 打印当前
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
