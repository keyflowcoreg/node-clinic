import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AuthProvider} from './context/AuthContext';
import {ToastProvider} from './context/ToastContext';
import {ErrorBoundary} from './components/ErrorBoundary';
import {ToastContainer} from './components/admin/Toast';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);
