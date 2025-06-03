import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes with clsx conditions
 * @param inputs - Class values or conditions
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
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

/**
 * Sets the theme in local storage
 * @param theme - Theme to set ('dark' or 'light')
 */
export function setTheme(theme: string): void {
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Gets the current theme from local storage or system preference
 * @returns Current theme ('dark' or 'light')
 */
export function getTheme(): string {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  // Use system preference as fallback
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Initializes the theme on application startup
 */
export function initializeTheme(): void {
  const theme = getTheme();
  setTheme(theme);
}

/**
 * Checks if the application is running as a PWA (installed on homescreen)
 * @returns {boolean} True if running as PWA
 */
export function isRunningAsPWA(): boolean {
  // Check if the app is running in standalone mode or as a PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for iOS standalone mode (safely)
  const isFromHomeScreen = 'standalone' in window.navigator && (window.navigator as Navigator).standalone === true;
  
  return isStandalone || isFromHomeScreen;
}
