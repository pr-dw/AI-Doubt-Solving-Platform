import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, BookOpen, MessageSquare, Cpu, 
  Database, Server, CheckCircle2, ArrowUpRight 
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administration & System Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Statistics & Local Ollama Config
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Monitor real-time academic records, student engagement, database storage, and local AI model inference parameters.
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Enrolled Students</span>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{stats?.total_students || 1}</div>
          <div className="text-[10px] text-emerald-400 mt-1">SRMCM BCA Cohort</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Curriculum Subjects</span>
            <BookOpen className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{stats?.total_subjects || 6}</div>
          <div className="text-[10px] text-purple-300 mt-1">Semester 5 Curricula</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">AI Doubts Resolved</span>
            <MessageSquare className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{stats?.total_conversations || 0}</div>
          <div className="text-[10px] text-emerald-300 mt-1">In 6 Explanation Modes</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Study Resources</span>
            <Database className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{stats?.total_resources || 5}</div>
          <div className="text-[10px] text-amber-300 mt-1">Notes, PYQs & Keys</div>
        </div>
      </div>

      {/* Local AI Architecture & Ollama Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Local AI Engine Status */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span>Local AI Model Engine (Ollama)</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Default Inference Model</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{stats?.ollama_model || 'qwen2.5:latest'}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Target
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Ollama API Base URL</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{stats?.ollama_endpoint || 'http://127.0.0.1:11434'}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Localhost
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Privacy & Data Governance</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Zero student prompts sent to external cloud APIs</div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Project Authors & Guide Credits */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span>Academic Project Credentials</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[11px] text-slate-400">Student Developer</div>
                <div className="font-bold text-slate-100">Prabhat</div>
                <div className="text-[10px] text-indigo-400 font-mono">BCA Final Year • SRMCM Lucknow</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Author
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[11px] text-slate-400">Mentor & Project Guide</div>
                <div className="font-bold text-slate-100">Mr. Abhradip Kundu</div>
                <div className="text-[10px] text-purple-400">Assistant Professor, SRMCM</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Faculty Guide
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[11px] text-slate-400">Head of Department (HoD)</div>
                <div className="font-bold text-slate-100">Dr. Santosh Kumar Dwivedi</div>
                <div className="text-[10px] text-slate-400">Department of Computer Application</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300">
                HoD
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
