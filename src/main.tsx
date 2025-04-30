import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ThemeProvider  from './context/ThemeContext.tsx'
import SettingsProvider  from './context/SettingsContext.tsx'
import DataProvider  from './context/DataContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
        <SettingsProvider>
          <DataProvider>
            <App />        
          </DataProvider>
        </SettingsProvider>
    </ThemeProvider>
  </StrictMode>,
)
