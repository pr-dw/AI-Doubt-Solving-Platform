import React from 'react';
import { LogOut, ChevronRight, Menu, Pin, X } from 'lucide-react';

export default function Sidebar({ 
  user, 
  tabs, 
  activeTab, 
  setActiveTab, 
  onLogout,
  isOpen,
  setIsOpen,
  pinnedChats = [],
  onSelectPinnedChat,
  onUnpinChat,
  activeConversationId
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
        {/* Top Header: 3-bar Sidebar Toggle (Open/Close) */}
        <div className="p-3 border-b border-slate-100 flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2.5 ${!isOpen ? 'mx-auto' : ''}`}
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="h-5 w-5 text-slate-800" />
            {isOpen && (
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                Menu
              </span>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 no-scrollbar">
          {isOpen && (
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                {style.label}
              </span>
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

          {/* Pinned Chats Section (Students Only) */}
          {user.role === 'student' && (
            <div className="pt-3 mt-2 border-t border-slate-100">
            {isOpen ? (
              <div>
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                    <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span>Pinned Chats</span>
                  </div>
                  {pinnedChats.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      {pinnedChats.length}
                    </span>
                  )}
                </div>

                {pinnedChats.length === 0 ? (
                  <div className="px-2 py-2.5 text-[11px] text-slate-400 italic rounded-lg bg-slate-50/50 border border-dashed border-slate-200/80 text-center">
                    No pinned chats yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {pinnedChats.map((chat) => {
                      const isSelected = activeTab === 'doubts' && activeConversationId === chat.id;
                      return (
                        <div
                          key={chat.id}
                          className={`group/pin relative flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-50/90 border-amber-300 text-amber-900 font-semibold shadow-xs'
                              : 'bg-white/80 hover:bg-amber-50/50 border-slate-200/70 hover:border-amber-200 text-slate-700'
                          }`}
                          onClick={() => {
                            if (onSelectPinnedChat) onSelectPinnedChat(chat);
                            if (window.innerWidth < 1024) setIsOpen(false);
                          }}
                          title={chat.title || 'Untitled Doubt'}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                            <Pin className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber-600 fill-amber-600' : 'text-amber-500 fill-amber-500'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-slate-800 leading-tight">
                                {chat.title || 'Untitled Doubt'}
                              </p>
                              {chat.subject_code && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {chat.subject_code}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Unpin action button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUnpinChat) onUnpinChat(chat.id);
                            }}
                            className="opacity-0 group-hover/pin:opacity-100 p-1 rounded-md hover:bg-amber-200/60 text-slate-400 hover:text-amber-800 transition-all shrink-0"
                            title="Unpin chat"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              pinnedChats.length > 0 && (
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <div className="w-5 h-0.5 bg-amber-200 rounded-full my-0.5" />
                  {pinnedChats.map((chat) => {
                    const isSelected = activeTab === 'doubts' && activeConversationId === chat.id;
                    return (
                      <button
                        key={chat.id}
                        type="button"
                        onClick={() => {
                          if (onSelectPinnedChat) onSelectPinnedChat(chat);
                        }}
                        className={`relative group flex items-center justify-center h-9 w-9 rounded-xl transition-all border ${
                          isSelected
                            ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-xs'
                            : 'bg-white hover:bg-amber-50 text-amber-600 border-slate-200'
                        }`}
                        title={chat.title}
                      >
                        <Pin className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                          <span className="font-semibold text-amber-300">Pinned:</span>
                          <span>{chat.title || 'Untitled Doubt'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>
          )}
        </nav>

        {/* User Card & Sign Out Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          {isOpen ? (
            <div className="space-y-2">
              <div 
                onClick={() => {
                  setActiveTab('profile');
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer border ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-100/90 border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
                title={user.role === 'faculty' ? 'View Faculty Profile & Settings' : user.role === 'admin' ? 'View Admin Profile & Settings' : 'View Student Profile & Settings'}
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0" 
                  />
                ) : (
                  <div className={`h-8 w-8 rounded-lg ${
                    user.role === 'faculty' 
                      ? 'bg-linear-to-tr from-emerald-600 to-teal-600' 
                      : user.role === 'admin'
                      ? 'bg-linear-to-tr from-purple-600 to-indigo-600'
                      : 'bg-linear-to-tr from-indigo-600 to-purple-600'
                  } flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs`}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="truncate flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {user.email}
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
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
              <div 
                onClick={() => {
                  setActiveTab('profile');
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`cursor-pointer transition-transform hover:scale-105 ${
                  activeTab === 'profile' ? 'ring-2 ring-indigo-500 rounded-lg' : ''
                }`}
                title={user.role === 'faculty' ? 'View Faculty Profile & Settings' : user.role === 'admin' ? 'View Admin Profile & Settings' : 'View Student Profile & Settings'}
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="h-8 w-8 rounded-lg object-cover border border-slate-200" 
                  />
                ) : (
                  <div className={`h-8 w-8 rounded-lg ${
                    user.role === 'faculty' 
                      ? 'bg-linear-to-tr from-emerald-600 to-teal-600' 
                      : user.role === 'admin'
                      ? 'bg-linear-to-tr from-purple-600 to-indigo-600'
                      : 'bg-linear-to-tr from-indigo-600 to-purple-600'
                  } flex items-center justify-center font-bold text-xs text-white shadow-2xs`}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>

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
