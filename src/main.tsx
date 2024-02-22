import React from 'react'
import ReactDOM from 'react-dom/client'
import "@fontsource/nunito";
import "@fontsource/poppins";
import '@fontsource/material-icons';
import App from './App.tsx'
import './index.css'
import  "danfojs"
import DisplayModeContextProvider from './context/display_context.tsx';
import DataContextProvider from './context/data_context.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DisplayModeContextProvider>
      <DataContextProvider>
        <App />
      </DataContextProvider>  
    </DisplayModeContextProvider>
  </React.StrictMode>
)
