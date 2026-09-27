import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, BookOpen, Bookmark, BookmarkCheck, Copy, 
  Check, RefreshCw, MessageSquare, Plus, Trash2, Cpu,
  HelpCircle, Code2, Sigma, ListOrdered, Lightbulb, GraduationCap
} from 'lucide-react';
import { api } from '../services/api';

const EXPLANATION_MODES = [
  { id: 'detailed', label: 'Detailed Explanation', icon: GraduationCap, color: 'text-indigo-400', desc: 'In-depth academic concepts & theory' },
  { id: 'assist', label: 'Assist Mode', icon: HelpCircle, color: 'text-amber-400', desc: 'Guided hints & Socratic problem solving' },
  { id: 'eli5', label: "Explain Like I'm 5", icon: Lightbulb, color: 'text-emerald-400', desc: 'Simple analogies & everyday examples' },
  { id: 'step_by_step', label: 'Step-by-Step', icon: ListOrdered, color: 'text-blue-400', desc: 'Rigorous calculation & derivation' },
  { id: 'code', label: 'Code Explanation', icon: Code2, color: 'text-cyan-400', desc: 'Syntax, complexity & edge cases' },
  { id: 'formula', label: 'Formula & Proof', icon: Sigma, color: 'text-purple-400', desc: 'Mathematical equations & notation' },
];

const QUICK_PROMPTS = [
  { subject: 'BCA-501', title: 'AVL Tree Double Rotations', text: 'Explain Left-Right (LR) and Right-Left (RL) rotations in AVL Trees with a step-by-step example.' },
  { subject: 'BCA-502', title: "Banker's Algorithm", text: "How does Banker's Algorithm prevent system deadlocks? Explain safe state verification." },
  { subject: 'BCA-503', title: '3NF vs BCNF Decomposition', text: 'What is the strict mathematical difference between 3NF and BCNF? When can 3NF preserve dependencies?' },
  { subject: 'BCA-504', title: 'CIDR Subnet Calculation', text: 'Given IP 192.168.10.0/27, calculate the subnet mask, total usable host IPs, and broadcast address.' },
];

export default function DoubtSolver({ user, onRequireAuth }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedMode, setSelectedMode] = useState('detailed');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSubjects();
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !currentConversation) {
        loadConversationDetail(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversationDetail = async (id) => {
    try {
      const data = await api.getConversationDetail(id);
      setCurrentConversation(data);
      setMessages(data.messages || []);
      if (data.subject) {
        setSelectedSubject(data.subject);
      }
      if (data.mode) {
        setSelectedMode(data.mode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setQuery('');
  };

  const handleAskDoubt = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || query;
    if (!textToSend.trim()) return;

    if (!user) {
      onRequireAuth();
      return;
    }

    const optimisticUserMsg = {
      id: Date.now(),
      sender: 'user',
      message_text: textToSend,
      mode_used: selectedMode,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticUserMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askDoubt(
        textToSend,
        selectedMode,
        selectedSubject || null,
        currentConversation?.id || null,
        'qwen2.5:latest'
      );

      const aiMsg = {
        id: res.message_id || Date.now() + 1,
        sender: 'ai',
        message_text: res.ai_response,
        mode_used: res.mode,
        model_used: res.model_used,
        source: res.source,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);

      // If new thread was created, refresh conversation list
      if (!currentConversation) {
        setCurrentConversation({ id: res.conversation_id, title: res.conversation_title });
        loadConversations();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'ai',
          message_text: `⚠️ Error generating explanation: ${err.message}. Please check if the backend is running.`,
          mode_used: selectedMode,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.toggleBookmark(convId);
      setConversations(conversations.map(c => c.id === convId ? { ...c, is_bookmarked: res.is_bookmarked } : c));
      if (currentConversation?.id === convId) {
        setCurrentConversation(prev => ({ ...prev, is_bookmarked: res.is_bookmarked }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation thread?")) return;
    try {
      await api.deleteConversation(convId);
      setConversations(conversations.filter(c => c.id !== convId));
      if (currentConversation?.id === convId) {
        startNewConversation();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simple Markdown renderer helper for clean display
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Check for code blocks ```lang ... ```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n') || lines[0];

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900/90 font-mono text-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-700 text-slate-400">
              <span className="text-[11px] font-semibold uppercase">{language || 'code'}</span>
              <button
                onClick={() => handleCopy(code, `code-${index}`)}
                className="hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedId === `code-${index}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === `code-${index}` ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-emerald-300 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format headings and regular text
      return (
        <div key={index} className="space-y-2">
          {part.split('\n\n').map((para, pIdx) => {
            if (para.startsWith('### ')) {
              return <h3 key={pIdx} className="text-base font-bold text-indigo-300 mt-4 mb-2">{para.replace('### ', '')}</h3>;
            }
            if (para.startsWith('#### ')) {
              return <h4 key={pIdx} className="text-sm font-semibold text-slate-200 mt-3 mb-1">{para.replace('#### ', '')}</h4>;
            }
            if (para.startsWith('> ')) {
              return (
                <blockquote key={pIdx} className="border-l-4 border-indigo-500 pl-3 py-1 my-2 text-xs italic text-indigo-200/90 bg-indigo-950/20 rounded-r-lg">
                  {para.replace('> ', '')}
                </blockquote>
              );
            }
            // Parse bold **text**
            const boldFormatted = para.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return <strong key={cIdx} className="font-bold text-white">{chunk.slice(2, -2)}</strong>;
              }
              return chunk;
            });

            return <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-300">{boldFormatted}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8.5rem)]">
      
      {/* Left Sidebar: Conversations & History */}
      <div className="w-full lg:w-72 glass-panel rounded-2xl p-3 flex flex-col shrink-0 border border-slate-800">
        <button
          onClick={startNewConversation}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer mb-3"
        >
          <Plus className="h-4 w-4" />
          <span>New Doubt Session</span>
        </button>

        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
          <span>Previous Doubts</span>
          <span className="text-indigo-400 font-bold">{conversations.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <p>No doubt history yet.</p>
              <p className="text-[10px] text-slate-600 mt-1">Ask your first question!</p>
            </div>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                onClick={() => loadConversationDetail(c.id)}
                className={`group p-2.5 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between gap-2 border ${
                  currentConversation?.id === c.id 
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200' 
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <div className="truncate flex-1">
                  <div className="font-semibold truncate">{c.title}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{c.subject_code || 'General'}</span>
                    <span>•</span>
                    <span className="capitalize">{c.mode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleBookmark(c.id); }}
                    title="Bookmark conversation"
                    className="p-1 hover:text-amber-400 text-slate-400"
                  >
                    {c.is_bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" /> : <Bookmark className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    title="Delete thread"
                    className="p-1 hover:text-rose-400 text-slate-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Local AI Model Specs Footer */}
        <div className="pt-3 border-t border-slate-800/80 mt-2 px-2 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Qwen2.5 / Llama 3.2</span>
          </div>
          <span className="text-emerald-400 font-semibold">On-Device Privacy</span>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 glass-panel rounded-2xl p-4 flex flex-col border border-slate-800 overflow-hidden">
        
        {/* Controls: Mode Selector & Subject Selector */}
        <div className="pb-3 border-b border-slate-800 space-y-3">
          
          {/* Top row: Subject & Bookmark */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            {currentConversation && (
              <button
                onClick={() => handleToggleBookmark(currentConversation.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentConversation.is_bookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                }`}
              >
                {currentConversation.is_bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                <span>{currentConversation.is_bookmarked ? 'Saved for Revision' : 'Bookmark Doubt'}</span>
              </button>
            )}
          </div>

          {/* Explanation Modes Row (6 Modes as per spec) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {EXPLANATION_MODES.map(m => {
              const Icon = m.icon;
              const isSelected = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  title={m.desc}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : m.color}`} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Ask Any Academic Doubt
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Powered by local Ollama AI models. Choose between 6 specialized explanation modes: from ELI5 analogies to step-by-step mathematical proofs and code walkthroughs.
              </p>

              {/* Recommended Quick Question Chips */}
              <div className="w-full mt-6 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Suggested Exam Questions (SRMCM BCA):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAskDoubt(null, qp.text)}
                      className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all group"
                    >
                      <div className="text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300">
                        {qp.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {qp.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-md shadow-indigo-600/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none ml-12'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none mr-8'
                  }`}
                >
                  {/* AI Message metadata header */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-400 capitalize">
                          {msg.mode_used || selectedMode} Mode
                        </span>
                        {msg.model_used && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {msg.model_used}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(msg.message_text, `msg-${msg.id}`)}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                        title="Copy answer"
                      >
                        {copiedId === `msg-${msg.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span className="text-[10px]">{copiedId === `msg-${msg.id}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.message_text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.message_text)}</div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-none text-xs text-indigo-300 flex items-center gap-2 border border-indigo-500/20">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Generating academic solution via local model...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAskDoubt} className="pt-3 border-t border-slate-800">
          <div className="relative flex items-center">
            <textarea
              rows={2}
              placeholder={`Ask your doubt in ${EXPLANATION_MODES.find(m => m.id === selectedMode)?.label}... (e.g. "How does Dijkstra's algorithm find the shortest path?")`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskDoubt(e);
                }
              }}
              className="w-full pl-4 pr-24 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-900 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Ask AI</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Enter ↵</kbd> to submit</span>
            <span>Mode: <strong className="text-indigo-400">{EXPLANATION_MODES.find(m => m.id === selectedMode)?.label}</strong></span>
          </div>
        </form>

      </div>

    </div>
  );
}
