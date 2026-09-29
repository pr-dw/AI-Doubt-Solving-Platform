import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Compass, BarChart3, Target, Award, BookOpen, ShieldCheck, LogOut, GraduationCap,
  Upload, FileText, Layers, Users, FileCheck, Database
} from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import DoubtSolver from './components/DoubtSolver';
import PersonalisedStudyOrder from './components/PersonalisedStudyOrder';
import FacultyExamPortal from './components/FacultyExamPortal';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import QuizCenter from './components/QuizCenter';
import ResourceLibrary from './components/ResourceLibrary';
import AdminPanel from './components/AdminPanel';
import StudentProfile from './components/StudentProfile';
import api, { getStoredUser, clearAuthToken } from './services/api';
import { initTheme } from './utils/theme';

// Initialize theme immediately on mount
initTheme();

const STUDENT_TABS = [
  { id: 'doubts', label: 'AI Doubt Solver', icon: MessageSquare },
  { id: 'study-order', label: 'Study Planner', icon: Compass },
  { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
  { id: 'quiz', label: 'Quiz & Exam Prep', icon: Award },
  { id: 'resources', label: 'Resource Library', icon: BookOpen },
];

const FACULTY_TABS = [
  { id: 'faculty-upload', label: 'Upload Exam Paper', icon: Upload },
  { id: 'faculty-score', label: 'Score Students', icon: FileText },
  { id: 'faculty-exams', label: 'Uploaded Exams', icon: Layers },
  { id: 'resources', label: 'Course Materials & Syllabus', icon: BookOpen },
];

const ADMIN_TABS = [
  { id: 'admin-users', label: 'User Governance', icon: Users },
  { id: 'admin-syllabus', label: 'Curriculum & Syllabus', icon: BookOpen },
  { id: 'admin-paper-format', label: 'Exam Paper Formats', icon: FileCheck },
  { id: 'admin', label: 'System Overview', icon: ShieldCheck },
  { id: 'admin-database', label: 'Database Overview', icon: Database },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('doubts');
  const [resourceSubTab, setResourceSubTab] = useState('college');
  const [pendingDoubtQuery, setPendingDoubtQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [targetConversationId, setTargetConversationId] = useState(null);
  const [viewLanding, setViewLanding] = useState(false);

  const loadPinnedChats = async () => {
    try {
      const convs = await api.getConversations();
      if (Array.isArray(convs)) {
        setPinnedChats(convs.filter((c) => c.is_bookmarked));
      }
    } catch (err) {
      console.error('Failed to load pinned chats:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadPinnedChats();
    } else {
      setPinnedChats([]);
    }

    const handlePinnedUpdate = () => {
      loadPinnedChats();
    };

    window.addEventListener('pinned-chats-update', handlePinnedUpdate);
    return () => {
      window.removeEventListener('pinned-chats-update', handlePinnedUpdate);
    };
  }, [user]);

  useEffect(() => {
    // Check if user already has an active session
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      if (stored.role === 'admin') {
        setActiveTab('admin-users');
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
        setActiveTab('admin-users');
      } else if (u?.role === 'faculty') {
        setActiveTab('faculty-upload');
      } else {
        setActiveTab('doubts');
      }
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    if (user && user.role !== 'admin' && (activeTab === 'admin' || activeTab.startsWith('admin-'))) {
      setActiveTab(user.role === 'faculty' ? 'faculty-upload' : 'doubts');
    }
  }, [user, activeTab]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setViewLanding(false);
    if (userData.role === 'admin') {
      setActiveTab('admin-users');
    } else if (userData.role === 'faculty') {
      setActiveTab('faculty-upload');
    } else {
      setActiveTab('doubts');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setViewLanding(false);
    setActiveTab('doubts');
    setTargetConversationId(null);
    setResourceSubTab('college');
  };

  const handleUnpinChat = async (convId) => {
    try {
      await api.toggleBookmark(convId);
      window.dispatchEvent(new CustomEvent('pinned-chats-update'));
      loadPinnedChats();
    } catch (err) {
      console.error('Failed to unpin chat:', err);
    }
  };

  const handleSelectPinnedChat = (chat) => {
    setActiveTab('doubts');
    setTargetConversationId(chat.id);
  };

  // If not logged in, or if user explicitly navigated to the Landing Page:
  if (!user || viewLanding) {
    return (
      <>
        <LandingPage 
          user={user}
          onLoginSuccess={handleLoginSuccess}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onGoToDashboard={() => setViewLanding(false)}
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
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Universal Top Navigation Bar */}
      <Navbar 
        user={user}
        setUser={setUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onGoToLanding={() => setViewLanding(true)}
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
          pinnedChats={pinnedChats}
          onSelectPinnedChat={handleSelectPinnedChat}
          onUnpinChat={handleUnpinChat}
          activeConversationId={targetConversationId}
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
                targetConversationId={targetConversationId}
                onClearTargetConversationId={() => setTargetConversationId(null)}
                onNavigateToPersonalLibrary={() => {
                  setResourceSubTab('personal');
                  setActiveTab('resources');
                }}
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
            {activeTab === 'quiz' && (
              <QuizCenter 
                user={user} 
                onRequireAuth={() => setAuthModalOpen(true)}
                onNavigateToPersonalLibrary={() => {
                  setResourceSubTab('personal');
                  setActiveTab('resources');
                }}
              />
            )}
            {activeTab === 'resources' && (
              <ResourceLibrary 
                user={user} 
                initialTab={resourceSubTab}
                onTabChange={(tab) => setResourceSubTab(tab)}
                onNavigateToDoubts={() => setActiveTab('doubts')}
              />
            )}
            {activeTab === 'profile' && (
              <StudentProfile 
                user={user} 
                onRequireAuth={() => setAuthModalOpen(true)}
                onUpdateUser={(updated) => setUser(updated)}
              />
            )}
            {(activeTab === 'admin' || activeTab.startsWith('admin-')) && user?.role === 'admin' && (
              <AdminPanel 
                user={user} 
                activeSubTab={
                  activeTab === 'admin-syllabus' ? 'syllabus' :
                  activeTab === 'admin-paper-format' ? 'paper-formats' :
                  activeTab === 'admin' ? 'telemetry' :
                  activeTab === 'admin-database' ? 'database' :
                  'users'
                }
                onNavigateTab={(tabKey) => {
                  if (tabKey === 'users') setActiveTab('admin-users');
                  else if (tabKey === 'syllabus') setActiveTab('admin-syllabus');
                  else if (tabKey === 'paper-formats') setActiveTab('admin-paper-format');
                  else if (tabKey === 'telemetry') setActiveTab('admin');
                  else if (tabKey === 'database') setActiveTab('admin-database');
                  else setActiveTab(tabKey);
                }}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/80 py-4 text-xs text-slate-500 bg-white/60 backdrop-blur-xs mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                <span className="font-medium text-slate-700">
                  AI Doubt Solving Platform
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-400 hidden sm:inline">Academic Learning Portal</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Continuous Learning & Doubt Resolution
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
