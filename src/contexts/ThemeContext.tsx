import React, { createContext, useContext, ReactNode } from 'react';

export interface ThemeModeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export function useThemeMode(): ThemeModeContextType {
  const ctx = useContext(ThemeModeContext);
  if (ctx === undefined) {
    throw new Error('useThemeMode must be used within a ThemeModeContext.Provider');
  }
  return ctx;
}
