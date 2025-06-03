import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Language configurations
export const languages = {
  en: { nativeName: 'English' },
  es: { nativeName: 'Español' },
  fr: { nativeName: 'Français' },
  pt: { nativeName: 'Português' },
  zh: { nativeName: '中文' }
};

i18n
  // Load translations using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: false,
    supportedLngs: Object.keys(languages),

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    ns: ['common', 'navigation', 'clients', 'jobs', 'invoices', 'team', 'dashboard', 'calendar', 'auth'],
    defaultNS: 'common',

    react: {
      useSuspense: false, // We'll handle loading states ourselves
    },
  });

export default i18n;

// Helper function to format currency based on locale
export const formatCurrency = (amount: number, locale: string) => {
  const currencyMap: { [key: string]: string } = {
    en: 'USD',
    es: 'USD',
    pt: 'BRL',
    fr: 'EUR',
    zh: 'CNY'
  };

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMap[locale] || 'USD',
  }).format(amount);
};

// Helper function to format dates based on locale
export const formatDate = (date: Date | string, locale: string, format: 'short' | 'long' = 'short') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return new Intl.DateTimeFormat(locale).format(dateObj);
  }
  
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

// Helper function to format time based on locale
export const formatTime = (date: Date | string, locale: string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: locale === 'en' || locale === 'es'
  }).format(dateObj);
}; 
 
 
 
 