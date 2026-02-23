import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { ThemeModeContext } from '../contexts/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isDarkMode } = React.useContext(ThemeModeContext);

  return (
    <Box
      className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-background-main-dark' : 'bg-background'}`}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        bgcolor: 'background.default',
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;
