#!/usr/bin/env node

/**
 * Script to generate VAPID keys for Web Push Notifications
 * Run with: node generate-vapid-keys.js
 */

const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID KEYS FOR WEB PUSH NOTIFICATIONS ===\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);
console.log('\n=== STORE THESE SECURELY IN YOUR ENVIRONMENT VARIABLES ===\n');
console.log('For .env file:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=admin@sweeply.com  # Change this to your email`);
console.log('\n=== FOR SUPABASE EDGE FUNCTIONS ===\n');
console.log('Run these commands:');
console.log(`npx supabase secrets set VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`npx supabase secrets set VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`npx supabase secrets set VAPID_EMAIL=admin@sweeply.com  # Change this to your email`);
console.log('\n'); 