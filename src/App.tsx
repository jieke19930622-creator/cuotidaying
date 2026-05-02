/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, BookOpen, Clock, Settings, Plus, LayoutGrid, List } from 'lucide-react';
import { Question } from './types';
import OCRScanner from './components/OCRScanner';
import HistoryList from './components/HistoryList';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'notebook'>('scan');
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mistake-mastery-notebook');
    if (stored) {
      try {
        setSavedQuestions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved questions', e);
      }
    }
  }, []);

  const saveToNotebook = (question: Question) => {
    const updated = [question, ...savedQuestions];
    setSavedQuestions(updated);
    localStorage.setItem('mistake-mastery-notebook', JSON.stringify(updated));
  };

  const deleteFromNotebook = (id: string) => {
    const updated = savedQuestions.filter(q => q.id !== id);
    setSavedQuestions(updated);
    localStorage.setItem('mistake-mastery-notebook', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-8 py-4 mb-2 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              P
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">错题举一反三打印机</h1>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-full">
            <button 
              onClick={() => setActiveTab('scan')}
              className={cn(
                "px-6 py-2 rounded-full transition-all text-sm font-medium",
                activeTab === 'scan' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              错题识别
            </button>
            <button 
              onClick={() => setActiveTab('notebook')}
              className={cn(
                "px-6 py-2 rounded-full transition-all text-sm font-medium",
                activeTab === 'notebook' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              我的错题本
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'scan' ? (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OCRScanner onSave={saveToNotebook} />
            </motion.div>
          ) : (
            <motion.div
              key="notebook"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HistoryList questions={savedQuestions} onDelete={deleteFromNotebook} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <NavButton 
            active={activeTab === 'scan'} 
            onClick={() => setActiveTab('scan')}
            icon={<Camera className="w-6 h-6" />}
            label="拍照识题"
          />
          <NavButton 
            active={activeTab === 'notebook'} 
            onClick={() => setActiveTab('notebook')}
            icon={<BookOpen className="w-6 h-6" />}
            label="错题本"
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 relative group",
        active ? "text-primary" : "text-slate-400 hover:text-slate-600"
      )}
    >
      <div className={cn(
        "p-1 rounded-lg transition-all",
        active && "bg-primary/10 text-primary-dark"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div 
          layoutId="tab-indicator"
          className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-primary"
        />
      )}
    </button>
  );
}
