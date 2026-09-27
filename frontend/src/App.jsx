import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Compass, BarChart3, Target, Award, 
  BookOpen, ShieldCheck, LogOut, GraduationCap, User 
} from 'lucide-react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import DoubtSolver from './components/DoubtSolver';
import LearningRoadmaps from './components/LearningRoadmaps';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import StudyPlanner from './components/StudyPlanner';
import QuizCenter from './components/QuizCenter';
import ResourceLibrary from './components/ResourceLibrary';
import AdminPanel from './components/AdminPanel';
import { getStoredUser, clearAuthToken } from './services/api';

const STUDENT_TABS = [
  { id: 'doubts', label: 'AI Doubt Solver', icon: MessageSquare, badge: '6 Modes' },
  { id: 'roadmaps', label: 'Roadmaps & Notes', icon: Compass },
  { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
  { id: 'planner', label: 'Study Planner', icon: Target, badge: 'Streaks' },
  { id: 'quiz', label: 'Quiz & Exam Prep', icon: Award },
  { id: 'resources', label: 'Resource Library', icon: BookOpen },
  { id: 'admin', label: 'System Overview', icon: ShieldCheck },
];

const ADMIN_TABS = [
  { id: 'admin', label: 'System Overview & Telemetry', icon: ShieldCheck, badge: 'Admin' },
  { id: 'resources', label: 'Resource Management', icon: BookOpen },
  { id: 'analytics', label: 'Student Performance Metrics', icon: BarChart3 },
  { id: 'quiz', label: 'Quiz Repository', icon: Award },
  { id: 'doubts', label: 'Test AI Doubt Solver', icon: MessageSquare, badge: '6 Modes' },
  { id: 'roadmaps', label: 'Curriculum Roadmaps', icon: Compass },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('doubts');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check if user already has an active session
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      if (stored.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('doubts');
      }
    }

    const handleAuthChange = () => {
      const u = getStoredUser();
      setUser(u);
      if (u?.role === 'admin') {
        setActiveTab('admin');
      }
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('doubts');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setActiveTab('doubts');
  };

  // If not logged in, show the aesthetic Landing Page with direct Student & Admin login options!
  if (!user) {
    return (
      <>
        <LandingPage 
          onLoginSuccess={handleLoginSuccess}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  const currentTabs = user.role === 'admin' ? ADMIN_TABS : STUDENT_TABS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar 
        user={user}
        setUser={setUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Module Navigation Tabs */}
      <nav className="glass-panel border-b border-slate-800/80 bg-slate-950/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
              {currentTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? user.role === 'admin'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive 
                          ? 'bg-black/30 text-white' 
                          : user.role === 'admin' ? 'bg-purple-950/60 text-purple-300' : 'bg-slate-800 text-indigo-400'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick role indicator & Exit to Landing Page button */}
            <div className="hidden sm:flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                user.role === 'admin' 
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {user.role} mode
              </span>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Log out and return to landing page"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'doubts' && (
          <DoubtSolver user={user} onRequireAuth={() => setAuthModalOpen(true)} />
        )}
        {activeTab === 'roadmaps' && (
          <LearningRoadmaps user={user} onRequireAuth={() => setAuthModalOpen(true)} />
        )}
        {activeTab === 'analytics' && (
          <PerformanceAnalytics user={user} onRequireAuth={() => setAuthModalOpen(true)} />
        )}
        {activeTab === 'planner' && (
          <StudyPlanner user={user} onRequireAuth={() => setAuthModalOpen(true)} />
        )}
        {activeTab === 'quiz' && (
          <QuizCenter user={user} onRequireAuth={() => setAuthModalOpen(true)} />
        )}
        {activeTab === 'resources' && (
          <ResourceLibrary user={user} />
        )}
        {activeTab === 'admin' && (
          <AdminPanel user={user} />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900/90 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">
              AI Doubt Solving Platform — SRMCM Lucknow
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Author: <strong className="text-slate-300">Prabhat</strong> • Mentor: <strong className="text-slate-300">Mr. Abhradip Kundu</strong>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleLoginSuccess}
      />

    </div>
  );
}
