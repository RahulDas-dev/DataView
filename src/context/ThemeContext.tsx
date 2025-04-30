import { useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { getInitialTheme, ThemeContext } from './themeContextValue';

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // Force theme application whenever isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prevDark) => {
      const newDark = !prevDark;
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      return newDark;
    });
  }, []);

  // Re-apply theme when isDark changes (in case of system preference change)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        setIsDark(mediaQuery.matches);
      }
    };

    // Use modern event listener approach to avoid memory leaks
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    isDark, 
    toggleTheme 
  }), [isDark, toggleTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
