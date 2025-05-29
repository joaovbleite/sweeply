"use client";
import React, { useEffect, useState } from "react";
import { Globe, RefreshCw } from "lucide-react";
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
  const [debugInfo, setDebugInfo] = useState("");

  function googleTranslateElementInit() {
    try {
      console.log("Initializing Google Translate...");
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: languages.map(lang => lang.value).join(","),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          },
          "google_translate_element"
        );
        setIsLoaded(true);
        setDebugInfo("✅ Google Translate loaded successfully");
        console.log("Google Translate initialized successfully");
        
        // Check if combo is created
        setTimeout(() => {
          const combo = document.querySelector('select.goog-te-combo');
          if (combo) {
            console.log("✅ Google Translate combo element found");
            setDebugInfo("✅ Translation ready");
          } else {
            console.warn("⚠️ Google Translate combo element not found");
            setDebugInfo("⚠️ Translation element not found");
          }
        }, 1000);
      } else {
        setDebugInfo("❌ Google Translate API not available");
      }
    } catch (error) {
      console.error("Error initializing Google Translate:", error);
      setDebugInfo("❌ Translation initialization failed");
      toast.error("Translation service failed to initialize");
    }
  }

  useEffect(() => {
    setDebugInfo("🔄 Loading translation service...");
    
    // Check if already loaded
    if (window.google?.translate) {
      googleTranslateElementInit();
      return;
    }

    // Set global callback
    window.googleTranslateElementInit = googleTranslateElementInit;
    
    // Load script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => {
      console.log("Google Translate script loaded");
    };
    script.onerror = () => {
      console.error("Failed to load Google Translate script");
      setDebugInfo("❌ Translation service unavailable");
      toast.error("Translation service unavailable");
    };
    
    document.head.appendChild(script);

    return () => {
      try {
        script.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (!isLoaded || isTranslating) return;

    setIsTranslating(true);
    setCurrentLang(langCode);
    setDebugInfo("🔄 Translating...");

    try {
      if (langCode === 'en') {
        // Reset to original language by reloading
        window.location.reload();
        return;
      }

      // Wait for Google Translate to be ready and find the select element
      let attempts = 0;
      const maxAttempts = 20;
      
      const findAndTrigger = () => {
        const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
        
        if (selectElement) {
          console.log("Found Google Translate combo, triggering translation to:", langCode);
          selectElement.value = langCode;
          selectElement.dispatchEvent(new Event('change', { bubbles: true }));
          
          const selectedLang = languages.find(lang => lang.value === langCode);
          if (selectedLang) {
            toast.success(`Translating to ${selectedLang.label}...`);
            setDebugInfo(`✅ Translating to ${selectedLang.label}`);
          }
          setIsTranslating(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`Attempt ${attempts}: Google Translate combo not found, retrying...`);
          setTimeout(findAndTrigger, 200);
        } else {
          console.warn("Google Translate select element not found after all attempts");
          setDebugInfo("❌ Translation failed - element not found");
          toast.error("Translation failed. Please try refreshing the page.");
          setCurrentLang("en");
          setIsTranslating(false);
        }
      };

      findAndTrigger();
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
      setDebugInfo("❌ Translation error");
      setCurrentLang("en");
      setIsTranslating(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Google Translate Element - must be visible for it to work */}
      <div 
        id="google_translate_element" 
        style={{ 
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px"
        }}
      />
      
      {/* Custom Language Selector */}
      <div className="space-y-2">
        <div className="relative">
          <select
            value={currentLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 w-full"
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
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-pulse-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Status and refresh */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 flex-1">
            {debugInfo}
          </div>
          {currentLang !== 'en' && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 text-xs text-pulse-600 hover:text-pulse-700 underline"
              title="Return to English"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </>
  );
} 