import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Download, Search, Filter, 
  ExternalLink, Eye, CheckCircle2, Bookmark 
} from 'lucide-react';
import { api } from '../services/api';

const RESOURCE_TYPES = [
  { id: '', label: 'All Resources' },
  { id: 'notes', label: 'Lecture Notes' },
  { id: 'paper', label: 'Previous Year Papers (PYQ)' },
  { id: 'key', label: 'Answer Keys & Solutions' },
  { id: 'reference', label: 'Reference Workbooks' },
];

export default function ResourceLibrary({ user }) {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState(null);

  useEffect(() => {
    loadSubjects();
    loadResources();
  }, [selectedSubject, selectedType]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResources();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>SRMCM Lucknow Academic Repository</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curated Subject Notes, Solved PYQs & Answer Keys
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Access verified lecture notes, previous year university exam papers, and faculty-approved answer keys indexed by semester and subject codes.
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
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </form>
        </div>

      </div>

      {/* Resources Grid */}
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
                  {res.resource_type}
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
                  onClick={() => alert(`Downloading document: ${res.title}`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-2xl">
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
                  <li>Resource Type: <strong className="text-slate-900 capitalize">{previewResource.resource_type}</strong></li>
                  <li>Institution: <strong className="text-slate-900">SRMCM Lucknow (BCA Curriculum)</strong></li>
                  <li>Format: <strong className="text-slate-900">PDF Document / Verified Course Handout</strong></li>
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
                onClick={() => alert(`Starting download for ${previewResource.title}`)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
