
import React, { useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Info, MessageSquare } from 'lucide-react';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  hasDocs: boolean;
  botName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, hasDocs, botName }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && hasDocs) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{botName}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">Ready to help</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!hasDocs && (
            <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Info size={16} />
              Knowledge base is empty
            </div>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <MessageSquare size={20} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 border border-blue-100">
              <Bot size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">How can I assist you today?</h3>
              <p className="text-slate-500 mt-3 leading-relaxed">
                I'm {botName}, your intelligent support assistant. I have access to your company's latest documentation to provide accurate answers.
              </p>
            </div>
            {!hasDocs && (
              <div className="w-full bg-slate-900 text-white p-6 rounded-3xl text-sm shadow-xl">
                <p className="font-bold mb-2 flex items-center gap-2">
                  <Info size={16} className="text-blue-400" />
                  Admin Setup Required
                </p>
                <p className="opacity-80">
                  Please head over to the <strong>Admin Panel</strong> to upload your knowledge base documents. The bot cannot respond without data.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                  ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-slate-200'}
                `}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`
                  max-w-[85%] p-5 md:p-6 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none prose prose-slate max-w-none'}
                `}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[10px] mt-4 font-bold opacity-40 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="max-w-4xl mx-auto flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-3xl rounded-tl-none shadow-sm flex items-center">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white border-t border-slate-200 p-6 md:p-10 shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!hasDocs || isLoading}
              placeholder={hasDocs ? "Type your question here..." : "Awaiting documentation..."}
              className={`
                w-full py-5 pl-8 pr-20 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 font-medium
                ${(!hasDocs || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !hasDocs}
              className={`
                absolute right-3 w-14 h-14 rounded-full flex items-center justify-center transition-all
                ${(!input.trim() || isLoading || !hasDocs) 
                  ? 'text-slate-300 bg-slate-100' 
                  : 'text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95'}
              `}
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          </form>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Doc-Aware
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Secure
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Real-time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
