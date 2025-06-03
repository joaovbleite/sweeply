import React, { useState, useEffect } from 'react';
import { X, Download, ArrowDown } from 'lucide-react';

/**
 * InstallPrompt Component
 * 
 * This component handles prompting users to install the PWA.
 * 
 * PWA Behavior:
 * - When installed as a PWA and launched from homescreen, the app will bypass the landing page
 *   and go directly to login/signup for unauthenticated users or dashboard for authenticated users.
 * - When accessed through a browser, it will show the landing page to all unauthenticated visitors.
 * 
 * The actual PWA behavior logic is implemented in the Index.tsx component using the isRunningAsPWA utility.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend the Navigator interface to include the standalone property for iOS
interface IosNavigator extends Navigator {
  standalone?: boolean;
}

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('pwaPromptDismissed');
    if (hasPromptBeenDismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Check if running on iOS
    const isRunningOnIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isRunningOnIOS);

    // For iOS, we'll show our custom prompt if the app is in browser mode
    if (isRunningOnIOS && !(window.navigator as IosNavigator).standalone) {
      // Only show after a delay to not annoy users immediately
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 60000); // Show after 1 minute of usage
      return () => clearTimeout(timer);
    }

    // For other browsers, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      
      // Only show after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds of usage
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up the event listener
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Hide prompt if app is installed
  useEffect(() => {
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwaPromptDismissed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt && !isIOS) return;

    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      
      // Clear the deferredPrompt variable
      setDeferredPrompt(null);
    }
    
    // Always hide the prompt
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto px-4 z-50 max-w-md">
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 animate-slide-up">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="bg-pulse-100 p-2 rounded-full mr-3">
              <Download className="h-6 w-6 text-pulse-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Install Sweeply</h3>
          </div>
          <button 
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          {isIOS 
            ? 'Install this app on your iPhone for the best experience! Tap the share button and then "Add to Home Screen".' 
            : 'Install Sweeply on your device for faster access and a better experience, even when offline!'}
        </p>
        
        {isIOS ? (
          <div className="flex flex-col items-center text-sm text-gray-500 border-t border-gray-100 pt-3">
            <p className="mb-2">Tap the share button, then:</p>
            <div className="flex items-center">
              <ArrowDown className="h-4 w-4 mr-1 animate-bounce" />
              <span>Add to Home Screen</span>
            </div>
          </div>
        ) : (
          <button
            onClick={installApp}
            className="w-full py-2.5 px-4 bg-pulse-600 hover:bg-pulse-700 text-white font-medium rounded-lg transition-colors"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt; 