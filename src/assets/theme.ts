// theme.ts
import { createTheme, Theme } from '@mui/material/styles';

/** Supported locale codes. Add new RTL languages here and in getDirection/getFontFamily. */
export const SUPPORTED_LOCALES = ['en', 'fa'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isRtl(locale: string): boolean {
  return locale === 'fa';
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

/** Standard Farsi/Persian font (RTL). */
const FARSI_FONT_FAMILY = '"Vazirmatn", "Roboto", "Helvetica", "Arial", sans-serif';

export function getFontFamily(locale: string): string | undefined {
  return locale === 'fa' ? FARSI_FONT_FAMILY : undefined;
}

export function createAppTheme(base: Theme, locale: string): Theme {
  const direction = getDirection(locale);
  const fontFamily = getFontFamily(locale);
  return createTheme({
    ...base,
    direction,
    typography: fontFamily
      ? { ...base.typography, fontFamily }
      : base.typography,
  });
}

const alertSnackbarOverrides = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.06)'
            : '0 4px 12px -2px rgba(0, 0, 0, 0.3), 0 2px 6px -2px rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        padding: '12px 16px',
        alignItems: 'center',
        border: '1px solid',
        borderColor:
          theme.palette.mode === 'light'
            ? 'rgba(0, 0, 0, 0.08)'
            : 'rgba(255, 255, 255, 0.12)',
        '& .MuiAlert-icon': {
          alignItems: 'center',
        },
      }),
      standardError: ({ theme }) => ({
        borderLeft: `4px solid ${theme.palette.error.main}`,
        borderRight: 'none',
        ...(theme.direction === 'rtl' && {
          borderLeft: 'none',
          borderRight: `4px solid ${theme.palette.error.main}`,
        }),
      }),
      standardWarning: ({ theme }) => ({
        borderLeft: `4px solid ${theme.palette.warning?.main ?? '#ed6c02'}`,
        borderRight: 'none',
        ...(theme.direction === 'rtl' && {
          borderLeft: 'none',
          borderRight: `4px solid ${theme.palette.warning?.main ?? '#ed6c02'}`,
        }),
      }),
      standardInfo: ({ theme }) => ({
        borderLeft: `4px solid ${theme.palette.info?.main ?? theme.palette.primary.main}`,
        borderRight: 'none',
        ...(theme.direction === 'rtl' && {
          borderLeft: 'none',
          borderRight: `4px solid ${theme.palette.info?.main ?? theme.palette.primary.main}`,
        }),
      }),
      standardSuccess: ({ theme }) => ({
        borderLeft: `4px solid ${theme.palette.success?.main ?? '#2e7d32'}`,
        borderRight: 'none',
        ...(theme.direction === 'rtl' && {
          borderLeft: 'none',
          borderRight: `4px solid ${theme.palette.success?.main ?? '#2e7d32'}`,
        }),
      }),
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& > *': {
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1)'
              : '0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.25)',
        },
      }),
    },
  },
};

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
  components: {
    ...alertSnackbarOverrides,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#a6d6ff',
    },
    background: {
      default: '#012A4A',
    },
  },
  components: {
    ...alertSnackbarOverrides,
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiFab: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
          },
        }),
      },
    },
  },
});
    