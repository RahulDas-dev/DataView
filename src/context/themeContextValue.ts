import { createContext } from 'react';

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

// Provide default values to avoid undefined context
export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

// Apply initial theme before React hydration
export const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;

  // Apply theme immediately
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return isDark;
};
