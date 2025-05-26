// RTL (Right-to-Left) language support utilities
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

export const getDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

export const getRTLClass = (language: string, baseClass: string): string => {
  if (!isRTL(language)) return baseClass;
  
  // Map common directional classes to their RTL equivalents
  const rtlClassMap: { [key: string]: string } = {
    'ml-': 'mr-',
    'mr-': 'ml-',
    'pl-': 'pr-',
    'pr-': 'pl-',
    'left-': 'right-',
    'right-': 'left-',
    'text-left': 'text-right',
    'text-right': 'text-left',
    'rounded-l': 'rounded-r',
    'rounded-r': 'rounded-l',
    'border-l': 'border-r',
    'border-r': 'border-l',
  };

  let rtlClass = baseClass;
  Object.entries(rtlClassMap).forEach(([ltr, rtl]) => {
    if (baseClass.includes(ltr)) {
      rtlClass = baseClass.replace(new RegExp(ltr, 'g'), rtl);
    }
  });

  return rtlClass;
};

// Hook to use RTL utilities with current language
export const useRTL = () => {
  const { i18n } = require('react-i18next').useTranslation();
  const currentLanguage = i18n.language;
  
  return {
    isRTL: isRTL(currentLanguage),
    direction: getDirection(currentLanguage),
    rtlClass: (baseClass: string) => getRTLClass(currentLanguage, baseClass),
  };
}; 
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

export const getDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

export const getRTLClass = (language: string, baseClass: string): string => {
  if (!isRTL(language)) return baseClass;
  
  // Map common directional classes to their RTL equivalents
  const rtlClassMap: { [key: string]: string } = {
    'ml-': 'mr-',
    'mr-': 'ml-',
    'pl-': 'pr-',
    'pr-': 'pl-',
    'left-': 'right-',
    'right-': 'left-',
    'text-left': 'text-right',
    'text-right': 'text-left',
    'rounded-l': 'rounded-r',
    'rounded-r': 'rounded-l',
    'border-l': 'border-r',
    'border-r': 'border-l',
  };

  let rtlClass = baseClass;
  Object.entries(rtlClassMap).forEach(([ltr, rtl]) => {
    if (baseClass.includes(ltr)) {
      rtlClass = baseClass.replace(new RegExp(ltr, 'g'), rtl);
    }
  });

  return rtlClass;
};

// Hook to use RTL utilities with current language
export const useRTL = () => {
  const { i18n } = require('react-i18next').useTranslation();
  const currentLanguage = i18n.language;
  
  return {
    isRTL: isRTL(currentLanguage),
    direction: getDirection(currentLanguage),
    rtlClass: (baseClass: string) => getRTLClass(currentLanguage, baseClass),
  };
}; 