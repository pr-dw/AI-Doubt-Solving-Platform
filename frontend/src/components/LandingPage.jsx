import React, { useState } from 'react';
import { 
  GraduationCap, Sparkles, Shield, User, ArrowRight, CheckCircle2, 
  Flame, BookOpen, Compass, BarChart3, Award, Cpu,
  HelpCircle, Lightbulb, Lock, Layers, Play, Target
} from 'lucide-react';
import { api } from '../services/api';
import ThemeToggle from './ThemeToggle';

const EXPLANATION_MODES = [
  { 
    id: 'assist', 
    title: 'Assist (Guiding Nudge)', 
    icon: HelpCircle, 
    color: 'from-amber-500 to-orange-500',
    desc: 'Single-line Socratic hint pointing to what command or topic to research.' 
  },
  { 
    id: 'detailed', 
    title: 'Detailed Academic', 
    icon: GraduationCap, 
    color: 'from-indigo-500 to-indigo-600',
    desc: 'Deep theoretical foundations, system architectures, and curriculum-aligned principles.' 
  },
  { 
    id: 'eli5', 
    title: "Explain Like I'm 5", 
    icon: Lightbulb, 
    color: 'from-emerald-500 to-teal-500',
    desc: 'Everyday analogies and intuitive metaphors that make dense topics instantly click.' 
  },
];

const PLATFORM_PILLARS = [
  {
    icon: Target,
    title: 'Personalised Study Planner',
    desc: 'Organizes course topics based on syllabus priorities and curriculum blueprints to optimize your study time.',
    tag: 'Study Planning'
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Real-time tracking of assessment marks, strong vs weak topics, and academic progress indicators.',
    tag: 'Data-Driven'
  },
  {
    icon: CheckCircle2,
    title: 'Structured Goal Tracking',
    desc: 'Maintain daily learning consistency with organized study checklists, milestone countdowns, and topic goals.',
    tag: 'Productivity'
  },
  {
    icon: Award,
    title: 'Topic Quizzes & Solved PYQs',
    desc: 'Practice previous year university exam questions with timed multiple-choice drills and detailed answer keys.',
    tag: 'Exam Ready'
  },
];

export default function LandingPage({ user, onLoginSuccess, onOpenAuthModal, onGoToDashboard }) {
  const [activeModeDemo, setActiveModeDemo] = useState('assist');

  const handleAuthAction = () => {
    if (user && onGoToDashboard) {
      onGoToDashboard();
    } else if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden transition-colors duration-200">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/90 bg-white/85 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-1 ring-slate-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent">
                AI Doubt Solving Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {user ? (
              <button
                onClick={onGoToDashboard}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Go to Dashboard ({user.name || user.role})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Sign In to Portal</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span>Smart Academic Study Partner • Instant Doubt Resolution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Master Any Academic Doubt with <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Adaptive AI Guidance
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Your personalized 24/7 academic tutor. Understand complex concepts with tailored explanation modes, structured learning roadmaps, exam preparation drills, and progress tracking.
          </p>

          {/* Unified Single Login Button & CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={handleAuthAction}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span>{user ? 'Return to Dashboard' : 'Sign In to Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            {user ? (
              <span>Logged in as <strong className="text-indigo-600 font-semibold">{user.name || user.email}</strong>. Click above to return to your dashboard.</span>
            ) : (
              <span>Dedicated workspaces for Students, Faculty, and Academic Administrators.</span>
            )}
          </p>

        </div>

        {/* Interactive Doubt Solver Showcase Preview */}
        <div className="mt-16 max-w-4xl mx-auto rounded-3xl glass-panel p-4 sm:p-6 border border-slate-200 shadow-xl relative overflow-hidden bg-white/95">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
              <span className="ml-2 text-xs font-medium text-slate-500">Live AI Doubt Solver Preview</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>AI Ready</span>
            </div>
          </div>

          {/* Mode Selector Tabs Demo */}
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {EXPLANATION_MODES.map(m => {
              const Icon = m.icon;
              const isSelected = activeModeDemo === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModeDemo(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{m.title}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Response Demonstration Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-3">
            <div className="text-[11px] text-indigo-700 font-semibold flex items-center justify-between">
              <span>Question: "How do I read a text file backwards using command line in Linux?"</span>
              <span className="text-slate-500 font-mono">NBCA-5053 • UNIX Operating System</span>
            </div>

            {activeModeDemo === 'assist' && (
              <div className="text-slate-900 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Assist Mode (Guiding Nudge)</span>
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 text-xs sm:text-sm">
                  <span className="text-amber-600 dark:text-amber-400 shrink-0 font-bold text-base">💡</span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    Maybe research the <code className="px-1.5 py-0.5 rounded bg-amber-100/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono text-xs font-semibold">tac</code> command for Linux terminal to print and read file contents in reverse order.
                  </p>
                </div>
              </div>
            )}

            {activeModeDemo === 'eli5' && (
              <div className="space-y-2 text-slate-900 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Lightbulb className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>ELI5 Analogy:</span>
                </p>
                <p className="text-slate-900 dark:text-slate-100 font-normal text-xs sm:text-sm">
                  Think of reading normal files like walking down stairs from step 1 to 10 with <code className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 font-mono text-xs font-semibold">cat</code>. Reading it backwards is like walking from step 10 back up to step 1 with <code className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 font-mono text-xs font-semibold">tac</code> (which is literally "cat" spelled backwards!).
                </p>
              </div>
            )}

            {activeModeDemo === 'detailed' && (
              <div className="space-y-2 text-slate-900 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Comprehensive Academic Explanation:</span>
                </p>
                <p className="text-slate-900 dark:text-slate-100 font-normal text-xs sm:text-sm">
                  In UNIX and Linux systems, the standard <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold">cat</code> utility concatenates and prints files in sequential line order. To display files in reverse line order, GNU coreutils provides the <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold">tac</code> utility, which buffers records and streams lines starting from the last newline delimiter.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Focused Academic Explanation Modes Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Pioneering AI Pedagogy</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            3 Focused Academic Modes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Master every subject with 3 specialized modes: in-depth curriculum theory, everyday intuitive analogies, and Socratic guided research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXPLANATION_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className="p-6 rounded-2xl glass-panel border border-slate-200 hover:border-indigo-300 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${mode.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                  <span>Available in Doubt Solver</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-slate-100/70 rounded-3xl border border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">End-to-End Academic Workflow</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Everything You Need for Academic Excellence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            From natural language doubt solving to exam countdowns and progress analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLATFORM_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="p-5 rounded-2xl glass-panel border border-slate-200 bg-white flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/80 backdrop-blur-sm py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-800">AI Doubt Solving Platform</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Empowering students & educators with intelligent academic assistance</span>
          </div>
          <div className="text-slate-400 text-[11px] flex items-center gap-3">
            <span>Privacy-First</span>
            <span>•</span>
            <span>Adaptive Pedagogy</span>
            <span>•</span>
            <span>© 2026 Academic AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
