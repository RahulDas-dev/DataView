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
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  // Update settings function
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      
      console.log('Updated settings:', updatedSettings);
      localStorage.setItem('dataview_settings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  }, []);

  // Reset settings function
  const resetSettings = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    setSettings(defaultSettings);
    localStorage.removeItem('dataview_settings');
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;