import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/toast-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider />
      <App />
    </ThemeProvider>
  </StrictMode>
)
