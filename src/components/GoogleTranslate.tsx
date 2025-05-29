"use client";
import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";

const languages = [
  { label: "English", value: "en", flag: "🇺🇸" },
  { label: "Español", value: "es", flag: "🇪🇸" },
  { label: "Português", value: "pt", flag: "🇧🇷" },
  { label: "Français", value: "fr", flag: "🇫🇷" },
  { label: "中文", value: "zh", flag: "🇨🇳" },
  { label: "Deutsch", value: "de", flag: "🇩🇪" },
  { label: "Italiano", value: "it", flag: "🇮🇹" },
  { label: "日本語", value: "ja", flag: "🇯🇵" },
  { label: "한국어", value: "ko", flag: "🇰🇷" },
  { label: "العربية", value: "ar", flag: "🇸🇦" },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const includedLanguages = languages.map(lang => lang.value).join(",");

  function googleTranslateElementInit() {
    try {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: includedLanguages,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            gaTrack: false,
            gaId: null
          },
          "google_translate_element"
        );
        setIsLoaded(true);
        console.log("Google Translate initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing Google Translate:", error);
    }
  }

  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.translate) {
      googleTranslateElementInit();
      return;
    }

    // Set up the callback
    window.googleTranslateElementInit = googleTranslateElementInit;
    
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      console.error("Failed to load Google Translate script");
      toast.error("Translation service unavailable");
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      try {
        script.remove();
      } catch (e) {
        // Script might already be removed
      }
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (!isLoaded || isTranslating) return;

    setIsTranslating(true);
    setCurrentLang(langCode);
    
    try {
      if (langCode === 'en') {
        // Reset to original language
        window.location.reload();
        return;
      }

      // Find and trigger the Google Translate dropdown
      const translateElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (translateElement) {
        translateElement.value = langCode;
        translateElement.dispatchEvent(new Event("change"));
        
        // Show success message
        const selectedLang = languages.find(lang => lang.value === langCode);
        if (selectedLang) {
          toast.success(`Translating to ${selectedLang.label}...`, {
            duration: 2000,
          });
        }
      } else {
        // If dropdown not found, try alternative method
        setTimeout(() => {
          const frame = document.querySelector('iframe.skiptranslate') as HTMLIFrameElement;
          if (frame && frame.contentDocument) {
            const select = frame.contentDocument.querySelector('select.goog-te-combo') as HTMLSelectElement;
            if (select) {
              select.value = langCode;
              select.dispatchEvent(new Event('change'));
            }
          }
        }, 500);
        
        toast.success(`Translating to ${languages.find(lang => lang.value === langCode)?.label}...`);
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setTimeout(() => setIsTranslating(false), 2000);
    }
  };

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div 
        id="google_translate_element" 
        style={{ 
          visibility: "hidden", 
          width: "1px", 
          height: "1px",
          position: "absolute",
          top: "-9999px"
        }}
      />
      
      {/* Custom Language Selector */}
      <div className="relative">
        <select
          value={currentLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100"
          disabled={!isLoaded || isTranslating}
          title={!isLoaded ? "Loading translation service..." : "Select language to translate page"}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <Globe className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isTranslating ? 'animate-spin' : ''}`} />
        
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-pulse-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Reset button for original language */}
      {currentLang !== 'en' && (
        <button
          onClick={() => handleLanguageChange('en')}
          className="mt-1 text-xs text-pulse-600 hover:text-pulse-700 underline"
          disabled={isTranslating}
        >
          Reset to English
        </button>
      )}
    </>
  );
} 