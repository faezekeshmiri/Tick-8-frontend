import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppRouter from './routes/AppRouter';
import MainLayout from "./layouts/MainLayout";
import { lightTheme } from './assets/theme';
import { darkTheme } from './assets/theme';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <button
        onClick={toggleTheme}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Toggle Theme
      </button>
      <MainLayout direction="ltr">
        <AppRouter />
      </MainLayout>
    </ThemeProvider>
  );
};

export default App;
