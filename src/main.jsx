import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { GainsProvider } from './context/GainsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster 
      position="top-right" 
      toastOptions={{ 
        style: { borderRadius: '1rem', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } 
      }} 
    />
    <GainsProvider>
      <App />
    </GainsProvider>
  </StrictMode>,
)
