import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, BookOpen, Bookmark, BookmarkCheck, Copy, 
  Check, RefreshCw, MessageSquare, Plus, Trash2, Cpu,
  HelpCircle, Code2, Sigma, ListOrdered, Lightbulb, GraduationCap,
  AlertTriangle, ChevronDown, Layers, Bot, Settings
} from 'lucide-react';
import { api } from '../services/api';

const EXPLANATION_MODES = [
  { id: 'detailed', label: 'Detailed Explanation', icon: GraduationCap, desc: 'In-depth academic concepts & theoretical principles' },
  { id: 'assist', label: 'Assist Mode (Socratic)', icon: HelpCircle, desc: 'Guided hints & critical checkpoint questions' },
  { id: 'eli5', label: "Explain Like I'm 5 (ELI5)", icon: Lightbulb, desc: 'Everyday analogies & simple conceptual metaphors' },
  { id: 'step_by_step', label: 'Step-by-Step Derivation', icon: ListOrdered, desc: 'Rigorous calculation & logical step proofs' },
  { id: 'code', label: 'Code & Complexity', icon: Code2, desc: 'Production-ready syntax & Big-O complexity' },
  { id: 'formula', label: 'Formula & Proof', icon: Sigma, desc: 'LaTeX notation & mathematical symbol breakdowns' },
];

const AI_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash (Cloud API)', provider: 'Google DeepMind', badge: 'Cloud Fast' },
  { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro (Cloud API)', provider: 'Google DeepMind', badge: 'Cloud Advanced' },
  { id: 'ollama:qwen', name: 'Ollama Qwen 2.5 (Local Model)', provider: 'Local / On-Device', badge: 'Local Ollama' },
  { id: 'ollama:gemma', name: 'Ollama Gemma 2 (Local Model)', provider: 'Local / On-Device', badge: 'Local Ollama' },
  { id: 'gpt-4o-mini', name: 'OpenAI ChatGPT-4o Mini (Cloud API)', provider: 'OpenAI', badge: 'Cloud GPT' },
];

const QUICK_PROMPTS = [
  { subject: 'BCA-501', title: 'AVL Tree Double Rotations', text: 'Explain Left-Right (LR) and Right-Left (RL) rotations in AVL Trees with a step-by-step example.' },
  { subject: 'BCA-502', title: "Banker's Algorithm", text: "How does Banker's Algorithm prevent system deadlocks? Explain safe state verification." },
  { subject: 'BCA-503', title: '3NF vs BCNF Decomposition', text: 'What is the strict mathematical difference between 3NF and BCNF? When can 3NF preserve dependencies?' },
  { subject: 'BCA-504', title: 'CIDR Subnet Calculation', text: 'Given IP 192.168.10.0/27, calculate the subnet mask, total usable host IPs, and broadcast address.' },
];

export default function DoubtSolver({ user, onRequireAuth }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedMode, setSelectedMode] = useState('detailed');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSubjects();
    loadModels();
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
    } catch (err) {
      console.error(err);
    }
  };

  const loadModels = async () => {
    try {
      const data = await api.getAIModels();
      if (data.default_model) {
        // Keep current or select recommended default
        if (!selectedModel) {
          setSelectedModel(data.default_model);
        }
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
        currentConversation?.id || null,
        selectedModel
      );

      const aiMsg = {
        id: res.message_id || Date.now() + 1,
        sender: 'ai',
        message_text: res.ai_response,
        mode_used: res.mode,
        model_used: res.model_used,
        identified_subject: res.identified_subject,
        identified_topic: res.identified_topic,
        source: res.source,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);

      // If new thread was created, refresh conversation list
      if (!currentConversation) {
        setCurrentConversation({ 
          id: res.conversation_id, 
          title: res.conversation_title,
          subject_code: res.identified_subject?.code,
          subject_name: res.identified_subject?.name
        });
        loadConversations();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'ai',
          is_error: true,
          message_text: err.message || 'AI engine is not communicable: Unable to connect to the reasoning service.',
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
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 font-mono text-xs shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800 border-b border-slate-700 text-slate-400">
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
              return <h3 key={pIdx} className="text-base font-bold text-indigo-700 mt-4 mb-2">{para.replace('### ', '')}</h3>;
            }
            if (para.startsWith('#### ')) {
              return <h4 key={pIdx} className="text-sm font-semibold text-slate-800 mt-3 mb-1">{para.replace('#### ', '')}</h4>;
            }
            if (para.startsWith('> ')) {
              return (
                <blockquote key={pIdx} className="border-l-4 border-indigo-500 pl-3 py-1 my-2 text-xs italic text-indigo-900 bg-indigo-50 rounded-r-lg">
                  {para.replace('> ', '')}
                </blockquote>
              );
            }
            // Parse bold **text**
            const boldFormatted = para.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return <strong key={cIdx} className="font-bold text-slate-900">{chunk.slice(2, -2)}</strong>;
              }
              return chunk;
            });

            return <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-700">{boldFormatted}</p>;
          })}
        </div>
      );
    });
  };

  const activeModelMeta = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8.5rem)]">
      
      {/* Left Sidebar: Conversations & History */}
      <div className="w-full lg:w-72 glass-panel rounded-2xl p-3 flex flex-col shrink-0 border border-slate-200 bg-white shadow-xs">
        <button
          onClick={startNewConversation}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer mb-3"
        >
          <Plus className="h-4 w-4" />
          <span>New Doubt Session</span>
        </button>

        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
          <span>Previous Doubts</span>
          <span className="text-indigo-600 font-bold">{conversations.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p>No doubt history yet.</p>
              <p className="text-[10px] text-slate-400 mt-1">Ask your first question!</p>
            </div>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                onClick={() => loadConversationDetail(c.id)}
                className={`group p-2.5 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between gap-2 border ${
                  currentConversation?.id === c.id 
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium' 
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                    className="p-1 hover:text-amber-500 text-slate-400 cursor-pointer"
                  >
                    {c.is_bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-amber-500" /> : <Bookmark className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    title="Delete thread"
                    className="p-1 hover:text-rose-600 text-slate-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Model Architecture Footer */}
        <div className="pt-3 border-t border-slate-100 mt-2 px-2 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            {selectedModel.includes('gemini') ? (
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            ) : selectedModel.includes('gpt') ? (
              <Bot className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Cpu className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            )}
            <span className="truncate font-semibold text-slate-700">{activeModelMeta.name.split('(')[0]}</span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            LangChain
          </span>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 glass-panel rounded-2xl p-4 flex flex-col border border-slate-200 bg-white shadow-xs overflow-hidden">
        
        {/* Unified Controls: Subject Dropdown, Mode Dropdown & Model Engine Dropdown */}
        <div className="pb-3 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* 1. Enrolled Semester & Curriculum Grounding */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Semester Curriculum
              </label>
              <div 
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 flex items-center justify-between font-semibold"
                title={subjects.map(s => `${s.code}: ${s.name}`).join('\n')}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <GraduationCap className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-900">
                    Semester {user?.semester || 5}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-semibold truncate text-[11px]">
                    Auto-Subject Detection
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  {subjects.length} Subjects
                </span>
              </div>
            </div>

            {/* 2. Mode Selector Dropdown */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Explanation Mode
              </label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-indigo-700 focus:outline-none focus:border-indigo-500 font-bold"
              >
                {EXPLANATION_MODES.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. AI Model Engine Dropdown (LangChain Integrated) */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                AI Model Engine
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Sub-bar: Active Mode description & Bookmark trigger */}
          <div className="flex items-center justify-between pt-2.5 mt-1 text-[11px] text-slate-500">
            <span className="truncate pr-2">
              💡 {EXPLANATION_MODES.find(m => m.id === selectedMode)?.desc}
            </span>

            {currentConversation && (
              <button
                onClick={() => handleToggleBookmark(currentConversation.id)}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  currentConversation.is_bookmarked
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-amber-600'
                }`}
              >
                {currentConversation.is_bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-amber-500" /> : <Bookmark className="h-3.5 w-3.5" />}
                <span>{currentConversation.is_bookmarked ? 'Saved' : 'Save Session'}</span>
              </button>
            )}
          </div>

          {/* Semester Subjects Quick Reference Pills */}
          {subjects.length > 0 && (
            <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-slate-400" /> Enrolled Subjects:
              </span>
              {subjects.map(s => (
                <span 
                  key={s.id} 
                  title={`${s.code} - ${s.name}\n${s.syllabus_overview || ''}`}
                  className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 font-medium cursor-help hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors text-[10px]"
                >
                  {s.code}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="h-16 w-16 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ask Any Academic Doubt
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Powered by LangChain. Seamlessly swap reasoning backends between <strong>Google Gemini API</strong>, <strong>Ollama Qwen 2.5</strong>, <strong>Ollama Gemma 2</strong>, or <strong>OpenAI ChatGPT</strong>.
              </p>

              {/* Recommended Quick Question Chips */}
              <div className="w-full mt-6 text-left">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Suggested Exam Questions (BCA Curriculum):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAskDoubt(null, qp.text)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all group"
                    >
                      <div className="text-[11px] font-semibold text-indigo-700 group-hover:text-indigo-900">
                        {qp.title}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
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
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.is_error 
                      ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                      : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-600/20'
                  }`}>
                    {msg.is_error ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none ml-12'
                      : msg.is_error
                        ? 'bg-rose-50/80 border border-rose-200 text-rose-900 rounded-bl-none mr-8'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none mr-8'
                  }`}
                >
                  {/* AI Message metadata header */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        {msg.is_error ? (
                          <span className="font-bold text-rose-600 flex items-center gap-1">
                            Engine Communication Error
                          </span>
                        ) : (
                          <>
                            <span className="font-semibold text-indigo-600 capitalize">
                              {msg.mode_used || selectedMode} Mode
                            </span>
                            {msg.identified_subject && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 font-bold border border-indigo-200 flex items-center gap-1">
                                <BookOpen className="h-3 w-3 text-indigo-600" />
                                {msg.identified_subject.code} • {msg.identified_subject.name}
                              </span>
                            )}
                            {msg.model_used && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium">
                                {msg.model_used}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {!msg.is_error && (
                        <button
                          onClick={() => handleCopy(msg.message_text, `msg-${msg.id}`)}
                          className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                          title="Copy answer"
                        >
                          {copiedId === `msg-${msg.id}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          <span className="text-[10px]">{copiedId === `msg-${msg.id}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.message_text}</p>
                  ) : msg.is_error ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-rose-900 leading-relaxed">{msg.message_text}</p>
                      <p className="text-[11px] text-rose-600">The AI reasoning service did not return an academic response.</p>
                    </div>
                  ) : (
                    <div>{renderFormattedText(msg.message_text)}</div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 text-xs font-bold">
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
              <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-none text-xs text-indigo-700 flex items-center gap-2 border border-indigo-200 bg-white shadow-xs">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span>Invoking {activeModelMeta.name} via LangChain engine...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAskDoubt} className="pt-3 border-t border-slate-200">
          <div className="relative flex items-center">
            <textarea
              rows={2}
              placeholder={`Ask your doubt in ${EXPLANATION_MODES.find(m => m.id === selectedMode)?.label} using ${activeModelMeta.name.split('(')[0]}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskDoubt(e);
                }
              }}
              className="w-full pl-4 pr-24 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
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
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">Enter ↵</kbd> to submit</span>
            <div className="flex items-center gap-2">
              <span>Mode: <strong className="text-indigo-600">{EXPLANATION_MODES.find(m => m.id === selectedMode)?.label}</strong></span>
              <span>•</span>
              <span>Model: <strong className="text-purple-600">{activeModelMeta.name.split('(')[0]}</strong></span>
            </div>
          </div>
        </form>

      </div>

    </div>
  );
}
