import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Info,
  HelpCircle
} from 'lucide-react';
import advisorAvatar from '../../assets/advisor_avatar.png';

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/candidate/chat/history');
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Could not retrieve chat log. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);
    setError('');

    // Append client-side immediately for immediate UI response
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'CANDIDATE',
      message: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await axios.post('http://localhost:5000/api/candidate/chat', {
        message: userMessage,
      });
      // Append AI response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id), // Remove temp msg
        { id: `user-${Date.now()}`, sender: 'CANDIDATE', message: userMessage, createdAt: tempUserMsg.createdAt },
        res.data.aiMessage,
      ]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuery = (text) => {
    setInput(text);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-slide-up stagger-1">
      
      {/* Title Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md"></div>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <img src={advisorAvatar} alt="Smart Hire advisor avatar" className="h-10 w-10 object-contain rounded-lg" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Your Career Guide</h1>
          <p className="text-slate-400 text-sm mt-1">Chat with a friendly career mentor who knows your resume, test scores, and is here to help you succeed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Info size={16} className="text-emerald-400" />
              Your Synced Profile
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To give you the most relevant suggestions, your guide is fully updated on:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed font-medium">
              <li>Extracted resume skills & experiences</li>
              <li>Verification milestones & test results</li>
              <li>Pending interview coordinates & schedules</li>
            </ul>
          </div>

          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <HelpCircle size={16} className="text-indigo-400" />
              Suggested Questions
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleQuickQuery('What are my extracted resume skills?')}
                className="w-full text-left p-3 rounded-lg bg-slate-900/50 hover:bg-emerald-500/10 hover:text-emerald-400 border border-white/5 text-[11px] text-slate-300 font-medium transition-all"
              >
                "Review my resume details"
              </button>
              <button 
                onClick={() => handleQuickQuery('How many applications do I currently have?')}
                className="w-full text-left p-3 rounded-lg bg-slate-900/50 hover:bg-indigo-500/10 hover:text-indigo-400 border border-white/5 text-[11px] text-slate-300 font-medium transition-all"
              >
                "Check my application status"
              </button>
            </div>
          </div>
        </div>

        {/* Chat Conversational Column */}
        <div className="lg:col-span-3">
          <div className="glass-card flex flex-col h-[600px] border border-white/5 bg-slate-900/20 backdrop-blur-xl relative overflow-hidden">
            
            {/* Header Status */}
            <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Smart Hire Advisor</h4>
                  <span className="text-[10px] text-emerald-400 block font-medium">Ready to support you</span>
                </div>
              </div>

              <span className="badge badge-success text-[9px] flex items-center gap-1.5 px-3 py-1">
                <Sparkles size={11} className="animate-pulse" />
                Active Sync
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-3"></div>
                  <p className="text-slate-400 text-xs font-medium">Setting up chat space...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <MessageSquare size={24} className="text-emerald-400 animate-pulse" />
                  </div>
                  <h5 className="font-bold text-white text-sm mb-1">Start a Conversation</h5>
                  <p className="text-xs max-w-xs mx-auto leading-relaxed">
                    Say hello to discuss your skills, ask for test preparation guides, or find matching jobs.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'CANDIDATE';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] chat-bubble-anim ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 shadow-md ${
                        isUser 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-900 border border-white/5 overflow-hidden'
                      }`}>
                        {isUser ? (
                          <User size={14} />
                        ) : (
                          <img src={advisorAvatar} alt="Advisor avatar" className="h-full w-full object-cover" />
                        )}
                      </div>

                      <div className={`rounded-2xl p-4 text-xs leading-relaxed font-medium ${
                        isUser 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 rounded-tr-none' 
                          : 'bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.message}
                        <span className={`text-[8px] mt-2 block text-right font-normal ${
                          isUser ? 'text-emerald-100' : 'text-slate-500'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {sending && (
                <div className="flex gap-3 max-w-[80%] mr-auto chat-bubble-anim">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-white/5 overflow-hidden shrink-0 shadow-md">
                    <img src={advisorAvatar} alt="Advisor avatar" className="h-full w-full object-cover" />
                  </div>
                  <div className="rounded-2xl p-4 py-3 bg-slate-900/80 border border-white/5 flex items-center gap-1 text-slate-400 rounded-tl-none">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-[10px] text-red-400 w-max mx-auto text-center font-medium">
                  {error}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSend} className="mt-auto border-t border-white/5 pt-4 flex gap-3">
              <input
                type="text"
                required
                disabled={loading}
                className="form-input flex-grow text-xs pl-4"
                placeholder={loading ? 'Context restoring...' : 'Ask about your skill matching, test tips, or check status...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || sending}
                className="btn btn-primary shrink-0 py-2.5 px-5"
              >
                <Send size={14} />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
