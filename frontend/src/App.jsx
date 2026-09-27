import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Compass, BarChart3, Target, Award, BookOpen, ShieldCheck, LogOut, GraduationCap, User,
  Upload, FileText, Layers
} from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import DoubtSolver from './components/DoubtSolver';
import PersonalisedStudyOrder from './components/PersonalisedStudyOrder';
import FacultyExamPortal from './components/FacultyExamPortal';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import StudyPlanner from './components/StudyPlanner';
import QuizCenter from './components/QuizCenter';
import ResourceLibrary from './components/ResourceLibrary';
import AdminPanel from './components/AdminPanel';
import StudentProfile from './components/StudentProfile';
import { getStoredUser, clearAuthToken } from './services/api';

const STUDENT_TABS = [
  { id: 'doubts', label: 'AI Doubt Solver', icon: MessageSquare, badge: '6 Modes' },
  { id: 'study-order', label: 'Personalised Study Order', icon: Target, badge: 'Max ROI' },
  { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
  { id: 'planner', label: 'Study Planner', icon: Compass, badge: 'Streaks' },
  { id: 'quiz', label: 'Quiz & Exam Prep', icon: Award },
  { id: 'resources', label: 'Resource Library', icon: BookOpen },
  { id: 'profile', label: 'Student Profile', icon: User, badge: 'Account' },
];

const FACULTY_TABS = [
  { id: 'faculty-upload', label: '1. Upload Exam Paper', icon: Upload, badge: 'AI Mapping' },
  { id: 'faculty-score', label: '2. Score Students', icon: FileText, badge: 'Grading' },
  { id: 'faculty-exams', label: '3. Uploaded Exams', icon: Layers },
  { id: 'resources', label: 'Study Materials & Notes', icon: BookOpen },
  { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
];

const ADMIN_TABS = [
  { id: 'admin', label: 'System Overview & Telemetry', icon: ShieldCheck, badge: 'Admin' },
  { id: 'faculty-upload', label: 'Upload Exam Paper', icon: Upload, badge: 'Faculty' },
  { id: 'faculty-score', label: 'Score Students', icon: FileText, badge: 'Grading' },
  { id: 'faculty-exams', label: 'Uploaded Exam Papers', icon: Layers },
  { id: 'study-order', label: 'Study Order Engine', icon: Target, badge: 'AI' },
  { id: 'resources', label: 'Resource Management', icon: BookOpen },
  { id: 'analytics', label: 'Student Performance Metrics', icon: BarChart3 },
  { id: 'quiz', label: 'Quiz Repository', icon: Award },
  { id: 'doubts', label: 'Test AI Doubt Solver', icon: MessageSquare, badge: '6 Modes' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('doubts');
  const [pendingDoubtQuery, setPendingDoubtQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user already has an active session
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      if (stored.role === 'admin') {
        setActiveTab('admin');
      } else if (stored.role === 'faculty') {
        setActiveTab('faculty-upload');
      } else {
        setActiveTab('doubts');
      }
    }

    const handleAuthChange = () => {
      const u = getStoredUser();
      setUser(u);
      if (u?.role === 'admin') {
        setActiveTab('admin');
      } else if (u?.role === 'faculty') {
        setActiveTab('faculty-upload');
      }
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setActiveTab('admin');
    } else if (userData.role === 'faculty') {
      setActiveTab('faculty-upload');
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

  const currentTabs = user.role === 'admin' ? ADMIN_TABS : user.role === 'faculty' ? FACULTY_TABS : STUDENT_TABS;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Universal Top Navigation Bar */}
      <Navbar 
        user={user}
        setUser={setUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Workspace with Role-Specific Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Role-Specific Sidebar (Student / Faculty / Admin) */}
        <Sidebar 
          user={user}
          tabs={currentTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Dynamic Dashboard Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'doubts' && (
              <DoubtSolver 
                user={user} 
                onRequireAuth={() => setAuthModalOpen(true)}
                initialQuery={pendingDoubtQuery}
                onClearInitialQuery={() => setPendingDoubtQuery('')}
              />
            )}
            {activeTab === 'study-order' && (
              <PersonalisedStudyOrder 
                user={user} 
                onRequireAuth={() => setAuthModalOpen(true)}
                onNavigateToDoubtSolver={(promptText) => {
                  setPendingDoubtQuery(promptText);
                  setActiveTab('doubts');
                }}
              />
            )}
            {(activeTab === 'faculty-upload' || activeTab === 'faculty-score' || activeTab === 'faculty-exams' || activeTab === 'exams') && (
              <FacultyExamPortal 
                user={user} 
                activeSubTab={
                  activeTab === 'faculty-score' ? 'record-marks' : 
                  activeTab === 'faculty-exams' ? 'exam-list' : 
                  'upload-paper'
                }
                onNavigateTab={(tabKey) => {
                  if (tabKey === 'upload-paper' || tabKey === 'faculty-upload') setActiveTab('faculty-upload');
                  else if (tabKey === 'record-marks' || tabKey === 'faculty-score') setActiveTab('faculty-score');
                  else if (tabKey === 'exam-list' || tabKey === 'faculty-exams') setActiveTab('faculty-exams');
                  else setActiveTab(tabKey);
                }}
              />
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
            {activeTab === 'profile' && (
              <StudentProfile 
                user={user} 
                onRequireAuth={() => setAuthModalOpen(true)}
                onUpdateUser={(updated) => setUser(updated)}
              />
            )}
            {activeTab === 'admin' && (
              <AdminPanel user={user} />
            )}
          </main>

          {/* Footer */}
          <footer className="glass-panel border-t border-slate-200/90 py-5 text-center text-xs text-slate-600 bg-white/70 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold text-slate-700">
                  AI Doubt Solving Platform
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Intelligent Academic Assistant • Built with React & Django
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleLoginSuccess}
      />

    </div>
  );
}
