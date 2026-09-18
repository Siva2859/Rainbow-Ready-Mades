import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { SHOP_INFO } from '../../utils/constants';

export const ChatbotWidget = ({ isOpen, onClose, onOpen }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! Welcome to ${SHOP_INFO.name}. I'm your store assistant. Ask me anything about our clothing collections, fabrics, sizes, 10-day return policy, 10 km delivery radius, or store hours!`,
      grounded: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    "What is your return & exchange policy?",
    "What is your local delivery range?",
    "What payment methods do you accept?",
    "Where is the store located and what are the hours?"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatService.sendMessage(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.response || "I don't have verified information about that for Rainbow Ready Mades.",
        grounded: res.grounded !== false,
        sources: res.sources || [],
        confidenceScore: res.confidence_score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I am having trouble connecting to the store knowledge base right now. Please verify the server is running or contact the store directly at " + SHOP_INFO.phone + ".",
        grounded: false,
        error: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-brand-navy via-slate-900 to-accent-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group ring-4 ring-accent-500/20"
          title="Ask Store Assistant"
          aria-label="Open Store Assistant"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"></span>
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1">
            Store Assistant
          </span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-brand-navy p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-600/30 border border-accent-400/40 flex items-center justify-center text-accent-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <span>{SHOP_INFO.name} Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                </h3>
                <span className="text-[11px] text-slate-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Grounded Store Knowledge
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : msg.error
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-100/50 text-[10px] text-slate-400">
                    <span>{msg.time}</span>
                    {msg.sender === 'bot' && msg.grounded && (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Store Fact
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-accent-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading typing indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>Checking verified shop records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Shown when only initial message exists) */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Suggested Questions:
              </span>
              <div className="flex gap-1.5 flex-nowrap pb-1">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 text-[11px] bg-white hover:bg-accent-50 text-slate-700 hover:text-accent-700 rounded-full border border-slate-200 whitespace-nowrap transition shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about shirts, sizes, policies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-accent-600 hover:bg-accent-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white transition shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
