import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  persona: string;
  onApplySpecificChange: (index: number) => void;
}

const SUGGESTIONS = [
  "Can we make it brighter?",
  "Suggest a different rug",
  "What about wood flooring?",
  "Add some plants"
];

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading, persona, onApplySpecificChange }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f9f8f6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8c7a6b] flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-serif font-medium text-[#1a1a1a]">{persona}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider">AI Interior Designer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
          <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-[#f0edea] text-[#8c7a6b]'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[75%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#1a1a1a] text-white rounded-tr-sm' : 'bg-[#f9f8f6] text-gray-800 rounded-tl-sm border border-gray-100'}`}>
              {msg.role === 'user' ? (
                <p className="text-sm leading-relaxed">{msg.text}</p>
              ) : (
                <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-a:text-[#8c7a6b]">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
          {msg.role === 'model' && idx > 0 && (
            <div className={`flex justify-start ml-11 -mt-4 mb-2`}>
              <button
                onClick={() => onApplySpecificChange(idx)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white border border-[#e0dcd8] text-[#8c7a6b] text-xs rounded-full hover:bg-[#f9f8f6] hover:border-[#8c7a6b] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles size={12} />
                Apply this idea
              </button>
            </div>
          )}
        </React.Fragment>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f0edea] text-[#8c7a6b] flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-[#f9f8f6] rounded-2xl rounded-tl-sm p-4 border border-gray-100 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-[#8c7a6b]" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-3 py-1.5 bg-[#f0edea] text-[#8c7a6b] text-xs rounded-full hover:bg-[#e0dcd8] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about materials, colors..."
            className="w-full pl-4 pr-12 py-3 bg-[#f9f8f6] border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8c7a6b] focus:border-transparent text-sm transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
