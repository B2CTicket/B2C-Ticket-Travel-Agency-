
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { analyzeAgencyData } from '../services/gemini';
import { Booking, Transaction } from '../types';

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
    <div className={`flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto rounded-[40px] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 transition-all ${
      isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
    }`}>
      <div className={`p-8 border-b flex items-center justify-between vibrant-gradient text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="font-black text-lg uppercase tracking-tight">Gemini Intelligence</h2>
            <p className="text-[10px] font-bold text-violet-100 uppercase tracking-widest opacity-80 underline underline-offset-4">Advanced Neural Analytics</p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-widest uppercase">
          Latency: 140ms
        </div>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar ${isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50/30'}`}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg ${
              m.role === 'ai' 
                ? isDarkMode ? 'bg-slate-800 text-violet-400 border border-slate-700' : 'bg-white text-violet-600 border border-violet-100' 
                : 'vibrant-gradient text-white'
            }`}>
              {m.role === 'ai' ? <Bot size={22} /> : <User size={22} />}
            </div>
            <div className={`max-w-[75%] p-5 rounded-3xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'ai' 
                ? isDarkMode ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50' : 'bg-white text-slate-700 rounded-tl-none border border-violet-50'
                : 'bg-indigo-600 text-white rounded-tr-none font-medium'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-5 animate-pulse">
            <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg ${
              isDarkMode ? 'bg-slate-800 text-violet-400' : 'bg-white text-violet-600'
            }`}>
              <Bot size={22} />
            </div>
            <div className={`p-6 rounded-3xl shadow-sm rounded-tl-none flex items-center gap-3 border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-violet-50 text-slate-400'
            }`}>
              <Loader2 className="animate-spin text-violet-600" size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Parsing Agency Data...</span>
            </div>
          </div>
        )}
      </div>

      <div className={`p-8 border-t transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex gap-4 p-2 rounded-[28px] border-2 border-slate-200 dark:border-slate-800 focus-within:border-violet-500/50 transition-all bg-slate-50/50 dark:bg-slate-950/20">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Query agency performance, tax, or sales logs..."
            className={`flex-1 px-6 py-3 bg-transparent outline-none text-sm font-bold placeholder:text-slate-400 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="vibrant-gradient text-white px-8 rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-violet-500/30 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
