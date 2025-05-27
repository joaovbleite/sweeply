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

export function setTheme(theme: Theme) {
  if (theme === 'system') {
    localStorage.removeItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', systemTheme === 'dark');
  } else {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

export function getTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme;
  if (stored && stored in themes) return stored;
  return 'system';
}
