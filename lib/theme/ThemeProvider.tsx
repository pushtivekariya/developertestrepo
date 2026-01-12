'use client';

/**
 * Theme Provider Component
 * Phase 7: Dynamic Theming System
 * 
 * Injects CSS custom properties into the document root.
 * Theme is fetched server-side and passed as prop.
 */

import { useEffect } from 'react';
import type { ThemeSettings } from '@/lib/types/theme';
import { themeToCssVars } from './index';

interface ThemeProviderProps {
  theme: ThemeSettings;
  children: React.ReactNode;
}

/**
 * ThemeProvider injects CSS custom properties for dynamic theming
 * 
 * Usage in app/layout.tsx:
 * ```tsx
 * const theme = await getThemeSettings();
 * return (
 *   <ThemeProvider theme={theme}>
 *     {children}
 *   </ThemeProvider>
 * );
 * ```
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = themeToCssVars(theme);
    
    // Apply all CSS custom properties
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Cleanup on unmount (restore to initial state)
    return () => {
      Object.keys(cssVars).forEach((property) => {
        root.style.removeProperty(property);
      });
    };
  }, [theme]);

  return <>{children}</>;
}

/**
 * Server-side style tag for initial render
 * Prevents flash of unstyled content (FOUC)
 * 
 * Usage in app/layout.tsx:
 * ```tsx
 * <head>
 *   <ThemeStyleTag theme={theme} />
 * </head>
 * ```
 */
export function ThemeStyleTag({ theme }: { theme: ThemeSettings }) {
  const cssVars = themeToCssVars(theme);
  const cssString = Object.entries(cssVars)
    .map(([prop, value]) => `${prop}: ${value};`)
    .join('\n  ');
  
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root {\n  ${cssString}\n}`,
      }}
    />
  );
}
