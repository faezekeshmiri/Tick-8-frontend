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
    components: {
      ...base.components,
    },
  });
}

const alertSnackbarOverrides = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
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
      standardError: ({ theme }: { theme: Theme }) => ({
        borderLeft: `4px solid ${theme.palette.error.main}`,
        borderRight: 'none',
      }),
      standardWarning: ({ theme }: { theme: Theme }) => ({
        borderLeft: `4px solid ${theme.palette.warning?.main ?? '#ed6c02'}`,
        borderRight: 'none',
      }),
      standardInfo: ({ theme }: { theme: Theme }) => ({
        borderLeft: `4px solid ${theme.palette.info?.main ?? theme.palette.primary.main}`,
        borderRight: 'none',
      }),
      standardSuccess: ({ theme }: { theme: Theme }) => ({
        borderLeft: `4px solid ${theme.palette.success?.main ?? '#2e7d32'}`,
        borderRight: 'none',
      }),
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
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
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0284c7',
      contrastText: '#011627',
    },
    secondary: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#059669',
      contrastText: '#011627',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#dc2626',
    },
    warning: {
      main: '#fbbf24',
      light: '#fde68a',
      dark: '#d97706',
    },
    info: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#2563eb',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#059669',
    },
    background: {
      default: '#011627',
      paper: '#012A4A',
    },
    text: {
      primary: '#e0f2fe',
      secondary: '#7eb8d8',
    },
    divider: 'rgba(56, 189, 248, 0.12)',
    action: {
      hover: 'rgba(56, 189, 248, 0.08)',
      selected: 'rgba(56, 189, 248, 0.14)',
      focus: 'rgba(56, 189, 248, 0.14)',
    },
  },
  components: {
    ...alertSnackbarOverrides,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#1e3a5f #011627',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-track': { background: '#011627' },
          '&::-webkit-scrollbar-thumb': {
            background: '#1e3a5f',
            borderRadius: 4,
            '&:hover': { background: '#2a4f73' },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#012A4A',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#012A4A',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(56, 189, 248, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.35)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(56, 189, 248, 0.4)',
          '&:hover': {
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(56, 189, 248, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(56, 189, 248, 0.4)',
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#38bdf8',
          color: '#011627',
          boxShadow: '0 6px 20px rgba(56, 189, 248, 0.3)',
          '&:hover': {
            backgroundColor: '#7dd3fc',
            boxShadow: '0 8px 28px rgba(56, 189, 248, 0.4)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          border: '1px solid rgba(56, 189, 248, 0.1)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          border: '1px solid rgba(56, 189, 248, 0.1)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(56, 189, 248, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(56, 189, 248, 0.25)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#01334e',
          border: '1px solid rgba(56, 189, 248, 0.15)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
        },
      },
    },
  },
});
    