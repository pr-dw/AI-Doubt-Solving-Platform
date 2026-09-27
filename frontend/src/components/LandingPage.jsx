import React, { useState } from 'react';
import { 
  GraduationCap, Sparkles, Shield, User, ArrowRight, CheckCircle2, 
  Flame, BookOpen, Compass, BarChart3, Award, Cpu, Code2, Sigma, 
  HelpCircle, Lightbulb, ListOrdered, Lock, Layers, Play 
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
    id: 'assist', 
    title: 'Assist (Socratic)', 
    icon: HelpCircle, 
    color: 'from-amber-500 to-orange-500',
    desc: 'Guided progressive hints and checkpoint questions that stimulate critical reasoning.' 
  },
  { 
    id: 'eli5', 
    title: "Explain Like I'm 5", 
    icon: Lightbulb, 
    color: 'from-emerald-500 to-teal-500',
    desc: 'Everyday analogies and intuitive metaphors that make dense topics instantly click.' 
  },
  { 
    id: 'step_by_step', 
    title: 'Step-by-Step Proof', 
    icon: ListOrdered, 
    color: 'from-blue-500 to-cyan-500',
    desc: 'Methodical derivations, equation solving, edge-case checking, and validation.' 
  },
  { 
    id: 'code', 
    title: 'Code Walkthrough', 
    icon: Code2, 
    color: 'from-purple-500 to-pink-500',
    desc: 'Optimal commented code snippets in Python, C++, and SQL with Big-O complexity analysis.' 
  },
  { 
    id: 'formula', 
    title: 'Formula & Proof', 
    icon: Sigma, 
    color: 'from-rose-500 to-red-500',
    desc: 'Mathematical rigor rendered in LaTeX notation with complete variable breakdowns.' 
  },
];

const PLATFORM_PILLARS = [
  {
    icon: Compass,
    title: 'Personalized Study Roadmaps',
    desc: '5-step curriculum progression roadmaps tailored to each semester subject with estimated study hours.',
    tag: 'Syllabus Aligned'
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

export default function LandingPage({ onLoginSuccess, onOpenAuthModal }) {
  const [activeModeDemo, setActiveModeDemo] = useState('eli5');
  const [loadingRole, setLoadingRole] = useState(null);
  const [authError, setAuthError] = useState('');

  const handleQuickLogin = async (email, password, roleLabel) => {
    setLoadingRole(roleLabel);
    setAuthError('');
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err) {
      setAuthError(`Failed to login as ${roleLabel}: ${err.message}`);
    } finally {
      setLoadingRole(null);
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
              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                SRMCM Lucknow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleQuickLogin('student@gmail.com', '123456', 'Student')}
              disabled={loadingRole !== null}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>Student</span>
            </button>

            <button
              onClick={() => handleQuickLogin('faculty@gmail.com', '123456', 'Faculty')}
              disabled={loadingRole !== null}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
              <span>Faculty</span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin@gmail.com', '123456', 'Admin')}
              disabled={loadingRole !== null}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Shield className="h-3.5 w-3.5 text-purple-600" />
              <span>Admin</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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
            A comprehensive full-stack educational tool designed for SRMCM Lucknow students. Resolve complex academic questions with 6 explanation modes, generate personalized learning roadmaps, maintain study streaks, and ace university examinations.
          </p>

          {/* Error Banner */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs max-w-md mx-auto">
              {authError}
            </div>
          )}

          {/* Quick Sign In Cards (Student, Faculty & Admin) */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              ⚡ Instant Evaluation Access (Click to Log In Directly)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Student Login Card */}
              <div 
                onClick={() => handleQuickLogin('student@gmail.com', '123456', 'Student')}
                className="group relative p-5 rounded-2xl glass-panel border border-indigo-200 hover:border-indigo-400 bg-white/90 cursor-pointer transition-all hover:scale-[1.02] shadow-sm hover:shadow-md text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Student Portal
                        </h3>
                        <span className="text-[10px] text-emerald-600 font-semibold">BCA Student</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                      Demo
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                    <div>Email: <strong className="text-indigo-700">student@gmail.com</strong></div>
                    <div>Pass: <strong className="text-indigo-700">123456</strong></div>
                  </div>
                </div>

                <button 
                  disabled={loadingRole !== null}
                  className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {loadingRole === 'Student' ? (
                    <span className="animate-spin text-sm">⟳ Signing In...</span>
                  ) : (
                    <>
                      <span>Enter as Student</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Faculty Login Card */}
              <div 
                onClick={() => handleQuickLogin('faculty@gmail.com', '123456', 'Faculty')}
                className="group relative p-5 rounded-2xl glass-panel border border-emerald-200 hover:border-emerald-400 bg-white/90 cursor-pointer transition-all hover:scale-[1.02] shadow-sm hover:shadow-md text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          Faculty Portal
                        </h3>
                        <span className="text-[10px] text-emerald-600 font-semibold">Course Mentor</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Demo
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                    <div>Email: <strong className="text-emerald-700">faculty@gmail.com</strong></div>
                    <div>Pass: <strong className="text-emerald-700">123456</strong></div>
                  </div>
                </div>

                <button 
                  disabled={loadingRole !== null}
                  className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {loadingRole === 'Faculty' ? (
                    <span className="animate-spin text-sm">⟳ Signing In...</span>
                  ) : (
                    <>
                      <span>Enter as Faculty</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Admin Login Card */}
              <div 
                onClick={() => handleQuickLogin('admin@gmail.com', '123456', 'Admin')}
                className="group relative p-5 rounded-2xl glass-panel border border-purple-200 hover:border-purple-400 bg-white/90 cursor-pointer transition-all hover:scale-[1.02] shadow-sm hover:shadow-md text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                          Admin Portal
                        </h3>
                        <span className="text-[10px] text-purple-600 font-semibold">System Controls</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                      Demo
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                    <div>Email: <strong className="text-purple-700">admin@gmail.com</strong></div>
                    <div>Pass: <strong className="text-purple-700">123456</strong></div>
                  </div>
                </div>

                <button 
                  disabled={loadingRole !== null}
                  className="mt-3 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
                >
                  {loadingRole === 'Admin' ? (
                    <span className="animate-spin text-sm">⟳ Signing In...</span>
                  ) : (
                    <>
                      <span>Enter as Admin</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onOpenAuthModal}
                className="text-xs text-slate-500 hover:text-indigo-600 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Or sign in with custom college credentials / create a new account →
              </button>
            </div>
          </div>

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

            {activeModeDemo === 'step_by_step' && (
              <div className="space-y-2 text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 font-mono text-xs shadow-xs">
                <p className="text-indigo-700 font-bold">📋 Left-Right (LR) Rotation Execution Steps:</p>
                <p>1. Detect imbalance: Balance Factor(Node A) = +2 and Balance Factor(Left Child B) = -1.</p>
                <p>2. Sub-step 1: Perform Left Rotation on Child B &rarr; Node C moves up, B becomes left child of C.</p>
                <p>3. Sub-step 2: Perform Right Rotation on Node A &rarr; Node C becomes the new root of the subtree.</p>
                <p>4. Result: Subtree height strictly restored to O(log N) depth.</p>
              </div>
            )}

            {activeModeDemo === 'code' && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{`def rotate_left_right(node_a):
    # Step 1: Left rotation on left child
    node_a.left = rotate_left(node_a.left)
    # Step 2: Right rotation on root node
    return rotate_right(node_a)
# Time Complexity: O(1) pointer updates | Space: O(1)`}</pre>
              </div>
            )}

            {activeModeDemo === 'formula' && (
              <div className="space-y-2 text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-indigo-700 font-bold">📐 Mathematical Height Invariant:</p>
                <p className="font-mono text-center py-2 text-sm text-indigo-900 bg-indigo-50/60 rounded-lg">
                  Balance Factor: BF(N) = Height(LeftSubtree) - Height(RightSubtree) ∈ &#123;-1, 0, +1&#125;
                </p>
                <p className="text-[11px] text-slate-500">Maximum AVL Tree Height bound: H(N) &lt; 1.4404 · log₂(N + 2) - 0.3277.</p>
              </div>
            )}

            {activeModeDemo !== 'eli5' && activeModeDemo !== 'step_by_step' && activeModeDemo !== 'code' && activeModeDemo !== 'formula' && (
              <div className="space-y-2 text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <p>🎓 <strong>Comprehensive Academic Explanation:</strong></p>
                <p>An AVL Tree is a strictly self-balancing Binary Search Tree named after inventors Adelson-Velsky and Landis. Double rotations (LR and RL) resolve zigzag structural imbalances that single rotations cannot fix, maintaining strict O(log N) lookup and insertion invariants.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6 Specialized Explanation Modes Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Pioneering AI Pedagogy</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            6 Specialized Explanation Modes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every student learns differently. Choose the cognitive style that fits your study session.
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

      {/* Institutional Credentials & Credits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="glass-panel rounded-3xl p-8 border border-slate-200 bg-white shadow-xs">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Academic Project Validation</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            AI Doubt Solving Platform — SRMCM Lucknow
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Developed as a Bachelor of Computer Application (BCA) Final Year Project under academic supervision.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Author & Developer</div>
              <div className="font-bold text-sm text-slate-900 mt-1">Prabhat</div>
              <div className="text-[11px] text-indigo-600 font-mono">BCA Final Year • SRMCM</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Project Mentor & Guide</div>
              <div className="font-bold text-sm text-slate-900 mt-1">Mr. Abhradip Kundu</div>
              <div className="text-[11px] text-purple-600">Assistant Professor, SRMCM</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Head of Department</div>
              <div className="font-bold text-sm text-slate-900 mt-1">Dr. Santosh Kumar Dwivedi</div>
              <div className="text-[11px] text-slate-600">Computer Application Dept.</div>
            </div>
          </div>
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
