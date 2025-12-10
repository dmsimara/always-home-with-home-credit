import React, { useState, useEffect } from 'react';
import { X, BookOpen, User, Star } from 'lucide-react';
import { getNextStorySegment } from '../services/geminiService';

interface StoryModeModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const INITIAL_CONTEXT = "You are a small business owner in a Barangay in Manila. You run a Sari-Sari store. Business is okay, but your loan payment for your refrigerator is due in 3 days. You have just enough cash, but your supplier offers a bulk discount on soft drinks today only.";

const StoryModeModal: React.FC<StoryModeModalProps> = ({ onClose, onComplete }) => {
  const [history, setHistory] = useState<string>(INITIAL_CONTEXT);
  const [currentText, setCurrentText] = useState<string>("You are a small business owner. Your loan payment is due in 3 days, but your supplier offers a huge discount on stock today. What do you do?");
  const [options, setOptions] = useState<{A: string, B: string}>({
    A: "Buy the stock to make more profit later.",
    B: "Skip the stock and keep cash for the loan."
  });
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(1);

  const handleChoice = async (choiceLabel: string, choiceText: string) => {
    setLoading(true);
    
    // Simulate end of game after 3 turns for MVP
    if (turn >= 3) {
        onComplete();
        return;
    }

    const response = await getNextStorySegment(history, choiceText);
    
    // Naive parsing for MVP - in production use structured JSON output
    // Assuming response format [Story]\nOption A:...\nOption B:...
    const parts = response.split('\n').filter(line => line.trim().length > 0);
    const storyPart = parts[0];
    const optionA = parts.find(p => p.includes("Option A"))?.replace("Option A:", "").trim() || "Continue carefully.";
    const optionB = parts.find(p => p.includes("Option B"))?.replace("Option B:", "").trim() || "Take a risk.";

    setCurrentText(storyPart);
    setOptions({ A: optionA, B: optionB });
    setHistory(prev => prev + ` User chose: ${choiceText}. Result: ${storyPart}`);
    setTurn(prev => prev + 1);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700 animate-slide-up relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={24} />
        </button>

        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indigo-900 shadow-lg shadow-indigo-500/50">
                <BookOpen className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Financial Quest: Chapter {turn}</h2>
            <p className="text-indigo-300 text-sm mb-6">Make the right choices to boost your reputation.</p>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 min-h-[120px] flex items-center justify-center">
                {loading ? (
                    <div className="flex gap-2">
                         <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                         <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                         <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                ) : (
                    <p className="text-gray-200 text-lg leading-relaxed font-serif italic">"{currentText}"</p>
                )}
            </div>

            <div className="space-y-3">
                <button 
                    onClick={() => handleChoice('A', options.A)}
                    disabled={loading}
                    className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all text-left flex items-center gap-4 group"
                >
                    <div className="bg-white/20 w-8 h-8 rounded flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-white group-hover:text-indigo-600 transition-colors">A</div>
                    {options.A}
                </button>
                <button 
                    onClick={() => handleChoice('B', options.B)}
                    disabled={loading}
                    className="w-full p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all text-left flex items-center gap-4 group"
                >
                    <div className="bg-white/10 w-8 h-8 rounded flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-white group-hover:text-gray-800 transition-colors">B</div>
                    {options.B}
                </button>
            </div>
        </div>

        <div className="bg-gray-800 p-3 text-center text-xs text-gray-500 border-t border-gray-700">
            Powered by Generative AI • Choices impact your in-game score
        </div>

      </div>
    </div>
  );
};

export default StoryModeModal;
