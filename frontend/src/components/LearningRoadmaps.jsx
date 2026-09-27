import React, { useState, useEffect } from 'react';
import { 
  Compass, BookOpen, Sparkles, CheckCircle2, Clock, 
  ArrowRight, FileText, Lightbulb, ChevronRight 
} from 'lucide-react';
import { api } from '../services/api';

export default function LearningRoadmaps({ user, onRequireAuth }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // Chapter Summary / AI Notes Generator State
  const [topicInput, setTopicInput] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
        fetchRoadmap(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoadmap = async (subjId) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setLoadingRoadmap(true);
    try {
      const res = await api.getRoadmap(subjId);
      setRoadmap(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    if (!user) {
      onRequireAuth();
      return;
    }

    setGeneratingSummary(true);
    try {
      const res = await api.summarizeTopic(topicInput, selectedSubject);
      setSummaryData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-3">
            <Compass className="h-3.5 w-3.5" />
            <span>AI Learning Assistant & Curriculum Roadmaps</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Study Roadmaps & Chapter Summaries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Actively teaches core theoretical concepts with structured 5-step milestone roadmaps, instant AI revision notes, and exam prep blueprints tailored to your syllabus.
          </p>
        </div>
      </div>

      {/* Main Grid: Roadmap on Left, Chapter Notes Generator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Personalized Roadmap (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-600" />
                <span>Subject Mastery Roadmap</span>
              </h3>
              <p className="text-[11px] text-slate-500">Step-by-step academic progression</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Select Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  fetchRoadmap(e.target.value);
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold focus:bg-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingRoadmap ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <Sparkles className="h-6 w-6 mx-auto text-indigo-600 animate-spin mb-2" />
              <span>Generating syllabus roadmap...</span>
            </div>
          ) : roadmap ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-900">{roadmap.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{roadmap.overview}</p>
              </div>

              {/* Milestones timeline */}
              <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {roadmap.milestones?.map((m, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ring-4 ring-white z-10 ${
                      m.status === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : m.status === 'in_progress'
                        ? 'bg-indigo-600 text-white animate-pulse shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {m.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : m.step}
                    </div>

                    <div className="flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-900">{m.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {m.status === 'completed' ? 'Mastered' : m.status === 'in_progress' ? 'Current Focus' : 'Upcoming'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{m.description}</p>
                      <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Estimated Study: {m.estimated_hours} Hours</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10">Select a subject to view its learning roadmap.</p>
          )}

        </div>

        {/* Right Column: AI Chapter Summary & Quick Revision Notes (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span>AI Chapter Summaries & Revision Notes</span>
            </h3>
            <p className="text-[11px] text-slate-500">Generate high-yield exam summaries for any chapter</p>
          </div>

          <form onSubmit={handleGenerateSummary} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter topic (e.g. 'Semaphores & Mutex Locks' or 'B-Trees')..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={generatingSummary || !topicInput.trim()}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-sm shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {generatingSummary ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate Revision Notes</span>
                </>
              )}
            </button>
          </form>

          {/* Rendered Summary */}
          {summaryData ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-purple-200 max-h-96 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-purple-800">{summaryData.topic}</span>
                <span className="text-[10px] text-slate-500">{summaryData.subject}</span>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {summaryData.summary}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
              <Lightbulb className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p>Type any topic or chapter name above to generate high-yield exam notes instantly.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
