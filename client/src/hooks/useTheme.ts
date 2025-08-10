import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'sepia' | 'black-and-white' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && ['light', 'dark', 'sepia', 'black-and-white', 'system'].includes(stored)) {
      return stored;
    }
    // Default to system preference
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'sepia' | 'black-and-white'>('light');

  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = () => {
      let newTheme: 'light' | 'dark' | 'sepia' | 'black-and-white';

      if (theme === 'system') {
        newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newTheme = theme;
      }

      setResolvedTheme(newTheme);
      root.classList.remove('light', 'dark', 'sepia', 'black-and-white');
      root.classList.add(newTheme);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Keyboard shortcut for theme toggle (Ctrl+Shift+T)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setThemeAndStore = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggle = () => {
    if (theme === 'system') {
      // If system, cycle through light, dark, sepia, black-and-white
      if (resolvedTheme === 'light') {
        setThemeAndStore('dark');
      } else if (resolvedTheme === 'dark') {
        setThemeAndStore('sepia');
      } else if (resolvedTheme === 'sepia') {
        setThemeAndStore('black-and-white');
      } else {
        setThemeAndStore('light');
      }
    } else {
      // If explicit theme, cycle through light, dark, sepia, black-and-white
      if (theme === 'light') {
        setThemeAndStore('dark');
      } else if (theme === 'dark') {
        setThemeAndStore('sepia');
      } else if (theme === 'sepia') {
        setThemeAndStore('black-and-white');
      } else {
        setThemeAndStore('light');
      }
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeAndStore,
    toggle,
  };
}
