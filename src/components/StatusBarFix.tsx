import React, { useEffect } from 'react';

/**
 * Component to fix iOS status bar background color issues in PWA mode
 * This ensures the status bar area has the correct background color
 */
const StatusBarFix: React.FC = () => {
  useEffect(() => {
    // Set meta tag for iOS status bar
    const metaTag = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') || 
                    document.createElement('meta');
    
    metaTag.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    metaTag.setAttribute('content', 'default'); // Use default for white status bar
    
    if (!metaTag.parentNode) {
      document.head.appendChild(metaTag);
    }
    
    // Add viewport-fit=cover to ensure content extends under the status bar
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      const content = viewportMeta.getAttribute('content') || '';
      if (!content.includes('viewport-fit=cover')) {
        viewportMeta.setAttribute('content', `${content}, viewport-fit=cover`);
      }
    }
    
    return () => {
      // Cleanup is optional here as these meta tags should persist
    };
  }, []);

  // This div ensures the status bar area is filled with white
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999]" 
      style={{ 
        height: 'env(safe-area-inset-top, 0px)',
        backgroundColor: '#FFFFFF'
      }}
    />
  );
};

export default StatusBarFix; 