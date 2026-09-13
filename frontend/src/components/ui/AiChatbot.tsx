import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { aiApi } from '../../api/client';
import { useAuthStore } from '../../store';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: "Hi! I'm FindIt's AI Assistant. How can I help you today?" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputVal.trim() || isLoading) return;
    
    const userMsg = inputVal.trim();
    setInputVal('');
    
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send the history (excluding IDs) to the backend
      const res = await aiApi.chat(newMessages.map(m => ({ role: m.role, content: m.content })));
      
      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: 'model', content: res.data.data.response }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: 'model', content: "Sorry, I'm having trouble connecting right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-glow text-white transition-colors duration-300",
          isOpen ? "opacity-0 pointer-events-none" : "bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800"
        )}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] flex flex-col bg-white dark:bg-navy-900 rounded-3xl shadow-floating border border-gray-100 dark:border-navy-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">FindIt Assistant</h3>
                  <p className="text-xs text-white/80">Powered by Gemini AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-navy-950/50">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={clsx(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={clsx(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    msg.role === 'user' ? "bg-gray-200 dark:bg-navy-700" : "bg-primary-100 text-primary-600"
                  )}>
                    {msg.role === 'user' ? <span className="text-xs">You</span> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={clsx(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary-600 text-white rounded-tr-sm" 
                      : "bg-white dark:bg-navy-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-navy-700 rounded-tl-sm shadow-sm"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 max-w-[85%] mr-auto"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-primary-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-navy-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputVal.trim() || isLoading}
                  className={clsx(
                    "p-2.5 rounded-xl transition-all duration-200",
                    inputVal.trim() && !isLoading
                      ? "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-glow"
                      : "bg-gray-200 dark:bg-navy-800 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
