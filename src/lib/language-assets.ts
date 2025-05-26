// Language-specific assets configuration
export interface LanguageAssets {
  // Images and illustrations
  heroImage?: string;
  aboutImage?: string;
  featuresImages?: {
    scheduling?: string;
    invoicing?: string;
    clientManagement?: string;
    teamManagement?: string;
  };
  
  // Videos
  tutorialVideo?: string;
  
  // Documents
  termsOfService?: string;
  privacyPolicy?: string;
  userGuide?: string;
  
  // Cultural adaptations
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  phoneFormat: string;
  addressFormat: string[];
  
  // Business hours
  businessDays: number[]; // 0 = Sunday, 6 = Saturday
  workingHours: {
    start: string;
    end: string;
  };
}

export const languageAssets: Record<string, LanguageAssets> = {
  en: {
    currencySymbol: '$',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    phoneFormat: '(XXX) XXX-XXXX',
    addressFormat: ['street', 'city', 'state', 'zipCode', 'country'],
    businessDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: {
      start: '08:00',
      end: '18:00'
    }
  },
  es: {
    currencySymbol: '$',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    phoneFormat: 'XXX-XXX-XXXX',
    addressFormat: ['street', 'city', 'state', 'zipCode', 'country'],
    businessDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    workingHours: {
      start: '07:00',
      end: '20:00'
    }
  },
  pt: {
    currencySymbol: 'R$',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    phoneFormat: '(XX) XXXXX-XXXX',
    addressFormat: ['street', 'city', 'state', 'zipCode', 'country'],
    businessDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    workingHours: {
      start: '08:00',
      end: '18:00'
    }
  },
  fr: {
    currencySymbol: '€',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    phoneFormat: 'XX XX XX XX XX',
    addressFormat: ['street', 'zipCode', 'city', 'country'],
    businessDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: {
      start: '09:00',
      end: '18:00'
    }
  },
  zh: {
    currencySymbol: '¥',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    phoneFormat: 'XXX-XXXX-XXXX',
    addressFormat: ['country', 'state', 'city', 'street'],
    businessDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    workingHours: {
      start: '09:00',
      end: '18:00'
    }
  }
};

// Get language-specific assets
export const getLanguageAssets = (language: string): LanguageAssets => {
  return languageAssets[language] || languageAssets.en;
};

// Format phone number based on language
export const formatPhoneNumber = (phone: string, language: string): string => {
  const assets = getLanguageAssets(language);
  const format = assets.phoneFormat;
  const digits = phone.replace(/\D/g, '');
  
  let formatted = '';
  let digitIndex = 0;
  
  for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
    if (format[i] === 'X') {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += format[i];
    }
  }
  
  return formatted;
};

// Get appropriate greeting based on time and language
export const getGreeting = (language: string): string => {
  const hour = new Date().getHours();
  
  const greetings: Record<string, { morning: string; afternoon: string; evening: string }> = {
    en: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
    es: { morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches' },
    pt: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite' },
    fr: { morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir' },
    zh: { morning: '早上好', afternoon: '下午好', evening: '晚上好' }
  };
  
  const langGreetings = greetings[language] || greetings.en;
  
  if (hour < 12) return langGreetings.morning;
  if (hour < 18) return langGreetings.afternoon;
  return langGreetings.evening;
}; 
export interface LanguageAssets {
  // Images and illustrations
  heroImage?: string;
  aboutImage?: string;
  featuresImages?: {
    scheduling?: string;
    invoicing?: string;
    clientManagement?: string;
    teamManagement?: string;
  };
  
  // Videos
  tutorialVideo?: string;
  
  // Documents
  termsOfService?: string;
  privacyPolicy?: string;
  userGuide?: string;
  
  // Cultural adaptations
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  phoneFormat: string;
  addressFormat: string[];
  
  // Business hours
  businessDays: number[]; // 0 = Sunday, 6 = Saturday
  workingHours: {
    start: string;
    end: string;
  };
}

export const languageAssets: Record<string, LanguageAssets> = {
  en: {
    currencySymbol: '$',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    phoneFormat: '(XXX) XXX-XXXX',
    addressFormat: ['street', 'city', 'state', 'zipCode', 'country'],
    businessDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: {
      start: '08:00',
      end: '18:00'
    }
  },
  es: {
    currencySymbol: '$',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    phoneFormat: 'XXX-XXX-XXXX',
    addressFormat: ['street', 'city', 'state', 'zipCode', 'country'],
    businessDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    workingHours: {
      start: '07:00',
      end: '20:00'
    }
  },
  pt: {
    currencySymbol: 'R$',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    phoneFormat: '(XX) XXXXX-XXXX',
    addressFormat: ['street', 'city', 'state', 'zipCode', 'country'],
    businessDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    workingHours: {
      start: '08:00',
      end: '18:00'
    }
  },
  fr: {
    currencySymbol: '€',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    phoneFormat: 'XX XX XX XX XX',
    addressFormat: ['street', 'zipCode', 'city', 'country'],
    businessDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: {
      start: '09:00',
      end: '18:00'
    }
  },
  zh: {
    currencySymbol: '¥',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    phoneFormat: 'XXX-XXXX-XXXX',
    addressFormat: ['country', 'state', 'city', 'street'],
    businessDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    workingHours: {
      start: '09:00',
      end: '18:00'
    }
  }
};

// Get language-specific assets
export const getLanguageAssets = (language: string): LanguageAssets => {
  return languageAssets[language] || languageAssets.en;
};

// Format phone number based on language
export const formatPhoneNumber = (phone: string, language: string): string => {
  const assets = getLanguageAssets(language);
  const format = assets.phoneFormat;
  const digits = phone.replace(/\D/g, '');
  
  let formatted = '';
  let digitIndex = 0;
  
  for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
    if (format[i] === 'X') {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += format[i];
    }
  }
  
  return formatted;
};

// Get appropriate greeting based on time and language
export const getGreeting = (language: string): string => {
  const hour = new Date().getHours();
  
  const greetings: Record<string, { morning: string; afternoon: string; evening: string }> = {
    en: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
    es: { morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches' },
    pt: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite' },
    fr: { morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir' },
    zh: { morning: '早上好', afternoon: '下午好', evening: '晚上好' }
  };
  
  const langGreetings = greetings[language] || greetings.en;
  
  if (hour < 12) return langGreetings.morning;
  if (hour < 18) return langGreetings.afternoon;
  return langGreetings.evening;
}; 
 