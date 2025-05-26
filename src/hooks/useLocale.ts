import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate, formatTime } from '@/lib/i18n';

export const useLocale = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return {
    locale,
    formatCurrency: (amount: number) => formatCurrency(amount, locale),
    formatDate: (date: Date | string, format?: 'short' | 'long') => 
      formatDate(date, locale, format),
    formatTime: (date: Date | string) => formatTime(date, locale),
  };
}; 
 
 
 
 