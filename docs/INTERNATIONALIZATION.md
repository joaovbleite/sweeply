# Sweeply Internationalization (i18n) Guide

## Overview

Sweeply supports multiple languages to serve immigrant entrepreneurs worldwide. The application currently supports:

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇧🇷 Portuguese (pt)
- 🇫🇷 French (fr)
- 🇨🇳 Chinese (zh)

## Architecture

### Technology Stack
- **i18next**: Core internationalization framework
- **react-i18next**: React integration
- **i18next-browser-languagedetector**: Automatic language detection
- **i18next-http-backend**: Dynamic translation loading

### File Structure
```
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── navigation.json
    │   ├── auth.json
    │   ├── clients.json
    │   ├── jobs.json
    │   ├── invoices.json
    │   ├── team.json
    │   ├── payroll.json
    │   ├── calendar.json
    │   └── dashboard.json
    ├── es/
    ├── pt/
    ├── fr/
    └── zh/

src/
├── lib/
│   ├── i18n.ts           # i18n configuration
│   ├── rtl.ts            # RTL support utilities
│   └── language-assets.ts # Language-specific assets
├── hooks/
│   └── useLocale.ts      # Locale formatting hook
└── components/
    └── LanguageSwitcher.tsx
```

## Usage Guide

### Basic Translation Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['namespace', 'common']);
  
  return (
    <div>
      <h1>{t('namespace:key')}</h1>
      <p>{t('common:welcome')}</p>
    </div>
  );
}
```

### Using the Locale Hook

```typescript
import { useLocale } from '@/hooks/useLocale';

function PriceDisplay({ amount }: { amount: number }) {
  const { formatCurrency, formatDate } = useLocale();
  
  return (
    <div>
      <span>{formatCurrency(amount)}</span>
      <time>{formatDate(new Date())}</time>
    </div>
  );
}
```

### Language-Specific Assets

```typescript
import { getLanguageAssets, formatPhoneNumber } from '@/lib/language-assets';
import { useTranslation } from 'react-i18next';

function ContactForm() {
  const { i18n } = useTranslation();
  const assets = getLanguageAssets(i18n.language);
  
  return (
    <input
      placeholder={formatPhoneNumber('1234567890', i18n.language)}
      // Will format based on language: (123) 456-7890 for EN, etc.
    />
  );
}
```

## Translation Namespaces

### common
General UI elements and messages used across the application.

### navigation
Menu items, page titles, and navigation-related text.

### auth
Authentication screens: login, signup, password reset.

### clients
Client management module translations.

### jobs
Job scheduling and management translations.

### invoices
Billing and invoice-related translations.

### team
Employee management translations.

### payroll
Payroll processing translations.

### calendar
Calendar view and scheduling translations.

### dashboard
Dashboard and analytics translations.

## Adding New Translations

### 1. Add to English first (base language)

```json
// public/locales/en/namespace.json
{
  "newKey": "New translation text"
}
```

### 2. Add to other languages

```json
// public/locales/es/namespace.json
{
  "newKey": "Nuevo texto de traducción"
}
```

### 3. Use in component

```typescript
const { t } = useTranslation('namespace');
return <span>{t('newKey')}</span>;
```

## Currency and Date Formatting

The system automatically formats currency based on locale:

- English/Spanish (US): $1,234.56
- Portuguese (Brazil): R$ 1.234,56
- French (Europe): 1 234,56 €
- Chinese: ¥1,234.56

Dates are also formatted according to locale preferences:

- US: MM/DD/YYYY
- Latin/Europe: DD/MM/YYYY
- China: YYYY-MM-DD

## RTL Support (Future)

The application is prepared for RTL languages:

```typescript
import { useRTL } from '@/lib/rtl';

function Component() {
  const { isRTL, direction, rtlClass } = useRTL();
  
  return (
    <div dir={direction} className={rtlClass('ml-4')}>
      {/* Will be 'mr-4' for RTL languages */}
    </div>
  );
}
```

## Language Detection

Languages are detected in this order:
1. localStorage (user preference)
2. Browser language
3. HTML lang attribute
4. Fallback to English

## Best Practices

### 1. Keep translations organized
- Use clear, descriptive keys
- Group related translations in namespaces
- Avoid deeply nested structures

### 2. Handle pluralization
```typescript
t('items', { count: 5 }) // "5 items"
```

### 3. Interpolation
```typescript
t('welcome', { name: 'John' }) // "Welcome, John!"
```

### 4. Avoid hardcoded text
Always use translation keys instead of hardcoded strings.

### 5. Test all languages
Ensure UI doesn't break with longer translations.

## Performance Considerations

- Translations are loaded on-demand by namespace
- Only active language translations are loaded
- Translations are cached in localStorage
- Use React.Suspense is disabled for custom loading states

## Troubleshooting

### Missing translations
Check browser console for missing key warnings.

### Language not changing
Clear localStorage and check language detection order.

### Formatting issues
Ensure you're using the locale hook for dates/currency.

## Future Enhancements

1. **Arabic/Hebrew Support**: Full RTL implementation
2. **Translation Management**: Integration with translation services
3. **Language-specific images**: Localized screenshots and graphics
4. **Regional variations**: Support for regional dialects (es-MX, pt-PT)
5. **AI Translation**: Automatic translation for client communications

## Contributing Translations

To contribute translations:

1. Fork the repository
2. Add translations to appropriate JSON files
3. Test thoroughly in the application
4. Submit a pull request

Ensure translations are:
- Culturally appropriate
- Industry-specific (cleaning business context)
- Consistent with existing terminology
- Properly formatted for the UI

## Support

For translation issues or questions:
- Check this documentation
- Review existing translation files
- Contact the development team

Remember: Good translations improve user experience and business success for immigrant entrepreneurs! 🌍 

## Overview

Sweeply supports multiple languages to serve immigrant entrepreneurs worldwide. The application currently supports:

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇧🇷 Portuguese (pt)
- 🇫🇷 French (fr)
- 🇨🇳 Chinese (zh)

## Architecture

### Technology Stack
- **i18next**: Core internationalization framework
- **react-i18next**: React integration
- **i18next-browser-languagedetector**: Automatic language detection
- **i18next-http-backend**: Dynamic translation loading

### File Structure
```
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── navigation.json
    │   ├── auth.json
    │   ├── clients.json
    │   ├── jobs.json
    │   ├── invoices.json
    │   ├── team.json
    │   ├── payroll.json
    │   ├── calendar.json
    │   └── dashboard.json
    ├── es/
    ├── pt/
    ├── fr/
    └── zh/

src/
├── lib/
│   ├── i18n.ts           # i18n configuration
│   ├── rtl.ts            # RTL support utilities
│   └── language-assets.ts # Language-specific assets
├── hooks/
│   └── useLocale.ts      # Locale formatting hook
└── components/
    └── LanguageSwitcher.tsx
```

## Usage Guide

### Basic Translation Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['namespace', 'common']);
  
  return (
    <div>
      <h1>{t('namespace:key')}</h1>
      <p>{t('common:welcome')}</p>
    </div>
  );
}
```

### Using the Locale Hook

```typescript
import { useLocale } from '@/hooks/useLocale';

function PriceDisplay({ amount }: { amount: number }) {
  const { formatCurrency, formatDate } = useLocale();
  
  return (
    <div>
      <span>{formatCurrency(amount)}</span>
      <time>{formatDate(new Date())}</time>
    </div>
  );
}
```

### Language-Specific Assets

```typescript
import { getLanguageAssets, formatPhoneNumber } from '@/lib/language-assets';
import { useTranslation } from 'react-i18next';

function ContactForm() {
  const { i18n } = useTranslation();
  const assets = getLanguageAssets(i18n.language);
  
  return (
    <input
      placeholder={formatPhoneNumber('1234567890', i18n.language)}
      // Will format based on language: (123) 456-7890 for EN, etc.
    />
  );
}
```

## Translation Namespaces

### common
General UI elements and messages used across the application.

### navigation
Menu items, page titles, and navigation-related text.

### auth
Authentication screens: login, signup, password reset.

### clients
Client management module translations.

### jobs
Job scheduling and management translations.

### invoices
Billing and invoice-related translations.

### team
Employee management translations.

### payroll
Payroll processing translations.

### calendar
Calendar view and scheduling translations.

### dashboard
Dashboard and analytics translations.

## Adding New Translations

### 1. Add to English first (base language)

```json
// public/locales/en/namespace.json
{
  "newKey": "New translation text"
}
```

### 2. Add to other languages

```json
// public/locales/es/namespace.json
{
  "newKey": "Nuevo texto de traducción"
}
```

### 3. Use in component

```typescript
const { t } = useTranslation('namespace');
return <span>{t('newKey')}</span>;
```

## Currency and Date Formatting

The system automatically formats currency based on locale:

- English/Spanish (US): $1,234.56
- Portuguese (Brazil): R$ 1.234,56
- French (Europe): 1 234,56 €
- Chinese: ¥1,234.56

Dates are also formatted according to locale preferences:

- US: MM/DD/YYYY
- Latin/Europe: DD/MM/YYYY
- China: YYYY-MM-DD

## RTL Support (Future)

The application is prepared for RTL languages:

```typescript
import { useRTL } from '@/lib/rtl';

function Component() {
  const { isRTL, direction, rtlClass } = useRTL();
  
  return (
    <div dir={direction} className={rtlClass('ml-4')}>
      {/* Will be 'mr-4' for RTL languages */}
    </div>
  );
}
```

## Language Detection

Languages are detected in this order:
1. localStorage (user preference)
2. Browser language
3. HTML lang attribute
4. Fallback to English

## Best Practices

### 1. Keep translations organized
- Use clear, descriptive keys
- Group related translations in namespaces
- Avoid deeply nested structures

### 2. Handle pluralization
```typescript
t('items', { count: 5 }) // "5 items"
```

### 3. Interpolation
```typescript
t('welcome', { name: 'John' }) // "Welcome, John!"
```

### 4. Avoid hardcoded text
Always use translation keys instead of hardcoded strings.

### 5. Test all languages
Ensure UI doesn't break with longer translations.

## Performance Considerations

- Translations are loaded on-demand by namespace
- Only active language translations are loaded
- Translations are cached in localStorage
- Use React.Suspense is disabled for custom loading states

## Troubleshooting

### Missing translations
Check browser console for missing key warnings.

### Language not changing
Clear localStorage and check language detection order.

### Formatting issues
Ensure you're using the locale hook for dates/currency.

## Future Enhancements

1. **Arabic/Hebrew Support**: Full RTL implementation
2. **Translation Management**: Integration with translation services
3. **Language-specific images**: Localized screenshots and graphics
4. **Regional variations**: Support for regional dialects (es-MX, pt-PT)
5. **AI Translation**: Automatic translation for client communications

## Contributing Translations

To contribute translations:

1. Fork the repository
2. Add translations to appropriate JSON files
3. Test thoroughly in the application
4. Submit a pull request

Ensure translations are:
- Culturally appropriate
- Industry-specific (cleaning business context)
- Consistent with existing terminology
- Properly formatted for the UI

## Support

For translation issues or questions:
- Check this documentation
- Review existing translation files
- Contact the development team

Remember: Good translations improve user experience and business success for immigrant entrepreneurs! 🌍 