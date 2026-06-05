'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// ─── Types ──────────────────────────────────────────────────────────

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────

const STORAGE_KEY = 'ecomovilidad-theme';

/** Tile layers para Leaflet según el tema */
export const TILE_LAYERS: Record<Theme, { url: string; attribution: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
};

// ─── Context ────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeState | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════
// THEME PROVIDER
// Persiste la preferencia en localStorage y aplica data-theme en <html>
// ═══════════════════════════════════════════════════════════════════

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Estado inicial: leer de localStorage (solo en cliente)
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // ── Al montar: leer preferencia guardada ──────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  // ── Sincronizar data-theme en <html> ──────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  // ── Toggle ────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useTheme(): ThemeState {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de un <ThemeProvider>');
  }
  return context;
}
