import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, BookOpen } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';

interface AiMentorProps {
  user: UserProfile;
}

const AiMentor: React.FC<AiMentorProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `Kumusta ${user.name}! I'm SafeRoute, your personal money guide. Ask me about your loan, budget, or how to save points.`,
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        // Add current user message to history for the API call
        history.push({ role: 'user', text: input });

        const userContext = `User Level: ${user.level}, Reputation: ${user.reputationScore}. The user is conscientious but sometimes worries about cash flow.`;
        
        const responseText = await getFinancialAdvice(history, userContext);
        
        const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
        console.error(error);
        // Error handling is managed inside service but we could add a UI toast here
    } finally {
        setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "How to increase Trust Score?",
    "Explain my interest rate.",
    "I might be late on payment.",
    "Help me save ₱500."
  ];

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#E30613] p-4 flex items-center justify-between text-white shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={20} className="text-yellow-300" />
            </div>
            <div>
                <h3 className="font-bold">Financial Mentor</h3>
                <p className="text-xs text-red-100 flex items-center gap-1">
                   <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
            </div>
         </div>
         <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Lessons">
            <BookOpen size={20} />
         </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                ${msg.role === 'user' ? 'bg-red-100 text-[#E30613]' : 'bg-gray-200 text-gray-600'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
             </div>
             <div className={`
                max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-[#E30613] text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
             `}>
               {msg.text}
             </div>
          </div>
        ))}
        {loading && (
           <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                 <Bot size={14} />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1">
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (only if few messages) */}
      {messages.length < 3 && (
        <div className="px-4 pb-2 bg-gray-50 overflow-x-auto scrollbar-hide shrink-0">
           <div className="flex gap-2">
              {suggestions.map((s, i) => (
                 <button 
                    key={i} 
                    onClick={() => { setInput(s); }}
                    className="whitespace-nowrap px-3 py-1.5 bg-white border border-red-100 rounded-full text-xs text-[#E30613] hover:bg-red-50 transition-colors shadow-sm"
                 >
                    {s}
                 </button>
              ))}
           </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
         <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E30613] focus:bg-white transition-all text-sm"
            />
            <button 
               onClick={handleSend}
               disabled={!input.trim() || loading}
               className={`absolute right-2 p-2 rounded-lg transition-colors
                  ${!input.trim() || loading ? 'text-gray-300' : 'bg-[#E30613] text-white hover:bg-red-700 shadow-sm'}
               `}
            >
               <Send size={16} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default AiMentor;