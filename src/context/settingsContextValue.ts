import { createContext } from 'react';

// Define the shape of our settings
export interface Settings {
  rowsPerPage: number;
  maxColsToShow: number;
  columnsWidth: number;
  columnsSpererator: string;
  allowedFileExtensions: string[];
}

// Get default settings from environment variables with fallbacks
export const getDefaultSettings = (): Settings => {
  // Ensure environment variables are treated as strings before parsing
  const rowsPerPageEnv = import.meta.env.VITE_ROWS_PER_PAGE || '10';
  const maxColsToShowEnv = import.meta.env.VITE_MAX_COLS_TO_SHOW || '8';
  const columnsWidthEnv = import.meta.env.VITE_COLUMNS_WIDTH || '150';
  const columnsSpereratorEnv = import.meta.env.VITE_COLUMNS_SPERERATOR || ',';
  const allowedFileExtensionsEnv =
    import.meta.env.VITE_ALLOWED_FILE_EXTENSIONS || 'csv,tsv,xls,xlsx,json';

  return {
    rowsPerPage: parseInt(rowsPerPageEnv, 10),
    maxColsToShow: parseInt(maxColsToShowEnv, 10),
    columnsWidth: parseInt(columnsWidthEnv, 150),
    columnsSpererator: columnsSpereratorEnv,
    allowedFileExtensions: allowedFileExtensionsEnv.split(',').map((ext) => ext.trim()),
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
