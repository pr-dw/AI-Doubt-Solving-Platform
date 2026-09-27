import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Flame, Bell, Search, User as UserIcon, 
  LogOut, Cpu, CheckCircle, ChevronDown, BookOpen 
} from 'lucide-react';
import { api, clearAuthToken } from '../services/api';

export default function Navbar({ user, setUser, onOpenAuth, activeTab, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('doubts')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                AI Doubt Solving
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SRMCM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Intelligent Academic Assistant • Local Ollama
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search doubts, notes, solved PYQs, topics..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-1.5 text-xs rounded-full bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {searchResults && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-panel rounded-xl p-3 shadow-2xl z-50 border border-slate-800 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-2 px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Search Results</span>
                <button onClick={() => setSearchResults(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {searchResults.subjects?.length > 0 && (
                <div className="mb-3">
                  <div className="text-[11px] text-indigo-400 font-bold mb-1">Subjects</div>
                  {searchResults.subjects.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => { setActiveTab('doubts'); setSearchResults(null); }}
                      className="px-2 py-1.5 hover:bg-slate-800/80 rounded-lg cursor-pointer text-xs flex justify-between"
                    >
                      <span className="font-medium text-slate-200">{s.name}</span>
                      <span className="text-slate-500">{s.code}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.resources?.length > 0 && (
                <div className="mb-3">
                  <div className="text-[11px] text-purple-400 font-bold mb-1">Study Resources & Notes</div>
                  {searchResults.resources.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => { setActiveTab('resources'); setSearchResults(null); }}
                      className="px-2 py-1.5 hover:bg-slate-800/80 rounded-lg cursor-pointer text-xs"
                    >
                      <div className="font-medium text-slate-200 truncate">{r.title}</div>
                      <div className="text-[10px] text-slate-400">{r.subject_code} • {r.resource_type}</div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.quizzes?.length > 0 && (
                <div>
                  <div className="text-[11px] text-emerald-400 font-bold mb-1">Practice Quizzes</div>
                  {searchResults.quizzes.map(q => (
                    <div 
                      key={q.id} 
                      onClick={() => { setActiveTab('quiz'); setSearchResults(null); }}
                      className="px-2 py-1.5 hover:bg-slate-800/80 rounded-lg cursor-pointer text-xs flex justify-between"
                    >
                      <span className="font-medium text-slate-200">{q.title}</span>
                      <span className="text-[10px] text-emerald-400">{q.difficulty}</span>
                    </div>
                  ))}
                </div>
              )}

              {!searchResults.subjects?.length && !searchResults.resources?.length && !searchResults.quizzes?.length && (
                <p className="text-xs text-slate-500 text-center py-4">No matching results found.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Streak, Ollama status, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Study Streak Badge */}
          {user && (
            <div 
              onClick={() => setActiveTab('planner')}
              title="Consecutive Daily Study Streak"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-400 cursor-pointer hover:scale-105 transition-transform"
            >
              <Flame className="h-4 w-4 text-orange-400 fill-orange-400 animate-pulse" />
              <span className="text-xs font-bold">{user.streak_count || 7}d Streak</span>
            </div>
          )}

          {/* AI Engine Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-[11px] text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Local AI Ready</span>
          </div>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 relative transition-colors"
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
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-bold text-sm text-slate-200">Academic Alerts</span>
                    <span className="text-xs text-indigo-400">{unreadCount} new</span>
                  </div>
                  <div className="divide-y divide-slate-800/50 max-h-80 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No notifications right now.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`py-3 px-2 rounded-lg transition-colors ${n.is_read ? 'opacity-60' : 'bg-slate-900/60'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-200">{n.title}</h4>
                            {!n.is_read && (
                              <button 
                                onClick={() => handleMarkRead(n.id)}
                                title="Mark as read"
                                className="text-[10px] text-indigo-400 hover:text-indigo-300"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
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

          {/* User Account / Profile Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[100px]">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-indigo-400 capitalize">
                    {user.role} • Sem {user.semester}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-2xl p-3 shadow-2xl z-50 border border-slate-800">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-slate-200">{user.name}</p>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                    <div className="mt-2 text-[10px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                      <div>Roll: <span className="text-indigo-300 font-mono">{user.roll_number || 'SRMCM/BCA/2023/042'}</span></div>
                      <div>Dept: {user.department}</div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setActiveTab('analytics'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/60 rounded-lg flex items-center gap-2"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-indigo-400" /> My Academic Performance
                    </button>
                    <button
                      onClick={() => { setActiveTab('admin'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/60 rounded-lg flex items-center gap-2"
                    >
                      <Cpu className="h-3.5 w-3.5 text-purple-400" /> System & Model Overview
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 mt-1"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
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
