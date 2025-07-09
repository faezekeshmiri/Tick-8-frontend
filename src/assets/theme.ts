// theme.ts
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00B4D8',        // blue
      light: '#48CAE4',
      dark: '#0096C7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981',        // Emerald green
      light: '#6ee7b7',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    error: {
      main: '#c1121f', //#780000       // Red
    },
    background: {
      default: '#fef9ef', //#FDF0D5
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#012A4A',
    },
  },
});
    