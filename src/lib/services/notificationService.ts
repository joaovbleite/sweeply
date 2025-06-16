// Notification Service for handling push notifications

import { supabase } from '../supabase';

// VAPID public key - should match the one in the serverless function
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// API endpoint for the serverless function
const PUSH_API_ENDPOINT = import.meta.env.VITE_PUSH_API_ENDPOINT || 'https://sweeply.supabase.co/functions/v1/send-push-notification';

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

export const notificationService = {
  // Check if push notifications are supported by the browser
  isPushNotificationSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Request permission for push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isPushNotificationSupported()) {
      throw new Error('Push notifications are not supported by this browser');
    }

    return await Notification.requestPermission();
  },

  // Get the service worker registration
  async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPushNotificationSupported()) {
      return null;
    }

    return await navigator.serviceWorker.ready;
  },

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        console.log('Notification permission not granted');
        return null;
      }

      const swRegistration = await this.getServiceWorkerRegistration();
      if (!swRegistration) {
        console.log('Service worker not registered');
        return null;
      }

      // Get the current subscription or create a new one
      let subscription = await swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription with application server key
        const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        
        subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      // Store subscription in user's profile
      await this.saveSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  },

  // Save subscription to database
  async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get device information
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString()
      };

      // Store the subscription in the user's profile or a separate table
      await supabase.from('user_push_subscriptions').upsert({
        user_id: user.id,
        subscription: JSON.stringify(subscription),
        device_info: deviceInfo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  // Send a test notification
  async sendTestNotification(): Promise<boolean> {
    try {
      // First make sure we have a subscription
      const subscription = await this.subscribeToPushNotifications();
      if (!subscription) {
        throw new Error('Failed to get push subscription');
      }

      // For demo purposes, we'll simulate a push by showing a notification directly
      const swRegistration = await this.getServiceWorkerRegistration();
      if (!swRegistration) {
        throw new Error('Service worker not registered');
      }

      // Show a local notification (this won't work when the app is closed)
      await swRegistration.showNotification('Test Notification', {
        body: 'This is a test notification from Sweeply',
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          url: window.location.href
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  },

  // Send a real push notification via the server
  async sendServerPushNotification(options: NotificationOptions): Promise<boolean> {
    try {
      // First make sure we have a subscription
      const subscription = await this.subscribeToPushNotifications();
      if (!subscription) {
        throw new Error('Failed to get push subscription');
      }

      // Send the notification via our serverless function
      const response = await fetch(PUSH_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          ...options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending server push notification:', error);
      return false;
    }
  },

  // Send multiple test notifications with delay
  async sendMultipleTestNotifications(count: number = 5, delayMs: number = 5000): Promise<boolean> {
    try {
      // First make sure we have a subscription
      const subscription = await this.subscribeToPushNotifications();
      if (!subscription) {
        throw new Error('Failed to get push subscription');
      }

      // Send notifications with delay
      for (let i = 1; i <= count; i++) {
        setTimeout(async () => {
          try {
            await this.sendServerPushNotification({
              title: `Test Notification ${i}/${count}`,
              body: `This is test notification ${i} of ${count}`,
              icon: '/android-chrome-192x192.png',
              badge: '/favicon-32x32.png',
              data: {
                notificationId: i,
                total: count,
                url: window.location.href
              }
            });
          } catch (error) {
            console.error(`Error sending notification ${i}:`, error);
          }
        }, i * delayMs);
      }

      return true;
    } catch (error) {
      console.error('Error setting up multiple notifications:', error);
      return false;
    }
  },

  // Helper function to convert base64 to Uint8Array for VAPID keys
  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}; 