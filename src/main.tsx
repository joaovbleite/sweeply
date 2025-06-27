import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './ios-fixes.css' // iOS status bar fixes
import './lib/i18n' // Initialize i18n
import { initializeTheme } from './lib/utils' // Initialize theme

// Initialize theme on app startup
initializeTheme();

// Add a div for iOS status bar
if (typeof window !== 'undefined') {
  const statusBarFix = document.createElement('div');
  statusBarFix.className = 'ios-status-bar-fix';
  document.body.prepend(statusBarFix);
}

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
