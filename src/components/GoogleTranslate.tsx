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
  const [initAttempts, setInitAttempts] = useState(0);
  const [hasError, setHasError] = useState(false);

  const checkGoogleTranslateReady = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      let attempts = 0;
      const maxAttempts = 30;
      
      const check = () => {
        const combo = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
        if (combo && combo.options.length > 1) {
          console.log("✅ Google Translate is ready with options:", combo.options.length);
          resolve(true);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(check, 500);
        } else {
          console.warn("❌ Google Translate not ready after max attempts");
          resolve(false);
        }
      };
      
      check();
    });
  }, []);

  const initializeGoogleTranslate = useCallback(async () => {
    try {
      console.log(`🔄 Initialize attempt ${initAttempts + 1}`);
      setDebugInfo(`🔄 Loading... (attempt ${initAttempts + 1})`);
      
      if (!window.google?.translate?.TranslateElement) {
        throw new Error("Google Translate API not available");
      }

      // Clear any existing elements
      const existingElement = document.getElementById('google_translate_element');
      if (existingElement) {
        existingElement.innerHTML = '';
      }

      // Initialize with enhanced settings
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: languages.map(lang => lang.value).join(","),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true,
          gaTrack: false,
          gaId: null
        },
        "google_translate_element"
      );

      console.log("🔄 Google Translate element created, waiting for ready state...");
      setDebugInfo("🔄 Preparing translation...");

      // Wait for Google Translate to be ready
      const isReady = await checkGoogleTranslateReady();
      
      if (isReady) {
        setIsLoaded(true);
        setHasError(false);
        setDebugInfo("✅ Translation ready");
        console.log("✅ Google Translate fully initialized and ready");
        return true;
      } else {
        throw new Error("Google Translate elements not ready");
      }
    } catch (error) {
      console.error("❌ Translation initialization error:", error);
      
      if (initAttempts < 2) {
        setInitAttempts(prev => prev + 1);
        setDebugInfo(`⚠️ Retrying... (${initAttempts + 2}/3)`);
        setTimeout(() => initializeGoogleTranslate(), 2000);
      } else {
        setHasError(true);
        setDebugInfo("❌ Translation unavailable");
        toast.error("Translation service failed to load. Please refresh the page.");
      }
      return false;
    }
  }, [initAttempts, checkGoogleTranslateReady]);

  const loadGoogleTranslateScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Set up the callback before loading script
      window.googleTranslateElementInit = initializeGoogleTranslate;
      
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("✅ Google Translate script loaded successfully");
        resolve();
      };
      
      script.onerror = () => {
        console.error("❌ Failed to load Google Translate script");
        reject(new Error("Script loading failed"));
      };
      
      document.head.appendChild(script);
    });
  }, [initializeGoogleTranslate]);

  useEffect(() => {
    const initTranslation = async () => {
      try {
        // Check if already loaded
        if (window.google?.translate) {
          console.log("Google Translate API already available");
          await initializeGoogleTranslate();
          return;
        }

        // Load script
        setDebugInfo("🔄 Loading translation service...");
        await loadGoogleTranslateScript();
        
      } catch (error) {
        console.error("Failed to initialize translation:", error);
        setHasError(true);
        setDebugInfo("❌ Failed to load translation service");
        toast.error("Translation service unavailable");
      }
    };

    initTranslation();

    return () => {
      // Cleanup
      try {
        const script = document.querySelector('script[src*="translate.google.com"]');
        if (script) script.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [loadGoogleTranslateScript, initializeGoogleTranslate]);

  const handleLanguageChange = async (langCode: string) => {
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

      // Check if the language option exists
      const option = Array.from(selectElement.options).find(opt => opt.value === langCode);
      if (!option) {
        throw new Error(`Language ${langCode} not available`);
      }

      console.log(`🔄 Triggering translation to: ${langCode}`);
      
      // Trigger the translation
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
      toast.error("Translation failed. Please try refreshing the page.");
      setDebugInfo("❌ Translation failed");
      setCurrentLang("en");
      setIsTranslating(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    setInitAttempts(0);
    setHasError(false);
    setIsLoaded(false);
    setDebugInfo("🔄 Retrying...");
    window.location.reload();
  };

  return (
    <>
      {/* Google Translate Element - positioned off-screen but accessible */}
      <div 
        id="google_translate_element" 
        style={{ 
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "auto",
          height: "auto",
          visibility: "visible"
        }}
      />
      
      {/* Custom Language Selector */}
      <div className="space-y-2">
        <div className="relative">
          <select
            value={currentLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 w-full"
            disabled={!isLoaded || isTranslating || hasError}
            title={!isLoaded ? "Loading translation service..." : hasError ? "Translation service unavailable" : "Select language to translate page"}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
          
          {/* Icon indicator */}
          {isTranslating ? (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-pulse-500 border-t-transparent rounded-full animate-spin"></div>
          ) : hasError ? (
            <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          ) : isLoaded ? (
            <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
          ) : (
            <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
        </div>
        
        {/* Status and actions */}
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-500 flex-1">
            {debugInfo}
          </div>
          <div className="flex items-center gap-2">
            {hasError && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 text-pulse-600 hover:text-pulse-700 underline"
                title="Retry loading translation"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
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
      </div>
    </>
  );
} 