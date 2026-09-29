import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, BookOpen, Pin, PinOff, Copy, 
  Check, RefreshCw, MessageSquare, Plus, Trash2, Cpu,
  HelpCircle, Lightbulb, GraduationCap,
  AlertTriangle, ChevronDown, Layers, Bot, Settings,
  FileText, FileDown, ArrowRight, Download, CheckCircle2, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, getStoredAIModel, AI_MODELS } from '../services/api';
import { generateNotesPDF } from '../utils/pdfGenerator';

const EXPLANATION_MODES = [
  { id: 'detailed', label: 'Detailed Explanation', icon: GraduationCap, desc: 'In-depth academic concepts & theoretical principles' },
  { id: 'eli5', label: "Explain Like I'm 5 (ELI5)", icon: Lightbulb, desc: 'Everyday analogies & simple conceptual metaphors' },
  { id: 'assist', label: 'Assist Mode (Guided Research)', icon: HelpCircle, desc: 'Directs what to study & hints without spoiling direct answers' },
];

const QUICK_PROMPTS = [
  { title: 'Sliding Window Protocols', text: 'Explain the working of Go-Back-N and Selective Repeat sliding window protocols in Computer Networks with an error recovery example.' },
  { title: 'Hypothesis Testing & p-value', text: 'In Data Analytics, explain the difference between Null and Alternate hypothesis, Type I and Type II errors, and level of significance (p-value).' },
  { title: 'A* vs Hill Climbing Search', text: 'In Artificial Intelligence, compare Informed Search strategies: explain Hill Climbing vs A* Heuristic Search and how to resolve local maxima.' },
  { title: 'IT Act 2000 Key Provisions', text: 'What are the core objectives and major offences under the Indian Information Technology (IT) Act 2000 regarding hacking and data privacy?' },
];

export default function DoubtSolver({ 
  user, 
  onRequireAuth, 
  initialQuery, 
  onClearInitialQuery, 
  onNavigateToPersonalLibrary,
  targetConversationId,
  onClearTargetConversationId
}) {
  const [subjects, setSubjects] = useState([]);
  const [selectedMode, setSelectedMode] = useState('detailed');
  const [selectedModel, setSelectedModel] = useState(() => getStoredAIModel());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Create Notes State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubjectCode, setNoteSubjectCode] = useState('');
  const [noteSubjectName, setNoteSubjectName] = useState('');
  const [noteTopic, setNoteTopic] = useState('');
  const [noteSummary, setNoteSummary] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [noteSuccessData, setNoteSuccessData] = useState(null);
  const [noteError, setNoteError] = useState('');

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);

  useEffect(() => {
    if (targetConversationId) {
      loadConversationDetail(targetConversationId);
      if (onClearTargetConversationId) {
        onClearTargetConversationId();
      }
    }
  }, [targetConversationId]);

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

  useEffect(() => {
    const handleModelSync = (e) => {
      if (e.detail) {
        setSelectedModel(e.detail);
      }
    };
    window.addEventListener('ai-model-change', handleModelSync);
    return () => window.removeEventListener('ai-model-change', handleModelSync);
  }, []);

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
        const validMode = ['detailed', 'eli5', 'assist'].includes(data.mode) ? data.mode : 'detailed';
        setSelectedMode(validMode);
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

  const handleTogglePin = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.toggleBookmark(convId);
      setConversations(conversations.map(c => c.id === convId ? { ...c, is_bookmarked: res.is_bookmarked } : c));
      if (currentConversation?.id === convId) {
        setCurrentConversation(prev => ({ ...prev, is_bookmarked: res.is_bookmarked }));
      }
      window.dispatchEvent(new CustomEvent('pinned-chats-update'));
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
      window.dispatchEvent(new CustomEvent('pinned-chats-update'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateNotes = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (messages.length === 0) {
      alert("No doubt messages found in this chat. Ask an academic question or select an existing conversation to create study notes and PDF!");
      return;
    }

    const firstUserMsg = messages.find(m => m.sender === 'user')?.message_text || '';
    const firstAiMsg = messages.find(m => m.sender === 'ai' && !m.is_error);

    const detectedSubject = 
      currentConversation?.subject_code 
      || firstAiMsg?.identified_subject?.code 
      || (subjects[0]?.code || 'CS502');

    const matchedSubjectObj = subjects.find(s => s.code === detectedSubject);
    const detectedSubjectName = matchedSubjectObj?.name || (detectedSubject === 'CS502' ? 'Computer Networks' : 'Academic Subject');

    const defaultTitle = currentConversation?.title && currentConversation.title !== 'New Doubt Session'
      ? `${currentConversation.title} — Revision Notes`
      : firstUserMsg.length > 0 
        ? `${firstUserMsg.slice(0, 36).trim()}... — Study Notes`
        : 'AI Doubt Session Revision Notes';

    const defaultTopic = currentConversation?.title || firstAiMsg?.identified_topic || 'Academic Doubt Revision';

    const questionsCount = messages.filter(m => m.sender === 'user').length;
    const keyTakeawayPreview = `Revision guide compiling ${questionsCount} student doubt(s) regarding ${defaultTopic}. Includes verified AI explanations, key principles, step-by-step logic, code, and formula derivations.`;

    setNoteTitle(defaultTitle);
    setNoteSubjectCode(detectedSubject);
    setNoteSubjectName(detectedSubjectName);
    setNoteTopic(defaultTopic);
    setNoteSummary(keyTakeawayPreview);
    setNoteSuccessData(null);
    setNoteError('');
    setIsNoteModalOpen(true);
  };

  const handleGenerateAndSaveNotes = async () => {
    if (!noteTitle.trim()) {
      setNoteError('Please provide a title for your study notes.');
      return;
    }

    setIsGeneratingNotes(true);
    setNoteError('');

    try {
      // 1. Generate formatted PDF with jsPDF
      const { blob, filename, download } = generateNotesPDF({
        title: noteTitle.trim(),
        subjectCode: noteSubjectCode,
        subjectName: noteSubjectName,
        studentName: user?.name || user?.email || 'Student',
        messages,
        summary: noteSummary,
      });

      // 2. Prepare structured text transcript
      const fullContent = messages.map(m => {
        const prefix = m.sender === 'user' ? '### Student Question:\n' : `### AI Solution (${m.mode_used || 'Standard'} Mode):\n`;
        return `${prefix}${m.message_text}\n`;
      }).join('\n---\n\n');

      // 3. Upload PDF to backend file storage
      let uploadedPdfUrl = '';
      try {
        const fileObj = new File([blob], filename, { type: 'application/pdf' });
        const uploadRes = await api.uploadFile(fileObj, 'resource');
        uploadedPdfUrl = uploadRes.file_url;
      } catch (uploadErr) {
        console.warn('Backend file upload fallback:', uploadErr);
        uploadedPdfUrl = URL.createObjectURL(blob);
      }

      // 4. Save note record to backend
      const notePayload = {
        title: noteTitle.trim(),
        subject_code: noteSubjectCode,
        subject_name: noteSubjectName,
        topic: noteTopic.trim() || noteTitle.trim(),
        summary: noteSummary.trim(),
        content: fullContent,
        pdf_url: uploadedPdfUrl,
        conversation: currentConversation?.id || null,
      };

      const savedNote = await api.createPersonalNote(notePayload);

      // 5. Also cache note in localStorage
      try {
        const cacheKey = user?.id ? `personal_notes_cache_${user.id}` : 'personal_notes_cache';
        const localCached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        const updatedCache = [
          {
            ...savedNote,
            downloadFilename: filename
          },
          ...localCached.filter(n => n.id !== savedNote.id)
        ];
        localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      } catch (cacheErr) {
        console.warn('Local storage cache warning:', cacheErr);
      }

      // 6. Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      setNoteSuccessData({
        ...savedNote,
        download,
        filename,
      });
    } catch (err) {
      console.error('Note generation error:', err);
      setNoteError(err.message || 'Failed to generate study notes and PDF. Please try again.');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Inline Markdown renderer helper (bold, code, etc.)
  const renderInlineMarkdown = (text) => {
    if (!text) return null;
    const codeParts = text.split(/(`[^`]+`)/g);
    return codeParts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-200/90 dark:bg-slate-800 text-indigo-950 dark:text-indigo-300 font-mono text-[11px] font-semibold border border-slate-300 dark:border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length >= 4) {
          return <strong key={`${i}-${j}`} className="font-bold text-slate-950 dark:text-white">{bPart.slice(2, -2)}</strong>;
        }
        return bPart;
      });
    });
  };

  // Content block renderer (handles code blocks, lists, quotes, paragraphs)
  const renderContentBlocks = (content, cardType = null) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n') || lines[0];

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs shadow-md">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-300">
              <span className="text-[11px] font-semibold uppercase tracking-wider">{language || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopy(code, `code-${index}-${Math.random()}`)}
                className="hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedId?.startsWith('code-') ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-emerald-400 leading-relaxed text-xs">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const paras = part.split(/\n\n+/);
      return (
        <div key={index} className="space-y-2.5">
          {paras.map((para, pIdx) => {
            const trimmed = para.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('#### ')) {
              return (
                <h4 key={pIdx} className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 mt-3 mb-1">
                  {renderInlineMarkdown(trimmed.replace('#### ', ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-sm sm:text-base font-bold text-indigo-950 dark:text-indigo-300 mt-3.5 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
                  {renderInlineMarkdown(trimmed.replace('### ', ''))}
                </h3>
              );
            }
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote key={pIdx} className="border-l-4 border-indigo-600 pl-3.5 py-2 my-2 text-xs italic text-indigo-950 dark:text-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-r-lg font-medium border-y border-r border-indigo-200/80 dark:border-indigo-900/40">
                  {renderInlineMarkdown(trimmed.replace('> ', ''))}
                </blockquote>
              );
            }

            const lines = trimmed.split('\n');
            if (lines.length > 1 && lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()))) {
              return (
                <ul key={pIdx} className="space-y-1.5 my-1.5 pl-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-normal">
                  {lines.map((l, lIdx) => {
                    const lTrim = l.trim();
                    if (lTrim.startsWith('- ') || lTrim.startsWith('* ')) {
                      return (
                        <li key={lIdx} className="flex items-start gap-2">
                          <span className="text-indigo-700 dark:text-indigo-400 shrink-0 font-bold">•</span>
                          <span>{renderInlineMarkdown(lTrim.substring(2))}</span>
                        </li>
                      );
                    } else if (/^\d+\.\s/.test(lTrim)) {
                      const numMatch = lTrim.match(/^(\d+\.)\s*(.*)$/);
                      return (
                        <li key={lIdx} className="flex items-start gap-2">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 shrink-0">{numMatch ? numMatch[1] : '•'}</span>
                          <span>{renderInlineMarkdown(numMatch ? numMatch[2] : lTrim)}</span>
                        </li>
                      );
                    }
                    return <p key={lIdx}>{renderInlineMarkdown(lTrim)}</p>;
                  })}
                </ul>
              );
            }

            return (
              <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 font-normal">
                {renderInlineMarkdown(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Structured Markdown renderer with dedicated high-contrast Assist Mode Socratic cards
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Detect if this message has Assist Mode Socratic sections
    const hasAssistSections = 
      (text.includes('Understanding Validation') || text.includes('🎯')) &&
      (text.includes('What to Study') || text.includes('📚')) &&
      (text.includes('Guiding Clue') || text.includes('💡'));

    if (!hasAssistSections) {
      return renderContentBlocks(text);
    }

    // Split text into Socratic sections by ### headers
    const rawSections = text.split(/(?=###\s+)/g);

    const getSectionConfig = (headerLine) => {
      const h = headerLine.toLowerCase();
      if (h.includes('understanding validation') || h.includes('🎯')) {
        return {
          type: 'validation',
          badge: '🎯 Understanding Validation',
          cardClass: 'bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 shadow-xs',
          titleBadgeClass: 'text-amber-950 dark:text-amber-200 font-bold bg-amber-100 dark:bg-amber-900/50 border border-amber-300/90 dark:border-amber-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5',
        };
      }
      if (h.includes('what to study') || h.includes('study & research') || h.includes('📚')) {
        return {
          type: 'study',
          badge: '📚 What to Study & Research',
          cardClass: 'bg-indigo-50/90 dark:bg-indigo-950/30 border border-indigo-300 dark:border-indigo-700/60 shadow-xs',
          titleBadgeClass: 'text-indigo-950 dark:text-indigo-200 font-bold bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300/90 dark:border-indigo-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5',
        };
      }
      if (h.includes('guiding clue') || h.includes('💡')) {
        return {
          type: 'clue',
          badge: '💡 Guiding Clue',
          cardClass: 'bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 shadow-xs',
          titleBadgeClass: 'text-emerald-950 dark:text-emerald-200 font-bold bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300/90 dark:border-emerald-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5',
        };
      }
      if (h.includes('checkpoint challenge') || h.includes('🔍')) {
        return {
          type: 'challenge',
          badge: '🔍 Checkpoint Challenge',
          cardClass: 'bg-purple-50/90 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-700/60 shadow-xs',
          titleBadgeClass: 'text-purple-950 dark:text-purple-200 font-bold bg-purple-100 dark:bg-purple-900/50 border border-purple-300/90 dark:border-purple-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5',
        };
      }
      return null;
    };

    return (
      <div className="space-y-3.5">
        {rawSections.map((sec, sIdx) => {
          const trimmed = sec.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('### ')) {
            const firstLineEnd = trimmed.indexOf('\n');
            const headerLine = firstLineEnd !== -1 ? trimmed.slice(0, firstLineEnd).trim() : trimmed;
            const bodyContent = firstLineEnd !== -1 ? trimmed.slice(firstLineEnd).trim() : '';

            const config = getSectionConfig(headerLine);
            if (config) {
              return (
                <div 
                  key={sIdx} 
                  className={`p-3.5 sm:p-4 rounded-xl shadow-xs transition-all ${config.cardClass}`}
                >
                  <div className="mb-2.5">
                    <span className={`text-xs sm:text-sm shadow-2xs ${config.titleBadgeClass}`}>
                      {config.badge}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100">
                    {renderContentBlocks(bodyContent, config.type)}
                  </div>
                </div>
              );
            }
          }

          return (
            <div key={sIdx}>
              {renderContentBlocks(trimmed)}
            </div>
          );
        })}
      </div>
    );
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
                    <span className={`font-mono px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      (c.subject_code && c.subject_code !== 'General')
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {c.subject_code || 'General'}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{c.mode}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 transition-opacity ${c.is_bookmarked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(c.id); }}
                    title={c.is_bookmarked ? "Unpin chat from sidebar" : "Pin chat to sidebar"}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      c.is_bookmarked ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    <Pin className={`h-3.5 w-3.5 ${c.is_bookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
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
        {/* Saved Doubts Footer */}
        <div className="pt-2.5 border-t border-slate-100 mt-2 px-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{conversations.length} Saved Doubt{conversations.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 glass-panel rounded-2xl p-4 flex flex-col border border-slate-200 bg-white shadow-xs overflow-hidden">
        
        {/* Controls: Mode Selector & Create Notes */}
        <div className="pb-3 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-56">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Explanation Mode
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-indigo-700 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {EXPLANATION_MODES.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* CREATE NOTES BUTTON */}
              <div className="pt-0 sm:pt-4">
                <button
                  type="button"
                  onClick={handleOpenCreateNotes}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    messages.length > 0
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                  }`}
                  title="Generate study notes and revision PDF from this conversation for your Personal Library"
                >
                  <FileDown className="h-3.5 w-3.5 text-emerald-200" />
                  <span>Create Notes</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/20 text-white font-mono font-bold tracking-wider">
                    PDF
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between sm:justify-end gap-3 text-[11px] text-slate-500 pt-1 sm:pt-4">
              <span className="truncate hidden xl:inline">
                💡 {EXPLANATION_MODES.find(m => m.id === selectedMode)?.desc}
              </span>

              {messages.length > 0 && (
                <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                  {messages.length} messages
                </span>
              )}

              {currentConversation && (
                <button
                  onClick={() => handleTogglePin(currentConversation.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    currentConversation.is_bookmarked
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs hover:bg-amber-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200'
                  }`}
                  title={currentConversation.is_bookmarked ? "Unpin chat from sidebar" : "Pin chat to sidebar"}
                >
                  <Pin className={`h-3.5 w-3.5 ${currentConversation.is_bookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  <span>{currentConversation.is_bookmarked ? 'Pinned to Sidebar' : 'Pin to Sidebar'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 rounded-xl bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <div className="h-16 w-16 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ask Any Academic Doubt
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Get instant, syllabus-grounded academic doubt resolution with step-by-step logic, code demonstrations, and verified answers.
              </p>

              {/* Recommended Quick Question Chips */}
              <div className="w-full mt-6 text-left">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Suggested Exam Questions (BCA Curriculum):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAskDoubt(null, qp.text)}
                      className="p-3 rounded-xl bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all group shadow-2xs"
                    >
                      <div className="text-[11px] font-bold text-indigo-900 group-hover:text-indigo-950">
                        {qp.title}
                      </div>
                      <div className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
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
                  className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none ml-12 shadow-sm'
                      : msg.is_error
                        ? 'bg-rose-50/90 border border-rose-300 dark:border-rose-900/60 text-rose-950 dark:text-rose-100 rounded-bl-none mr-8 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-bl-none mr-8 shadow-sm'
                  }`}
                >
                  {/* AI Message metadata header */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        {msg.is_error ? (
                          <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                            Engine Communication Error
                          </span>
                        ) : (msg.mode_used || selectedMode) === 'assist' ? (
                          <span className="font-bold text-amber-950 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                            <span>Assist Mode (Guided Socratic Research)</span>
                          </span>
                        ) : (msg.mode_used || selectedMode) === 'eli5' ? (
                          <span className="font-bold text-purple-950 dark:text-purple-300 bg-purple-100/90 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <Lightbulb className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400" />
                            <span>ELI5 Mode</span>
                          </span>
                        ) : (
                          <span className="font-bold text-indigo-950 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <GraduationCap className="h-3.5 w-3.5 text-indigo-700 dark:text-indigo-400" />
                            <span>Detailed Academic Mode</span>
                          </span>
                        )}
                        {msg.model_used && (
                          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                            {msg.model_used}
                          </span>
                        )}
                      </div>
                      {!msg.is_error && (
                        <button
                          onClick={() => handleCopy(msg.message_text, `msg-${msg.id}`)}
                          className="hover:text-indigo-600 text-slate-600 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-md transition-colors"
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
                      <p className="font-semibold text-rose-950 leading-relaxed">{msg.message_text}</p>
                      <p className="text-[11px] text-rose-700">The AI reasoning service did not return an academic response.</p>
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
                <span>Generating academic explanation...</span>
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
              placeholder="Type your academic question or doubt here (e.g. explain how quicksort partition works)..."
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
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[10px]">Enter ↵</kbd> to submit • <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[10px]">Shift + Enter</kbd> for new line</span>
            <div className="flex items-center gap-2">
              <span>Mode: <strong className="text-indigo-600 font-medium">{EXPLANATION_MODES.find(m => m.id === selectedMode)?.label}</strong></span>
            </div>
          </div>
        </form>

      </div>

      {/* CREATE NOTES & PDF MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/25">
                  <FileDown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {noteSuccessData ? 'Notes & PDF Created!' : 'Create Notes from Doubt Session'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {noteSuccessData 
                      ? 'Saved to your Personal Library in Resource Library'
                      : 'Generate structured academic notes and PDF from this chat transcript'
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {noteSuccessData ? (
                /* Success View */
                <div className="space-y-5 text-center py-4">
                  <div className="h-16 w-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900">
                      Successfully Added to Your Personal Library!
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your discussion transcript has been structured into clean revision notes with an academic A4 PDF document generated and stored in your <strong>Personal Library</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Document Summary</div>
                    <div className="text-sm font-semibold text-slate-800 line-clamp-1">{noteSuccessData.title}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
                        {noteSuccessData.subject_code || noteSubjectCode}
                      </span>
                      <span>•</span>
                      <span>{messages.filter(m => m.sender === 'user').length} Question(s) Compiled</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {noteSuccessData.download && (
                      <button
                        onClick={noteSuccessData.download}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download PDF File</span>
                      </button>
                    )}

                    {onNavigateToPersonalLibrary && (
                      <button
                        onClick={() => {
                          setIsNoteModalOpen(false);
                          onNavigateToPersonalLibrary();
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
                      >
                        <span>Open Personal Library</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Note Creation Form */
                <div className="space-y-4 text-xs">
                  {noteError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {noteError}
                    </div>
                  )}

                  {/* Note Title */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Note Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g. Computer Networks - Sliding Window Protocol Notes"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                    />
                  </div>

                  {/* Subject and Topic row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Academic Subject
                      </label>
                      <select
                        value={noteSubjectCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoteSubjectCode(val);
                          const sObj = subjects.find(s => s.code === val);
                          if (sObj) setNoteSubjectName(sObj.name);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                      >
                        {subjects.map(s => (
                          <option key={s.id} value={s.code}>
                            {s.code} - {s.name}
                          </option>
                        ))}
                        {!subjects.some(s => s.code === noteSubjectCode) && (
                          <option value={noteSubjectCode}>{noteSubjectCode}</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Topic Name
                      </label>
                      <input
                        type="text"
                        value={noteTopic}
                        onChange={(e) => setNoteTopic(e.target.value)}
                        placeholder="e.g. Sliding Window Protocols"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Executive Revision Summary */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Executive Revision Summary</span>
                      <span className="text-[10px] font-normal text-slate-400">Included on first page of PDF</span>
                    </label>
                    <textarea
                      rows={3}
                      value={noteSummary}
                      onChange={(e) => setNoteSummary(e.target.value)}
                      placeholder="Add key bullet points or summary highlights for fast revision..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white leading-relaxed resize-none"
                    />
                  </div>

                  {/* Chat Content Preview details */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Transcript to be Compiled</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-[10px] font-mono border border-indigo-200">
                        {messages.length} messages
                      </span>
                    </div>

                    <div className="text-[11px] text-indigo-700 space-y-1">
                      <p>• {messages.filter(m => m.sender === 'user').length} question(s) asked by student</p>
                      <p>• {messages.filter(m => m.sender === 'ai' && !m.is_error).length} verified AI explanation(s) with code, equations, and steps</p>
                      <p>• Formatted with standard margin A4 pages, headers, footers & page numbering</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!noteSuccessData && (
              <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 font-medium text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAndSaveNotes}
                  disabled={isGeneratingNotes || !noteTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  {isGeneratingNotes ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin text-emerald-200" />
                      <span>Generating PDF & Saving...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4" />
                      <span>Generate PDF & Save to Personal Library</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
