import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './ios-fixes.css' // iOS status bar fixes
import './lib/i18n' // Initialize i18n
import { initializeTheme } from './lib/utils' // Initialize theme

// Initialize theme on app startup
initializeTheme();

// Add a div for iOS status bar with improved implementation
if (typeof window !== 'undefined') {
  // Check if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Remove any existing status bar fix element to prevent duplicates
  const existingFix = document.querySelector('.ios-status-bar-fix');
  if (existingFix) {
    existingFix.remove();
  }
  
  // Create and add the status bar fix element
  const statusBarFix = document.createElement('div');
  statusBarFix.className = 'ios-status-bar-fix';
  document.body.prepend(statusBarFix);
  
  // Force white background color on html and body for iOS
  if (isIOS) {
    document.documentElement.style.backgroundColor = '#FFFFFF';
    document.body.style.backgroundColor = '#FFFFFF';
    
    // Add meta tag for iOS status bar if not already present
    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
      const metaTag = document.createElement('meta');
      metaTag.name = 'apple-mobile-web-app-status-bar-style';
      metaTag.content = 'default'; // 'default' ensures white status bar
      document.head.appendChild(metaTag);
    }
  }
}

createRoot(document.getElementById("root")!).render(<App />);
