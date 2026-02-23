import React, { useState, useEffect, useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeModeContext } from './contexts/ThemeContext';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import { lightTheme, darkTheme } from './assets/theme';

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

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
  const location = useLocation();

  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDarkMode ? '#012A4A' : '#00B4D8');
  }, [isDarkMode]);

  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <ThemeModeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {isAuthPage ? (
            <AppRouter />
          ) : (
            <MainLayout direction="ltr">
              <EmailVerificationBanner />
              <AppRouter />
            </MainLayout>
          )}
        </AuthProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default App;
