import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Download data as JSON file
export function downloadAsJSON(data: any, filename: string = 'data') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Theme management
export const themes = {
  light: 'light',
  dark: 'dark',
  system: 'system'
} as const;

export type Theme = keyof typeof themes;

// Get system theme preference
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme to document
function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Also update the meta theme-color for better mobile experience
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = theme === 'dark' ? '#1f2937' : '#ffffff';
    document.head.appendChild(meta);
  }
}

export function setTheme(theme: Theme) {
  try {
    if (theme === 'system') {
      localStorage.removeItem('theme');
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (getTheme() === 'system') {
          applyTheme(getSystemTheme());
        }
      };
      
      // Remove existing listener if any
      mediaQuery.removeEventListener('change', handleChange);
      mediaQuery.addEventListener('change', handleChange);
    } else {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
    
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  } catch (error) {
    console.error('Error setting theme:', error);
  }
}

export function getTheme(): Theme {
  try {
    if (typeof window === 'undefined') return 'system';
    
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && stored in themes) return stored;
    return 'system';
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'system';
  }
}

// Initialize theme on first load
export function initializeTheme() {
  const theme = getTheme();
  setTheme(theme);
}
