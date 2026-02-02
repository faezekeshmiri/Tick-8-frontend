import React, { ReactNode } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../assets/theme';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = prefersDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Box
        className={`min-h-screen flex items-center justify-center ${
          prefersDarkMode ? 'bg-background-main-dark' : 'bg-background'
        }`}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
};

export default AuthLayout;
