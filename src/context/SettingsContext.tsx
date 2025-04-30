import { useCallback, useEffect, useState, ReactNode } from 'react';
import { SettingsContext, Settings, getDefaultSettings } from './settingsContextValue';

interface SettingsProviderProps {
  children: ReactNode;
}

const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(getDefaultSettings());

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('dataview_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));
        
        // Update session storage for environment variables
        if (parsedSettings.rowsPerPage) {
          window.sessionStorage.setItem('VITE_ROWS_PER_PAGE', parsedSettings.rowsPerPage.toString());
        }
        if (parsedSettings.maxColsToShow) {
          window.sessionStorage.setItem('VITE_MAX_COLS_TO_SHOW', parsedSettings.maxColsToShow.toString());
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  // Update settings function
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      
      // Save to localStorage
      localStorage.setItem('dataview_settings', JSON.stringify(updatedSettings));
      
      // Update environment variables
      if (newSettings.rowsPerPage) {
        window.sessionStorage.setItem('VITE_ROWS_PER_PAGE', newSettings.rowsPerPage.toString());
      }
      if (newSettings.maxColsToShow) {
        window.sessionStorage.setItem('VITE_MAX_COLS_TO_SHOW', newSettings.maxColsToShow.toString());
      }
      
      return updatedSettings;
    });
  }, []);

  // Reset settings function
  const resetSettings = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    setSettings(defaultSettings);
    localStorage.removeItem('dataview_settings');
    window.sessionStorage.setItem('VITE_ROWS_PER_PAGE', defaultSettings.rowsPerPage.toString());
    window.sessionStorage.setItem('VITE_MAX_COLS_TO_SHOW', defaultSettings.maxColsToShow.toString());
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;