import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import UserProvider from './context/UserProvider.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import "./i18n";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </UserProvider>
  </StrictMode>,
)
