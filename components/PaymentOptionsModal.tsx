import React, { useState } from 'react';
import { Loan } from '../types';
import { X, CalendarClock, Divide, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentOptionsModalProps {
  loan: Loan | null;
  onClose: () => void;
  onApply: (action: string) => void;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ loan, onClose, onApply }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!loan) return null;

  const options = [
    {
      id: 'extend',
      title: 'Extend Due Date',
      description: 'Need more time? Add 3 extra days to pay. Iwas late fee!',
      icon: <CalendarClock className="text-orange-500" size={24} />,
      badge: 'Free (Use Pass)',
      color: 'hover:border-orange-200 hover:bg-orange-50'
    },
    {
      id: 'split',
      title: 'Pay Half Now',
      description: 'Short on cash? Pay 30% today, pay the rest later. Keep your record green.',
      icon: <Divide className="text-blue-500" size={24} />,
      badge: 'Popular',
      color: 'hover:border-blue-200 hover:bg-blue-50'
    },
    {
      id: 'gap',
      title: 'Emergency Top-up',
      description: 'Borrow a small amount just to cover this bill immediately.',
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      badge: 'Low Interest',
      color: 'hover:border-emerald-200 hover:bg-emerald-50'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in">
        
        {/* Header */}
        <div className="bg-[#E30613] p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold mb-1">Stay on Track</h2>
          <p className="text-red-100 text-sm">
            Don't worry. Here are ways to manage your payment for <strong>{loan.type}</strong>.
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {options.map((opt) => (
            <div 
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4
                ${selectedOption === opt.id ? 'border-[#E30613] bg-red-50' : 'border-gray-100 bg-white'}
                ${opt.color}
              `}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                {opt.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                   <h3 className="font-bold text-gray-800">{opt.title}</h3>
                   {opt.badge && (
                     <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                       {opt.badge}
                     </span>
                   )}
                </div>
                <p className="text-sm text-gray-500 leading-snug">{opt.description}</p>
              </div>
              
              {selectedOption === opt.id && (
                <div className="absolute -top-2 -right-2 bg-[#E30613] text-white rounded-full p-1">
                  <ArrowRight size={12} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button 
            disabled={!selectedOption}
            onClick={() => selectedOption && onApply(selectedOption)}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
              ${selectedOption 
                ? 'bg-[#E30613] text-white shadow-lg shadow-red-200 hover:bg-red-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            Apply Changes
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">
            Using these tools protects your Trust Score.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsModal;