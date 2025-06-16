// Notification Service for handling push notifications

import { supabase } from '../supabase';

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
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
        // Note: In production, you would get this key from your backend
        const applicationServerKey = this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        );
        
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

      // Store the subscription in the user's profile or a separate table
      await supabase.from('user_push_subscriptions').upsert({
        user_id: user.id,
        subscription: JSON.stringify(subscription),
        created_at: new Date().toISOString()
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

      // In a real implementation, you would call your backend API here
      // which would then use a library like web-push to send the notification
      
      // For demo purposes, we'll simulate a push by showing a notification directly
      // This won't work when the app is closed, but it demonstrates the concept
      const swRegistration = await this.getServiceWorkerRegistration();
      if (!swRegistration) {
        throw new Error('Service worker not registered');
      }

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