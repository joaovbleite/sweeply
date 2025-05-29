import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/i18n' // Initialize i18n
import { initializeTheme } from './lib/utils' // Initialize theme

// Initialize theme on app startup
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
