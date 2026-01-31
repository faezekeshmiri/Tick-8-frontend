import React, { ReactNode } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

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
