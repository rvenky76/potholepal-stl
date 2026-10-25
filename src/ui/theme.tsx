import React, { createContext, useContext, useMemo } from 'react';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  warn: string;
  danger: string;
  ok: string;
}

export const darkColors: Palette = {
  bg: '#15202B',
  surface: '#1E2C3A',
  surfaceAlt: '#263749',
  text: '#F1F6FB',
  textMuted: '#9BB0C4',
  accent: '#F2A33C',
  border: '#31465A',
  warn: '#F2C94C',
  danger: '#EB5757',
  ok: '#27AE60',
};

export const lightColors: Palette = {
  bg: '#F4F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#E9EFF4',
  text: '#17222C',
  textMuted: '#55697B',
  accent: '#D98324',
  border: '#D4DEE7',
  warn: '#C99A00',
  danger: '#D1283A',
  ok: '#1FA85C',
};

export const colors: Palette = darkColors;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 8, md: 12, lg: 18 } as const;

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  colors: Palette;
  mode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  resolvedMode,
}: {
  children: React.ReactNode;
  resolvedMode: 'dark' | 'light';
}) {
  const value = useMemo<ThemeContextValue>(
    () => ({ colors: resolvedMode === 'light' ? lightColors : darkColors, mode: resolvedMode }),
    [resolvedMode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? { colors: darkColors, mode: 'dark' };
}
