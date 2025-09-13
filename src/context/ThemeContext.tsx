import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'bv-theme';

function getPreferredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
  if (stored === 'light' || stored === 'dark') return stored;
  const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefers ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(getPreferredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const toggleTheme = () => setThemeState(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
