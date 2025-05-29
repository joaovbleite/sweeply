"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Globe, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
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
  const [debugInfo, setDebugInfo] = useState("🔄 Initializing...");

  const initializeGoogleTranslate = useCallback(() => {
    try {
      console.log("🔄 Initializing Google Translate...");
      setDebugInfo("🔄 Setting up translation...");
      
      if (!window.google?.translate?.TranslateElement) {
        throw new Error("Google Translate API not available");
      }

      // Clear any existing elements
      const existingElement = document.getElementById('google_translate_element');
      if (existingElement) {
        existingElement.innerHTML = '';
      }

      // Initialize Google Translate with proper settings
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

      console.log("✅ Google Translate element created");
      
      // Wait a bit for Google to set up, then check
      setTimeout(() => {
        const combo = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
        if (combo && combo.options.length > 1) {
          console.log("✅ Google Translate ready with", combo.options.length, "language options");
          setIsLoaded(true);
          setDebugInfo("✅ Translation ready");
        } else {
          console.log("⚠️ Google Translate combo found but no options yet");
          setDebugInfo("⚠️ Setting up languages...");
          
          // Try again after another delay
          setTimeout(() => {
            const retryCombo = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
            if (retryCombo && retryCombo.options.length > 1) {
              console.log("✅ Google Translate ready after retry");
              setIsLoaded(true);
              setDebugInfo("✅ Translation ready");
            } else {
              console.warn("❌ Google Translate combo still not ready");
              setDebugInfo("❌ Translation setup failed");
            }
          }, 2000);
        }
      }, 1000);

    } catch (error) {
      console.error("❌ Translation initialization error:", error);
      setDebugInfo("❌ Translation unavailable");
    }
  }, []);

  useEffect(() => {
    const loadGoogleTranslate = () => {
      // Check if already loaded
      if (window.google?.translate) {
        console.log("Google Translate API already available");
        initializeGoogleTranslate();
        return;
      }

      // Set up the callback
      window.googleTranslateElementInit = initializeGoogleTranslate;
      
      // Load the script
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        console.error("❌ Failed to load Google Translate script");
        setDebugInfo("❌ Translation service unavailable");
      };
      
      document.head.appendChild(script);
    };

    loadGoogleTranslate();
  }, [initializeGoogleTranslate]);

  const handleLanguageChange = (langCode: string) => {
    if (!isLoaded || isTranslating) return;

    setIsTranslating(true);
    setCurrentLang(langCode);
    setDebugInfo("🔄 Translating...");

    try {
      if (langCode === 'en') {
        // Reset to original language
        window.location.reload();
        return;
      }

      // Find the Google Translate select element
      const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
      
      if (!selectElement) {
        throw new Error("Translation element not found");
      }

      console.log(`🔄 Triggering translation to: ${langCode}`);
      
      // Set the value and trigger change
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));

      const selectedLang = languages.find(lang => lang.value === langCode);
      if (selectedLang) {
        toast.success(`Translating to ${selectedLang.label}...`);
        setDebugInfo(`✅ Translating to ${selectedLang.label}`);
      }
      
      setTimeout(() => setIsTranslating(false), 1500);

    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please refresh the page.");
      setDebugInfo("❌ Translation failed");
      setCurrentLang("en");
      setIsTranslating(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Google Translate Element - give it a proper space but hide it */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '1px' }}>
        <div 
          id="google_translate_element" 
          style={{ 
            position: 'absolute',
            top: '0',
            left: '0',
            opacity: '0',
            pointerEvents: 'none',
            transform: 'scale(0.1)'
          }}
        />
      </div>
      
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
          
          {/* Status Icon */}
          {isTranslating ? (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-pulse-500 border-t-transparent rounded-full animate-spin"></div>
          ) : isLoaded ? (
            <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
          ) : (
            <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
        </div>
        
        {/* Status and Reset */}
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-500 flex-1">
            {debugInfo}
          </div>
          {currentLang !== 'en' && isLoaded && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 text-pulse-600 hover:text-pulse-700 underline"
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