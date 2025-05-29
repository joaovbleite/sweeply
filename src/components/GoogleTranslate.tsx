"use client";
import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";

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

  const includedLanguages = languages.map(lang => lang.value).join(",");

  function googleTranslateElementInit() {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: includedLanguages,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element"
    );
    setIsLoaded(true);
  }

  useEffect(() => {
    window.googleTranslateElementInit = googleTranslateElementInit;
    
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // Add global styles to hide Google Translate elements
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      body { top: 0px !important; }
      .goog-te-gadget { display: none !important; }
      iframe.skiptranslate { display: none !important; }
      .goog-te-combo { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
      .goog-logo-link { display: none !important; }
      .goog-te-gadget .goog-te-gadget-simple { background: transparent !important; border: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup
      script.remove();
      style.remove();
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    
    if (window.google && window.google.translate) {
      const translateElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (translateElement) {
        translateElement.value = langCode;
        translateElement.dispatchEvent(new Event("change"));
      }
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
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 cursor-pointer"
          disabled={!isLoaded}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </>
  );
} 