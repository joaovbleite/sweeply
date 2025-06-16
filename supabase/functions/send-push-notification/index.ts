import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import * as webPush from 'npm:web-push@3.6.0'

// VAPID keys should be set as environment variables in production
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'UUxI4O8-FDRrF8arCiBiLUd-EpucHJFJuiy7Ix0wHF8';
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL') || 'admin@sweeply.com';

// Set VAPID details
webPush.setVapidDetails(
  `mailto:${VAPID_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

interface RequestBody {
  subscription: webPush.PushSubscription;
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

serve(async (req) => {
  // Check if request method is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse request body
    const body: RequestBody = await req.json();
    const { subscription, title, body: notificationBody, ...options } = body;

    if (!subscription || !title || !notificationBody) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      ...options,
    });

    // Send push notification
    const result = await webPush.sendNotification(subscription, payload);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to send push notification',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 