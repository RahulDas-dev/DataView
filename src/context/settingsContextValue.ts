import { createContext } from 'react';

// Define the shape of our settings
export interface Settings {
  rowsPerPage: number;
  maxColsToShow: number;
}

// Get default settings from environment variables with fallbacks
export const getDefaultSettings = (): Settings => {
  // Ensure environment variables are treated as strings before parsing
  const rowsPerPageEnv = import.meta.env.VITE_ROWS_PER_PAGE || '10';
  const maxColsToShowEnv = import.meta.env.VITE_MAX_COLS_TO_SHOW || '';

  return {
    rowsPerPage: parseInt(rowsPerPageEnv, 10),
    maxColsToShow: parseInt(maxColsToShowEnv, 10),
  };
};

// Define the context type with settings and update functions
export interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

// Create the context with default values
export const SettingsContext = createContext<SettingsContextType>({
  settings: getDefaultSettings(),
  updateSettings: () => {},
  resetSettings: () => {},
});
