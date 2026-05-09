
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { analyzeAgencyData } from '@/services/gemini';
import { Booking, Transaction } from '@/types';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface Props {
  bookings: Booking[];
  transactions: Transaction[];
  isDarkMode?: boolean;
}

const AIChat: React.FC<Props> = ({ bookings, transactions, isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Terminal Online. I am your Gemini Agency Intelligence. Ask me for data correlation or financial audits. (বাংলায় সাহায্য চাইলে বলুন)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const aiResponse = await analyzeAgencyData(bookings, transactions, userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', content: aiResponse || 'Connection Error: Response Empty.' }]);
    setLoading(false);
  };

  return (
    <div className={`flex flex-col h-[75vh] md:h-[calc(100vh-180px)] max-w-5xl mx-auto rounded-[32px] md:rounded-[40px] border-2 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 transition-all ${
      isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/50'
    }`}>
      <div className={`p-5 md:p-8 border-b flex items-center justify-between vibrant-gradient text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        <div className="flex items-center gap-3 md:gap-5 relative z-10">
          <div className="bg-white/20 p-2 md:p-3 rounded-2xl backdrop-blur-md">
            <Sparkles size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="font-black text-sm md:text-lg uppercase tracking-tight leading-none">Gemini Intelligence</h2>
            <p className="text-[9px] md:text-[10px] font-bold text-violet-100 uppercase tracking-widest opacity-80 underline underline-offset-4 mt-1">Advanced Neural Analytics</p>
          </div>
        </div>
        <div className="hidden sm:block px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-widest uppercase">
          Latency: 140ms
        </div>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 no-scrollbar ${isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50/30'}`}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 md:gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[20px] flex items-center justify-center shrink-0 shadow-lg ${
              m.role === 'ai' 
                ? isDarkMode ? 'bg-slate-800 text-violet-400 border border-slate-700' : 'bg-white text-violet-600 border border-violet-100' 
                : 'vibrant-gradient text-white'
            }`}>
              {m.role === 'ai' ? <Bot size={18} className="md:w-5.5 md:h-5.5" /> : <User size={18} className="md:w-5.5 md:h-5.5" />}
            </div>
            <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'ai' 
                ? isDarkMode ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50' : 'bg-white text-slate-700 rounded-tl-none border border-violet-50'
                : 'bg-indigo-600 text-white rounded-tr-none font-medium'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 md:gap-5 animate-pulse">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[20px] flex items-center justify-center shrink-0 shadow-lg ${
              isDarkMode ? 'bg-slate-800 text-violet-400' : 'bg-white text-violet-600'
            }`}>
              <Bot size={18} />
            </div>
            <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm rounded-tl-none flex items-center gap-3 border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-violet-50 text-slate-400'
            }`}>
              <Loader2 className="animate-spin text-violet-600" size={16} />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Parsing Agency Data...</span>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 md:p-8 border-t transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex gap-2 md:gap-4 p-1.5 md:p-2 rounded-2xl md:rounded-[28px] border-2 border-slate-200 dark:border-slate-800 focus-within:border-violet-500/50 transition-all bg-slate-50/50 dark:bg-slate-950/20">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Query agency performance..."
            className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-transparent outline-none text-base md:text-sm font-bold placeholder:text-slate-400 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="vibrant-gradient text-white px-5 md:px-8 rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-violet-500/30 transition-all flex items-center justify-center shrink-0"
          >
            <Send size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
