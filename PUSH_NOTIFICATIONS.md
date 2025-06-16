# Push Notifications Implementation Guide for Sweeply

This guide explains how to set up and use push notifications in the Sweeply app.

## Overview

The push notification system consists of several components:

1. **Client-side code** to request permission and manage subscriptions
2. **Service Worker** to receive and display notifications
3. **Serverless Function** to send notifications
4. **Database Table** to store user subscriptions

## Setup Instructions

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications. Generate them using:

```bash
# Install web-push if not already installed
npm install web-push --save-dev

# Run the key generation script
node scripts/generate-vapid-keys.js
```

### 2. Set Environment Variables

Add the generated VAPID keys to your environment:

For local development, add to `.env`:
```
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=admin@sweeply.com
```

For Supabase Edge Functions:
```bash
npx supabase secrets set VAPID_PUBLIC_KEY=your_public_key
npx supabase secrets set VAPID_PRIVATE_KEY=your_private_key
npx supabase secrets set VAPID_EMAIL=admin@sweeply.com
```

### 3. Create Database Table

Run the migration script to create the necessary table:

```bash
npx supabase db push
```

This creates the `user_push_subscriptions` table with proper indexes and RLS policies.

### 4. Deploy the Edge Function

Deploy the push notification serverless function:

```bash
npx supabase functions deploy send-push-notification
```

### 5. Update Client Configuration

Make sure the `VITE_PUSH_API_ENDPOINT` environment variable is set to your function URL:

```
VITE_PUSH_API_ENDPOINT=https://yourproject.supabase.co/functions/v1/send-push-notification
```

## Usage

### Request Notification Permission

```typescript
import { notificationService } from '@/lib/services/notificationService';

// Request permission and subscribe
const subscription = await notificationService.subscribeToPushNotifications();
if (subscription) {
  console.log('Subscribed to push notifications');
}
```

### Send a Test Notification

```typescript
// Send a single test notification
await notificationService.sendTestNotification();

// Send multiple notifications with delay
await notificationService.sendMultipleTestNotifications(5, 5000); // 5 notifications, 5 seconds apart
```

### Send a Notification from Backend

Send a notification using the serverless function:

```typescript
const response = await fetch('https://yourproject.supabase.co/functions/v1/send-push-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`
  },
  body: JSON.stringify({
    subscription: userSubscription,
    title: 'Notification Title',
    body: 'This is the notification body',
    icon: '/android-chrome-192x192.png',
    data: {
      url: '/jobs/123',
      jobId: '123'
    }
  })
});
```

## Notification Options

The notification payload supports these options:

- `title`: Notification title
- `body`: Notification text content
- `icon`: URL to the notification icon
- `badge`: URL to the notification badge (small icon)
- `data`: Custom data to include with the notification
- `actions`: Array of action buttons
- `tag`: Group similar notifications
- `requireInteraction`: Whether notification requires user interaction to dismiss

## Troubleshooting

1. **Notification permission denied**: The user must grant permission in their browser settings
2. **Service worker not registering**: Check for console errors during service worker registration
3. **Notifications not showing**: Ensure the VAPID keys match between client and server
4. **Function errors**: Check Supabase logs for edge function errors

## Testing

Test notifications on different devices and browsers to ensure compatibility.

Mobile browsers may have different notification behaviors compared to desktop browsers.

## Security Considerations

- Keep VAPID private keys secure
- Use proper authentication for the notification endpoint
- Implement rate limiting to prevent abuse 