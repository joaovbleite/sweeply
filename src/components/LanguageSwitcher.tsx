import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages } from '@/lib/i18n';
import { Globe } from 'lucide-react';

// Language abbreviations for compact mode
const languageAbbreviations: Record<string, string> = {
  en: 'EN',
  es: 'ES', 
  pt: 'PT',
  fr: 'FR',
  zh: 'ZH'
};

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    // Store the preference
    localStorage.setItem('i18nextLng', value);
  };

  if (compact) {
    return (
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[70px] h-10 text-sm">
          <SelectValue placeholder="EN" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languages).map(([code, { nativeName }]) => (
            <SelectItem key={code} value={code} className="text-sm">
              {languageAbbreviations[code]} - {nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2 shadow-sm rounded-lg bg-white/80 backdrop-blur-sm p-1">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[170px] h-10 text-base">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languages).map(([code, { nativeName }]) => (
            <SelectItem key={code} value={code} className="text-base">
              {nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 
 
 
 
 