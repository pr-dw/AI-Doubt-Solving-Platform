import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Download, Search, Filter, 
  ExternalLink, Eye, CheckCircle2, Bookmark, GraduationCap,
  Sparkles, Trash2, ArrowRight, UserCheck, Calendar, Clock,
  FileDown, Plus, Layers, BookMarked, Copy, Check, X
} from 'lucide-react';
import { api } from '../services/api';
import { generateNotesPDF } from '../utils/pdfGenerator';

const RESOURCE_TYPES = [
  { id: '', label: 'All Resources' },
  { id: 'notes', label: 'Lecture Notes' },
  { id: 'paper', label: 'Previous Year Papers (PYQ)' },
  { id: 'key', label: 'Answer Keys & Solutions' },
  { id: 'reference', label: 'Reference Workbooks' },
];

export default function ResourceLibrary({ 
  user, 
  initialTab = 'college', 
  onTabChange, 
  onNavigateToDoubts 
}) {
  const [activeLibrary, setActiveLibrary] = useState(initialTab); // 'college' | 'personal'
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState(null);

  // Personal Library state
  const [personalNotes, setPersonalNotes] = useState([]);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalSelectedSubject, setPersonalSelectedSubject] = useState('');
  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [previewNote, setPreviewNote] = useState(null);
  const [copiedNoteId, setCopiedNoteId] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveLibrary(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const isFaculty = user?.role === 'faculty';
  const effectiveLibrary = isFaculty ? 'college' : activeLibrary;

  useEffect(() => {
    if (isFaculty && activeLibrary !== 'college') {
      setActiveLibrary('college');
    }
  }, [isFaculty, activeLibrary]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (effectiveLibrary === 'college') {
      loadResources();
    } else if (!isFaculty && user) {
      loadPersonalNotes();
    }
  }, [effectiveLibrary, selectedSubject, selectedType, personalSelectedSubject, user?.id]);

  const handleLibraryTabSwitch = (tab) => {
    if (isFaculty) return;
    setActiveLibrary(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await api.getResources(selectedSubject, selectedType, searchQuery);
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalNotes = async () => {
    if (isFaculty || !user) {
      setPersonalNotes([]);
      return;
    }
    setPersonalLoading(true);
    try {
      let serverNotes = [];
      try {
        serverNotes = await api.getPersonalNotes(personalSelectedSubject, personalSearchQuery);
      } catch (serverErr) {
        console.warn('Personal notes API fallback:', serverErr);
      }

      // Merge with user-scoped localStorage cache
      let cachedNotes = [];
      const userCacheKey = `personal_notes_cache_${user.id}`;
      try {
        cachedNotes = JSON.parse(localStorage.getItem(userCacheKey) || '[]');
      } catch {
        cachedNotes = [];
      }

      const mergedMap = new Map();
      serverNotes.forEach(n => mergedMap.set(String(n.id), n));
      cachedNotes.forEach(n => {
        if (!mergedMap.has(String(n.id))) {
          mergedMap.set(String(n.id), n);
        }
      });

      let combined = Array.from(mergedMap.values());

      // Filter locally if subject or query provided
      if (personalSelectedSubject) {
        combined = combined.filter(n => 
          (n.subject_code && n.subject_code.toLowerCase() === personalSelectedSubject.toLowerCase()) ||
          (n.subject && String(n.subject) === String(personalSelectedSubject))
        );
      }
      if (personalSearchQuery) {
        const q = personalSearchQuery.toLowerCase();
        combined = combined.filter(n =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.summary && n.summary.toLowerCase().includes(q)) ||
          (n.topic && n.topic.toLowerCase().includes(q)) ||
          (n.subject_code && n.subject_code.toLowerCase().includes(q))
        );
      }

      setPersonalNotes(combined);
    } catch (err) {
      console.error('Error loading personal notes:', err);
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (effectiveLibrary === 'college') {
      loadResources();
    } else {
      loadPersonalNotes();
    }
  };

  const handleDeletePersonalNote = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this note from your Personal Library?")) return;

    try {
      await api.deletePersonalNote(id).catch(() => {});
    } catch {
      // ignore
    }

    // Update state
    const updated = personalNotes.filter(n => n.id !== id);
    setPersonalNotes(updated);

    // Update localStorage user-scoped
    if (user?.id) {
      try {
        const userCacheKey = `personal_notes_cache_${user.id}`;
        const cached = JSON.parse(localStorage.getItem(userCacheKey) || '[]');
        const filtered = cached.filter(n => n.id !== id);
        localStorage.setItem(userCacheKey, JSON.stringify(filtered));
      } catch {}
    }
  };

  const handleDownloadPersonalNote = (note) => {
    if (note.pdf_url && (note.pdf_url.startsWith('http') || note.pdf_url.startsWith('/media/'))) {
      window.open(note.pdf_url, '_blank');
      return;
    }

    // Reconstruct and download PDF dynamically if file url not directly reachable
    try {
      const mockMessages = [];
      if (note.content) {
        const parts = note.content.split('---');
        parts.forEach((p, idx) => {
          if (p.includes('### Student Question:')) {
            const q = p.replace('### Student Question:', '').trim();
            mockMessages.push({ id: idx, sender: 'user', message_text: q });
          } else if (p.includes('### AI Solution')) {
            const a = p.replace(/### AI Solution.*:\n/, '').trim();
            mockMessages.push({ id: idx, sender: 'ai', message_text: a });
          }
        });
      }

      const { download } = generateNotesPDF({
        title: note.title,
        subjectCode: note.subject_code || 'GEN',
        subjectName: note.subject_name || 'Academic Course',
        studentName: user?.name || user?.email || 'Student',
        messages: mockMessages.length > 0 ? mockMessages : [
          { sender: 'user', message_text: note.topic || note.title },
          { sender: 'ai', message_text: note.summary || note.content || 'Study notes from AI Doubt Solver.' }
        ],
        summary: note.summary || '',
      });

      download();
    } catch (err) {
      console.error('PDF dynamic download error:', err);
      alert('Unable to download PDF. Please try again.');
    }
  };

  const handleCopyNoteContent = (text, noteId) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(noteId);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const formatDate = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PRIMARY LIBRARY SWITCHER: College Library vs Personal Library */}
      {isFaculty ? (
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>College Curriculum & Course Materials</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Official Repository
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Standard department syllabi, lecture notes, textbook references, and official examination papers.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleLibraryTabSwitch('college')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                effectiveLibrary === 'college'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              <span>College Resources</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Curated
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleLibraryTabSwitch('personal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                effectiveLibrary === 'personal'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-slate-200 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookMarked className="h-4 w-4 text-emerald-600" />
              <span>Personal Library</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {personalNotes.length} Notes
              </span>
            </button>
          </div>

          {effectiveLibrary === 'personal' && onNavigateToDoubts && (
            <button
              type="button"
              onClick={onNavigateToDoubts}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Notes in Doubt Solver</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 1: COLLEGE LIBRARY VIEW                                           */}
      {/* ========================================================================= */}
      {effectiveLibrary === 'college' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Banner */}
          <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span>College Academic Repository</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Curated Subject Notes, Solved PYQs & Answer Keys
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Access verified faculty lecture notes, official university question papers, and vetted model solutions indexed by semester and subject codes.
              </p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Type pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {RESOURCE_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedType === t.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Subject filter & search input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold focus:bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>

              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Search college docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </form>
            </div>

          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading college repository materials...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Resource Documents Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                No materials currently match the selected subject or type filter. When faculty uploads Question Papers, Answer Keys, or Course Notes, they will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(res => (
                <div
                  key={res.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-indigo-700 font-mono">
                        {res.subject_code}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 capitalize">
                        {res.resource_type === 'paper' ? 'Exam Paper (PYQ)' : res.resource_type === 'key' ? 'Answer Key' : res.resource_type}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                      {res.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed line-clamp-3">
                      {res.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {res.download_count} Downloads
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewResource(res)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={res.file_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>View / PDF</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 2: PERSONAL LIBRARY VIEW (Students Only)                          */}
      {/* ========================================================================= */}
      {effectiveLibrary === 'personal' && !isFaculty && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Personal Library Banner */}
          <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>My AI Revision Archive</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Personal Study Notes & Revision PDFs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Every time you ask doubts in the AI Doubt Solver and click <strong>Create Notes</strong>, your customized revision summaries and PDF documents are compiled and stored here.
              </p>
            </div>
          </div>

          {/* Search & Subject Filters */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <BookMarked className="h-4 w-4 text-emerald-600" />
              <span>{personalNotes.length} Document(s) in Personal Library</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={personalSelectedSubject}
                onChange={(e) => setPersonalSelectedSubject(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-emerald-500 font-semibold focus:bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>

              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Search my notes..."
                  value={personalSearchQuery}
                  onChange={(e) => setPersonalSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </form>
            </div>
          </div>

          {/* Personal Notes Grid */}
          {personalLoading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <div className="h-8 w-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading your personal notes...</p>
            </div>
          ) : personalNotes.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <FileText className="h-8 w-8" />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-800">No Personal Notes Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You haven't generated notes from doubt sessions yet. In the AI Doubt Solver, you can easily ask any question and click <strong>Create Notes</strong> above the chat to generate and export revision PDFs here.
                </p>
              </div>

              {onNavigateToDoubts && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToDoubts}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Go to AI Doubt Solver & Create Notes</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalNotes.map(note => (
                <div
                  key={note.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                        {note.subject_code || 'GEN'}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(note.created_at)}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mt-1">
                      {note.title}
                    </h3>

                    {note.topic && (
                      <div className="text-[10px] font-semibold text-slate-500 mt-1 truncate">
                        Topic: <span className="text-indigo-600">{note.topic}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {note.summary || 'Custom study notes generated from AI Doubt Solver conversation transcript.'}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={(e) => handleDeletePersonalNote(note.id, e)}
                      title="Delete note from Personal Library"
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewNote(note)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Read Note</span>
                      </button>

                      <button
                        onClick={() => handleDownloadPersonalNote(note)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm shadow-emerald-600/25 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW MODAL: COLLEGE RESOURCE                                          */}
      {/* ========================================================================= */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 font-mono">{previewResource.subject_code}</span>
                <h3 className="text-base font-bold text-slate-900">{previewResource.title}</h3>
              </div>
              <button 
                onClick={() => setPreviewResource(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Resource Overview</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{previewResource.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-900">
                <div className="font-semibold mb-1">Document Details:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Resource Type: <strong className="text-slate-900 capitalize">{previewResource.resource_type === 'paper' ? 'Official Question Paper' : previewResource.resource_type === 'key' ? 'Answer Key / Solutions' : previewResource.resource_type}</strong></li>
                  <li>Subject Code: <strong className="text-slate-900">{previewResource.subject_code}</strong></li>
                  <li>Format: <strong className="text-slate-900">Verified Academic PDF Document</strong></li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewResource(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 cursor-pointer"
              >
                Close Preview
              </button>
              <a
                href={previewResource.file_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Document PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* READER MODAL: PERSONAL STUDY NOTE                                         */}
      {/* ========================================================================= */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                      {previewNote.subject_code || 'GEN'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Generated {formatDate(previewNote.created_at)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
                    {previewNote.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyNoteContent(previewNote.content || previewNote.summary, previewNote.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs flex items-center gap-1 cursor-pointer"
                  title="Copy full note content"
                >
                  {copiedNoteId === previewNote.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span className="hidden sm:inline">{copiedNoteId === previewNote.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setPreviewNote(null)}
                  className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Note Content Viewer */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              {/* Summary box */}
              {previewNote.summary && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Executive Revision Summary</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {previewNote.summary}
                  </p>
                </div>
              )}

              {/* Full Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Full Notes & Doubt Transcript
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap text-slate-700">
                  {previewNote.content || 'No detailed transcript recorded.'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => setPreviewNote(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium text-xs cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => handleDownloadPersonalNote(previewNote)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Formatted PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
