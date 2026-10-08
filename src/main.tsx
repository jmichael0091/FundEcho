import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { MonetizationProvider } from './context/MonetizationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MonetizationProvider>
        <App />
      </MonetizationProvider>
    </AuthProvider>
  </StrictMode>,
);


