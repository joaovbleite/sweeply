import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { profileApi } from '@/lib/api/profile';

interface UserPreferences {
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export const useLocale = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });
  const [loading, setLoading] = useState(true);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await profileApi.getProfile();
        if (profile) {
          setPreferences({
            timezone: profile.timezone || 'America/New_York',
            currency: profile.currency || 'USD',
            dateFormat: profile.date_format || 'MM/DD/YYYY',
            timeFormat: profile.time_format || '12h'
          });
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        // Keep defaults on error
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Format currency based on user preference
  const formatCurrency = (amount: number) => {
    const currencyOptions: { [key: string]: { currency: string; locale: string } } = {
      USD: { currency: 'USD', locale: 'en-US' },
      EUR: { currency: 'EUR', locale: 'en-GB' },
      GBP: { currency: 'GBP', locale: 'en-GB' },
      CAD: { currency: 'CAD', locale: 'en-CA' },
      AUD: { currency: 'AUD', locale: 'en-AU' },
      JPY: { currency: 'JPY', locale: 'ja-JP' },
      CHF: { currency: 'CHF', locale: 'de-CH' },
      SEK: { currency: 'SEK', locale: 'sv-SE' },
      NOK: { currency: 'NOK', locale: 'nb-NO' },
      DKK: { currency: 'DKK', locale: 'da-DK' }
    };

    const currencyConfig = currencyOptions[preferences.currency] || currencyOptions.USD;

    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.currency,
    }).format(amount);
  };

  // Format date based on user preference
  const formatDate = (date: Date | string, format?: 'short' | 'long') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Handle invalid dates
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    if (format === 'long') {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: preferences.timezone
      }).format(dateObj);
    }

    // Format according to user's preference
    switch (preferences.dateFormat) {
      case 'MM/DD/YYYY':
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: preferences.timezone
        }).format(dateObj);
      case 'DD/MM/YYYY':
        return new Intl.DateTimeFormat('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: preferences.timezone
        }).format(dateObj);
      case 'YYYY-MM-DD':
        return dateObj.toLocaleDateString('sv-SE', {
          timeZone: preferences.timezone
        });
      case 'DD MMM YYYY':
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: preferences.timezone
        }).format(dateObj);
      case 'MMM DD, YYYY':
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          timeZone: preferences.timezone
        }).format(dateObj);
      default:
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: preferences.timezone
        }).format(dateObj);
    }
  };

  // Format time based on user preference
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Handle invalid dates
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: preferences.timeFormat === '12h',
      timeZone: preferences.timezone
    }).format(dateObj);
  };

  // Format date and time together
  const formatDateTime = (date: Date | string) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  // Get timezone offset string
  const getTimezoneDisplay = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: preferences.timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';
    
    return `${preferences.timezone.replace('_', ' ')} (${timeZoneName})`;
  };

  return {
    locale: i18n.language,
    preferences,
    loading,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    getTimezoneDisplay,
    // Utility to refresh preferences (useful after settings update)
    refreshPreferences: async () => {
      if (user) {
        try {
          const profile = await profileApi.getProfile();
          if (profile) {
            setPreferences({
              timezone: profile.timezone || 'America/New_York',
              currency: profile.currency || 'USD',
              dateFormat: profile.date_format || 'MM/DD/YYYY',
              timeFormat: profile.time_format || '12h'
            });
          }
        } catch (error) {
          console.error('Error refreshing preferences:', error);
        }
      }
    }
  };
}; 
 
 
 
 