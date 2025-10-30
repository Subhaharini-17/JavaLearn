// components/theme-provider.tsx

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
// This is the line that must be changed
import { type ThemeProviderProps } from 'next-themes'; 

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}