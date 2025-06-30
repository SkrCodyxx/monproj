import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // We'll create App.tsx next
import './index.css'; // For TailwindCSS base styles and global styles

// If using contexts that should wrap the entire app, import and add them here
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider> {/* Example: AuthProvider wraps App */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
