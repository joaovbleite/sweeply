// This script will check if the page is loaded from cache and force a reload if needed
(function() {
  // Add a timestamp parameter to force reloading resources
  if (!window.location.href.includes('nocache')) {
    const timestamp = new Date().getTime();
    const separator = window.location.href.includes('?') ? '&' : '?';
    window.location.href = window.location.href + separator + 'nocache=' + timestamp;
  }
  
  // Try to clear any service worker registrations
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Clear caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        caches.delete(cacheName);
      });
    });
  }
})(); 