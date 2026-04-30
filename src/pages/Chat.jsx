import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserState } from '../contexts/UserStateContext';
import { CHAT_SUGGESTIONS } from '../constants/copy';
import { 
  Send, Mic, MicOff, Copy, Bookmark, Volume2, 
  ThumbsUp, ThumbsDown, Plus, Trash2, Clock, 
  ChevronLeft, ChevronRight, MessageSquare 
} from 'lucide-react';

const ChatPage = () => {
  const location = useLocation();
  const { saveAnswer } = useUserState();
  
  // States
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('eg_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState(Date.now().toString());
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  // Handle Initial Message from Routing
  useEffect(() => {
    if (location.state?.initialMessage) {
      handleSendMessage(location.state.initialMessage);
    }
  }, [location.state]);

  // Sync History to localStorage
  useEffect(() => {
    localStorage.setItem('eg_chat_history', JSON.stringify(history));
  }, [history]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isWaiting]);

  const handleSendMessage = async (text) => {
    const msgText = text || inputText.trim();
    if (!msgText || isWaiting) return;

    const userMsg = { id: Date.now(), role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsWaiting(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, sessionId: activeSessionId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Sorry, I encountered an error.");
      }
      
      const botMsg = { id: Date.now() + 1, role: 'bot', text: data.response };
      setMessages(prev => [...prev, botMsg]);
      
      // Update History
      updateHistory(msgText, [...messages, userMsg, botMsg]);

    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: err.message || "Sorry, I encountered an error." }]);
    } finally {
      setIsWaiting(false);
    }
  };

  const updateHistory = (firstMsg, allMsgs) => {
    setHistory(prev => {
      const existing = prev.find(h => h.sessionId === activeSessionId);
      if (existing) {
        return prev.map(h => h.sessionId === activeSessionId ? { ...h, messages: allMsgs, date: new Date().toISOString() } : h);
      } else {
        const title = firstMsg.length > 40 ? firstMsg.substring(0, 37) + '...' : firstMsg;
        return [{ sessionId: activeSessionId, title, messages: allMsgs, date: new Date().toISOString() }, ...prev].slice(0, 20);
      }
    });
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveSessionId(Date.now().toString());
    setShowHistory(false);
  };

  const restoreSession = (session) => {
    setMessages(session.messages);
    setActiveSessionId(session.sessionId);
    setShowHistory(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#060a14]">
      
      {/* Sidebar - Desktop History */}
      <aside className={`absolute inset-y-0 left-0 w-80 bg-slate-900 border-r border-white/5 z-40 transition-transform md:relative md:translate-x-0 ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <button onClick={startNewChat} className="flex items-center justify-center gap-2 w-full py-4 bg-orange-600 text-white rounded-2xl font-bold mb-8 hover:bg-orange-700 transition-all">
            <Plus size={20} /> New Conversation
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Recent History</h3>
            {history.map((session) => (
              <button 
                key={session.sessionId}
                onClick={() => restoreSession(session)}
                className={`w-full p-4 rounded-xl text-left transition-all border ${activeSessionId === session.sessionId ? 'bg-orange-500/10 border-orange-500/50 text-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
              >
                <div className="text-sm font-bold truncate mb-1">{session.title}</div>
                <div className="text-[10px] font-mono opacity-50">{new Date(session.date).toLocaleDateString()}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header (Mobile) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/50 border-b border-white/5">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 text-slate-400">
            <Clock size={20} />
          </button>
          <div className="font-bold text-sm">Chat Assistant</div>
          <button onClick={startNewChat} className="p-2 text-orange-500">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-12 space-y-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600/20 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare size={32} />
                </div>
                <h1 className="text-4xl font-black text-white mb-4">How can I help?</h1>
                <p className="text-slate-400">Ask anything about voter registration, election dates, or the democratic process.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHAT_SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSendMessage(s)}
                    className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-sm text-slate-300 font-medium hover:border-orange-500 transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} onSave={() => saveAnswer(messages.find(m => m.id === msg.id - 1)?.text, msg.text)} />
              ))}
              {isWaiting && <LoadingMessage />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-[#060a14] via-[#060a14] to-transparent">
          <div className="max-w-3xl mx-auto flex items-end gap-3 relative">
            <div className="flex-1 relative group">
               <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isRecording ? "Listening..." : "Ask your civic question..."}
                className={`w-full bg-slate-900 border ${isRecording ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-orange-500 transition-all resize-none min-h-[56px] max-h-32 text-sm text-white`}
                rows={1}
              />
              <button 
                onClick={toggleRecording}
                className={`absolute right-4 bottom-4 transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-white'}`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={isWaiting || !inputText.trim()}
              className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple markdown formatter to guarantee text visibility without external plugins
const formatMarkdown = (text) => {
  if (!text) return null;
  
  // Split by double line breaks for paragraphs
  return text.split('\n\n').map((paragraph, pIdx) => {
    // Handle bullet points within a paragraph
    const lines = paragraph.split('\n');
    return (
      <p key={pIdx} className="mb-4 last:mb-0">
        {lines.map((line, lIdx) => {
          // Parse **bold** text
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          });

          return (
            <span key={lIdx} className="block mb-1">
              {formattedLine}
            </span>
          );
        })}
      </p>
    );
  });
};

const ChatMessage = ({ msg, onSave }) => {
  const isBot = msg.role === 'bot';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
  };

  const handleRead = () => {
    const utterance = new SpeechSynthesisUtterance(msg.text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-4 group ${!isBot ? 'flex-row-reverse' : ''}`}>
      <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${isBot ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
        {isBot ? '🗳️' : '👤'}
      </div>
      <div className={`max-w-[85%] space-y-2 ${!isBot ? 'items-end' : ''}`}>
        <div className={`p-5 rounded-3xl text-sm leading-relaxed ${isBot ? 'bg-white/5 border border-white/5 text-slate-200' : 'bg-orange-600 text-white font-medium'}`}>
          {isBot ? formatMarkdown(msg.text) : msg.text}
        </div>
        
        {isBot && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <MessageAction icon={Copy} onClick={handleCopy} />
            <MessageAction icon={Bookmark} onClick={onSave} />
            <MessageAction icon={Volume2} onClick={handleRead} />
            <div className="flex border border-white/5 rounded-lg overflow-hidden ml-2">
              <MessageAction icon={ThumbsUp} />
              <MessageAction icon={ThumbsDown} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MessageAction = ({ icon: Icon, onClick }) => (
  <button onClick={onClick} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
    <Icon size={14} />
  </button>
);

const LoadingMessage = () => (
  <div className="flex gap-4">
    <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white">🗳️</div>
    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex gap-1.5 items-center">
      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"></span>
      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </div>
  </div>
);

export default ChatPage;
