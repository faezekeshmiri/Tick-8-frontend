import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppContent from './AppContent';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeModeContext } from './contexts/ThemeContext';

const THEME_STORAGE_KEY = 'tick8-theme';

function readStoredTheme(): boolean {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'dark') return true;
    if (v === 'light') return false;
  } catch {
    // ignore
  }
  return false;
}

function writeStoredTheme(isDark: boolean): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // ignore
  }
}

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(readStoredTheme);
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      writeStoredTheme(next);
      return next;
    });
  };

  return (
    <ThemeModeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeModeContext.Provider>
  );
};

export default App;
