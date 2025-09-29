import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 rounded-full"
    >
      {!mounted ? (
        <span className="block h-4 w-4 rounded-full bg-slate-400" />
      ) : theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 6.07-1.42-1.42M8.35 8.35 6.93 6.93m0 10.14 1.42-1.42m8.3-8.3 1.42-1.42" />
        </svg>
      )}
    </Button>
  );
}
