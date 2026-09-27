import React from 'react';
import { 
  LogOut, Shield, GraduationCap, User, Sparkles, 
  ChevronRight, PanelLeftClose, PanelLeft
} from 'lucide-react';

export default function Sidebar({ 
  user, 
  tabs, 
  activeTab, 
  setActiveTab, 
  onLogout,
  isOpen,
  setIsOpen
}) {
  if (!user) return null;

  const roleStyles = {
    admin: {
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      activeItem: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
      activeIcon: 'text-white',
      hoverItem: 'hover:bg-purple-50 text-slate-700 hover:text-purple-700',
      accentDot: 'bg-purple-500',
      label: 'Admin Console'
    },
    faculty: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      activeItem: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
      activeIcon: 'text-white',
      hoverItem: 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-700',
      accentDot: 'bg-emerald-500',
      label: 'Faculty Portal'
    },
    student: {
      badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      activeItem: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
      activeIcon: 'text-white',
      hoverItem: 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-700',
      accentDot: 'bg-indigo-500',
      label: 'Student Workspace'
    }
  };

  const style = roleStyles[user.role] || roleStyles.student;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? 'w-64 translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Top Header / Role Identity Banner */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2.5 overflow-hidden ${!isOpen && 'lg:justify-center lg:w-full'}`}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : user.role === 'faculty' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {user.role === 'admin' ? (
                  <Shield className="h-5 w-5" />
                ) : user.role === 'faculty' ? (
                  <GraduationCap className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>

              {isOpen && (
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {style.label}
                  </div>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase mt-0.5 ${style.badge}`}>
                    {user.role}
                  </span>
                </div>
              )}
            </div>

            {/* Collapse toggle (Desktop) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 no-scrollbar">
          {isOpen && (
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Navigation
            </div>
          )}

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                title={tab.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group relative ${
                  isActive 
                    ? style.activeItem 
                    : `text-slate-600 ${style.hoverItem}`
                } ${!isOpen ? 'lg:justify-center' : ''}`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                }`} />

                {isOpen && (
                  <span className="truncate text-left flex-1">
                    {tab.label}
                  </span>
                )}

                {/* Badge if present */}
                {isOpen && tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-black/20 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}

                {/* Tooltip for collapsed mode on hover */}
                {!isOpen && (
                  <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1 rounded">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Sign Out Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          {isOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-transparent transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
