// Service Worker for Sweeply App
// Handles push notifications and offline capabilities

const CACHE_NAME = 'sweeply-cache-v1';
const APP_URL = self.location.origin;

// Assets to cache immediately
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/favicon-32x32.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients so the service worker is in control immediately
  self.clients.claim();
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);
  
  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[Service Worker] Push data:', data);
    
    const options = {
      body: data.body || 'New notification from Sweeply',
      icon: data.icon || '/android-chrome-192x192.png',
      badge: data.badge || '/favicon-32x32.png',
      vibrate: data.vibrate || [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || APP_URL,
        ...data.data
      },
      actions: data.actions || [],
      tag: data.tag || 'sweeply-notification',
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Sweeply', options)
      .then(() => {
        console.log('[Service Worker] Notification displayed successfully');
        
        // Send analytics or tracking data if needed
        if (data.track) {
          return fetch('/api/track-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: data.id,
              displayed: true,
              timestamp: Date.now()
            })
          }).catch(err => console.error('[Service Worker] Failed to track notification:', err));
        }
      })
    );
  } catch (error) {
    console.error('[Service Worker] Error showing notification:', error);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  const url = event.notification.data?.url || APP_URL;
  const notificationData = event.notification.data || {};
  
  // Handle action buttons if clicked
  if (event.action) {
    console.log('[Service Worker] Action clicked:', event.action);
    
    // You can handle specific actions here
    switch (event.action) {
      case 'open_job':
        const jobId = notificationData.jobId;
        if (jobId) {
          event.waitUntil(
            clients.openWindow(`${APP_URL}/jobs/${jobId}`)
          );
          return;
        }
        break;
      case 'dismiss':
        // Just close the notification, which we already did
        return;
    }
  }

  // Default behavior - open the target URL
  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there is already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open or matching, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
  
  // Track notification click if needed
  if (notificationData.id) {
    fetch('/api/track-notification-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: notificationData.id,
        action: event.action || 'default',
        timestamp: Date.now()
      })
    }).catch(err => console.error('[Service Worker] Failed to track notification click:', err));
  }
}); 