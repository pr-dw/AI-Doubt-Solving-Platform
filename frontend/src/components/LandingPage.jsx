import React, { useState } from 'react';
import { 
  GraduationCap, Sparkles, Shield, User, ArrowRight, CheckCircle2, 
  Flame, BookOpen, Compass, BarChart3, Award, Cpu,
  HelpCircle, Lightbulb, Lock, Layers, Play, Target
} from 'lucide-react';
import { api } from '../services/api';

const EXPLANATION_MODES = [
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
  { 
    id: 'assist', 
    title: 'Assist (Guided Research)', 
    icon: HelpCircle, 
    color: 'from-amber-500 to-orange-500',
    desc: 'Points you directly to what topic to study and hints without spoiling answers.' 
  },
];

const PLATFORM_PILLARS = [
  {
    icon: Target,
    title: 'Personalised Study Order (Max ROI)',
    desc: 'Examines previous exam marks by question & question paper PDFs to rank your worst to best topics for maximum score recovery.',
    tag: 'Exam Score Maximizer'
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Real-time tracking of internal assessment marks, strong vs weak topics, and AI grade forecasting.',
    tag: 'Data-Driven'
  },
  {
    icon: Flame,
    title: 'Study Streaks & Gamification',
    desc: 'Build consistent daily learning habits with automated streak counters, task checklists, and confetti rewards.',
    tag: 'Habit Building'
  },
  {
    icon: Award,
    title: 'Topic Quizzes & Solved PYQs',
    desc: 'Practice previous year university exam questions with timed multiple-choice drills and detailed answer keys.',
    tag: 'Exam Ready'
  },
];

export default function LandingPage({ user, onLoginSuccess, onOpenAuthModal, onGoToDashboard }) {
  const [activeModeDemo, setActiveModeDemo] = useState('eli5');

  const handleAuthAction = () => {
    if (user && onGoToDashboard) {
      onGoToDashboard();
    } else if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
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
            <span>On-Device Academic Intelligence • Powered by Local Ollama</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Master Any Academic Doubt with <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Intelligent Local AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A comprehensive full-stack educational tool designed for students and educators. Resolve complex academic questions with 6 explanation modes, generate personalized learning roadmaps, maintain study streaks, and ace university examinations.
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
              <span>Session active for <strong className="text-indigo-600 font-bold">{user.name || user.email}</strong> ({user.role}). Click above to resume without re-entering credentials.</span>
            ) : (
              <span>One login for all roles — your dashboard automatically opens based on whether your account is a <strong>Student</strong>, <strong>Faculty</strong>, or <strong>Admin</strong>.</span>
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
              <span className="ml-2 text-xs font-mono text-slate-500">Live AI Doubt Solver Preview</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Ollama Ready</span>
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
              <span>Question: "How do AVL Tree double rotations restore height balance?"</span>
              <span className="text-slate-500 font-mono">BCA-501 • Data Structures</span>
            </div>

            {activeModeDemo === 'eli5' && (
              <div className="space-y-2 text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <p>🎈 <strong>Explain Like I'm 5 Analogy:</strong></p>
                <p>Imagine a playground seesaw with three kids: one on the left, one on the right, and one sitting right in the zigzag bend.</p>
                <p>If the seesaw tips too much in a zigzag shape, you can't balance it with just one push. First, you straighten the zigzag so everyone is in a straight line (First Rotation), and then you tilt the middle child to the pivot center (Second Rotation). Now the seesaw is perfectly balanced!</p>
              </div>
            )}

            {activeModeDemo === 'assist' && (
              <div className="space-y-2.5 text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <p className="font-bold text-amber-700 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  <span>Assist Mode (Guided Socratic Research):</span>
                </p>
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs">
                  <p className="font-semibold text-amber-900">🎯 Understanding Validation:</p>
                  <p className="text-amber-800 mt-0.5">You correctly recognized that a single rotation does not restore the AVL height invariant because the heavy grandchild lies on the inner subtree (a zigzag path).</p>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-indigo-900">📚 What to Study & Research:</p>
                  <p className="text-slate-600">Research <strong>"AVL Tree Left-Right (LR) Double Rotation Decomposition"</strong> and the <strong>Balance Factor sign inversion rule</strong> in Unit 3 of your Data Structures syllabus.</p>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-emerald-800">💡 Guiding Clue:</p>
                  <p className="text-slate-600">Notice what happens when you rotate the child node first: how does that transform a zigzag branch into a straight linear line?</p>
                </div>
                <div className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <p className="font-semibold text-purple-700">🔍 Checkpoint Challenge:</p>
                  <p>Sketch a 3-node tree with keys 30 &rarr; 10 &rarr; 20 on scratch paper. Try rotating 10 left. What does the tree look like now?</p>
                </div>
              </div>
            )}

            {activeModeDemo === 'detailed' && (
              <div className="space-y-2 text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <p>🎓 <strong>Comprehensive Academic Explanation:</strong></p>
                <p>An AVL Tree is a strictly self-balancing Binary Search Tree named after inventors Adelson-Velsky and Landis. Double rotations (LR and RL) resolve zigzag structural imbalances that single rotations cannot fix, maintaining strict O(log N) lookup and insertion invariants.</p>
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
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">AI Doubt Solving Platform</span>
            <span>•</span>
            <span>Built with React 19, Django, and Local Ollama</span>
          </div>
          <div className="text-[11px]">
            Credentials: <code className="text-indigo-600 font-semibold">student@gmail.com</code> • <code className="text-emerald-600 font-semibold">faculty@gmail.com</code> • <code className="text-purple-600 font-semibold">admin@gmail.com</code> (Pass: <code className="text-slate-800 font-semibold">123456</code>)
          </div>
        </div>
      </footer>

    </div>
  );
}
