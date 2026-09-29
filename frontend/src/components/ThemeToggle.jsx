import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Sparkles, Compass, Check, ChevronDown, Palette } from 'lucide-react';
import { THEMES, getStoredTheme, setStoredTheme } from '../utils/theme';

const ICONS = {
  light: Sun,
  dark: Moon,
  midnight: Sparkles,
  emerald: Compass
};

export default function ThemeToggle({ className = '', showLabel = true, dropdownAlign = 'right' }) {
  const [currentTheme, setCurrentTheme] = useState(() => getStoredTheme());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail) {
        setCurrentTheme(e.detail);
      }
    };

    window.addEventListener('app-theme-change', handleThemeChange);
    return () => window.removeEventListener('app-theme-change', handleThemeChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
  const ActiveIcon = ICONS[activeThemeObj.id] || Palette;

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    setStoredTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="theme-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Change Theme (Currently ${activeThemeObj.name})`}
        aria-label="Change Theme"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs select-none theme-toggle-btn"
      >
        <span 
          className="h-2 w-2 rounded-full shrink-0" 
          style={{ backgroundColor: activeThemeObj.dotColor }}
        />
        <ActiveIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
        {showLabel && (
          <span className="hidden md:inline font-medium">
            {activeThemeObj.shortName}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${
            dropdownAlign === 'left' ? 'left-0' : 'right-0'
          } mt-2 w-64 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 theme-dropdown-menu`}
        >
          <div className="px-2.5 py-1.5 pb-2 border-b border-slate-100 flex items-center justify-between theme-dropdown-header">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Appearance & Theme
            </span>
            <Palette className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="space-y-1 mt-1.5">
            {THEMES.map((theme) => {
              const ThemeIcon = ICONS[theme.id] || Palette;
              const isSelected = theme.id === currentTheme;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'theme-item-active font-bold shadow-xs'
                      : 'theme-item-inactive hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center border shadow-2xs shrink-0"
                      style={{
                        backgroundColor: theme.bgPreview,
                        borderColor: theme.borderPreview,
                        color: theme.dotColor
                      }}
                    >
                      <ThemeIcon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-snug">{theme.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{theme.desc}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-2">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
