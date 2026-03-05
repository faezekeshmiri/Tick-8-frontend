import React, { useEffect, useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppRouter from './routes/AppRouter';
import MainLayout from './layouts/MainLayout';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import { useAuth } from './contexts/AuthContext';
import { useThemeMode } from './contexts/ThemeContext';
import { lightTheme, darkTheme, createAppTheme, getDirection } from './assets/theme';

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

/**
 * Builds theme from dark mode and user's preferred language (direction + font),
 * sets document dir/lang, and renders the app. Must be inside AuthProvider and ThemeModeContext.
 */
const AppContent: React.FC = () => {
  const location = useLocation();
  const { isDarkMode } = useThemeMode();
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));
  const locale = user?.preferred_language ?? 'en';
  const direction = getDirection(locale);

  const theme = useMemo(() => {
    const base = isDarkMode ? darkTheme : lightTheme;
    return createAppTheme(base, locale);
  }, [isDarkMode, locale]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDarkMode ? '#012A4A' : '#00B4D8');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale === 'fa' ? 'fa' : 'en';
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [direction, locale, i18n]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthPage ? (
        <AppRouter />
      ) : (
        <MainLayout>
          <EmailVerificationBanner />
          <AppRouter />
        </MainLayout>
      )}
    </ThemeProvider>
  );
};

export default AppContent;
