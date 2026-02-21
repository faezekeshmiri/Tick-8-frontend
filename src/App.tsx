import React, { createContext, useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import { lightTheme, darkTheme } from './assets/theme';

export const ThemeModeContext = createContext<{ isDarkMode: boolean; toggleTheme: () => void }>({
  isDarkMode: false,
  toggleTheme: () => {},
});

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const location = useLocation();

  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeModeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
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
