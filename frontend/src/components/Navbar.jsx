import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Bell, Search,
  CheckCircle, BookOpen, Menu, Sparkles, Bot, Cpu, Check, ShieldCheck 
} from 'lucide-react';
import { api, clearAuthToken, getStoredAIModel, setStoredAIModel, AI_MODELS } from '../services/api';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ user, setUser, onOpenAuth, activeTab, setActiveTab, onToggleSidebar, onGoToLanding }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAIModel, setSelectedAIModel] = useState(() => getStoredAIModel());

  useEffect(() => {
    const handleModelChange = (e) => {
      if (e.detail) {
        setSelectedAIModel(e.detail);
      }
    };
    window.addEventListener('ai-model-change', handleModelChange);
    return () => window.removeEventListener('ai-model-change', handleModelChange);
  }, []);

  const handleModelSelect = (e) => {
    const val = e.target.value;
    setSelectedAIModel(val);
    setStoredAIModel(val);
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      setIsSearching(true);
      try {
        const res = await api.globalSearch(q);
        setSearchResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults(null);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/90 bg-white/85 backdrop-blur-md shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo + Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={onGoToLanding || (() => setActiveTab('doubts'))}
            title="Go to Landing Page"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-1 ring-slate-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 transition-colors">
                  AI Doubt Solving Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                {user?.role === 'faculty' 
                  ? 'Faculty Examination & Evaluation Portal' 
                  : user?.role === 'admin' 
                  ? 'Administrator Management & Control Console' 
                  : 'Intelligent Academic Assistant • Student Learning Workspace'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                user?.role === 'faculty' 
                  ? "Search department courses, syllabus, past papers..." 
                  : user?.role === 'admin' 
                  ? "Search platform subjects, telemetry, resources..." 
                  : "Search doubts, notes, solved PYQs, topics..."
              }
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-1.5 text-xs rounded-full bg-slate-100/90 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all focus:bg-white"
            />
          </div>

          {/* Search Dropdown */}
          {searchResults && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-panel rounded-xl p-3 shadow-2xl z-50 border border-slate-200 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2 px-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>Search Results</span>
                <button onClick={() => setSearchResults(null)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              {searchResults.subjects?.length > 0 && (
                <div className="mb-3">
                  <div className="text-[11px] text-indigo-600 font-bold mb-1">Subjects</div>
                  {searchResults.subjects.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => { 
                        setActiveTab(user?.role === 'faculty' ? 'faculty-exams' : 'doubts'); 
                        setSearchResults(null); 
                      }}
                      className="px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-xs flex justify-between"
                    >
                      <span className="font-medium text-slate-800">{s.name}</span>
                      <span className="text-slate-500">{s.code}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.resources?.length > 0 && (
                <div className="mb-3">
                  <div className="text-[11px] text-purple-600 font-bold mb-1">Study Resources & Notes</div>
                  {searchResults.resources.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => { setActiveTab('resources'); setSearchResults(null); }}
                      className="px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-xs"
                    >
                      <div className="font-medium text-slate-800 truncate">{r.title}</div>
                      <div className="text-[10px] text-slate-500">{r.subject_code} • {r.resource_type}</div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.quizzes?.length > 0 && user?.role !== 'faculty' && (
                <div>
                  <div className="text-[11px] text-emerald-600 font-bold mb-1">Practice Quizzes</div>
                  {searchResults.quizzes.map(q => (
                    <div 
                      key={q.id} 
                      onClick={() => { setActiveTab('quiz'); setSearchResults(null); }}
                      className="px-2 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-xs flex justify-between"
                    >
                      <span className="font-medium text-slate-800">{q.title}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{q.difficulty}</span>
                    </div>
                  ))}
                </div>
              )}

              {!searchResults.subjects?.length && !searchResults.resources?.length && (!searchResults.quizzes?.length || user?.role === 'faculty') && (
                <p className="text-xs text-slate-500 text-center py-4">No matching results found.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Role Portal, AI Model Selector, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Student Portal Badge - Shown for student */}
          {user && user.role === 'student' && (
            <div 
              title="Student Portal"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs select-none"
            >
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold">Student Portal</span>
            </div>
          )}

          {/* Faculty Badge - Shown for faculty */}
          {user && user.role === 'faculty' && (
            <div 
              title="Official Faculty Examination & Evaluation Portal"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 shadow-xs select-none"
            >
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold">Faculty Portal</span>
            </div>
          )}

          {/* Admin Badge - Shown for admin */}
          {user && user.role === 'admin' && (
            <div 
              title="Central Administrator Portal"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-300 text-purple-700 shadow-xs select-none"
            >
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-bold">Admin Portal</span>
            </div>
          )}

          {/* Universal AI Model Selector */}
          <div 
            title="Selected AI Model"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/90 text-slate-700 transition-all shadow-2xs"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="AI Ready" />
            <select
              id="universal-ai-model-selector"
              value={selectedAIModel}
              onChange={handleModelSelect}
              className="bg-transparent text-xs font-medium text-slate-800 pr-1 cursor-pointer focus:outline-none max-w-[120px] sm:max-w-[180px] truncate"
            >
              {AI_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="text-slate-800 bg-white py-1">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Selector Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-slate-200 bg-white/95 backdrop-blur-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">Academic Alerts</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
                        title="Mark all notifications as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Mark all as read</span>
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No notifications right now.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`py-3 px-2 rounded-lg transition-colors ${n.is_read ? 'opacity-60' : 'bg-indigo-50/40'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-800">{n.title}</h4>
                            {!n.is_read && (
                              <button 
                                onClick={() => handleMarkRead(n.id)}
                                title="Mark as read"
                                className="text-[10px] text-indigo-600 font-semibold hover:text-indigo-800"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
