// Theme management utility with persistent localStorage support

export const THEMES = [
  {
    id: 'light',
    name: 'Daylight Light',
    shortName: 'Light',
    desc: 'Crisp academic daylight mode with soft slate surfaces',
    dotColor: '#6366f1',
    bgPreview: '#ffffff',
    borderPreview: '#cbd5e1'
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    shortName: 'Dark',
    desc: 'Deep charcoal dark mode with high contrast legibility',
    dotColor: '#818cf8',
    bgPreview: '#0f172a',
    borderPreview: '#334155'
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    shortName: 'Sunset',
    desc: 'Warm espresso dark mode with glowing honey & amber tones',
    dotColor: '#f59e0b',
    bgPreview: '#17110b',
    borderPreview: '#78350f'
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    shortName: 'Emerald',
    desc: 'Organic dark emerald & calming mint accents',
    dotColor: '#34d399',
    bgPreview: '#061814',
    borderPreview: '#065f46'
  }
];

const THEME_STORAGE_KEY = 'ai_platform_theme';

export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'midnight') {
      return 'sunset';
    }
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read theme from localStorage', e);
  }
  return 'light';
}

export function setStoredTheme(themeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {
    console.error('Failed to persist theme to localStorage', e);
  }

  applyThemeToDOM(themeId);
  window.dispatchEvent(new CustomEvent('app-theme-change', { detail: themeId }));
}

export function applyThemeToDOM(themeId) {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
  
  if (themeId !== 'light') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initTheme() {
  const initialTheme = getStoredTheme();
  applyThemeToDOM(initialTheme);
  return initialTheme;
}
