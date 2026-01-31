import React, { useState, useEffect, createContext } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import MainLayout from "./layouts/MainLayout";
import { AuthProvider } from './contexts/AuthContext';
import { lightTheme } from './assets/theme';
import { darkTheme } from './assets/theme';

export const ThemeModeContext = createContext<{ isDarkMode: boolean; toggleTheme: () => void }>({
  isDarkMode: false,
  toggleTheme: () => {},
});

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
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
              <AppRouter />
            </MainLayout>
          )}
        </AuthProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default App;
