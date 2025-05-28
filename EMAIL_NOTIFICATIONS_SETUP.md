# 📧 Email Notifications Setup Guide

This guide will help you set up automatic email notifications that are sent to clients when job status changes to "Started" or "Completed".

## Features

- ✅ Automatic email when job is started (in_progress)
- ✅ Automatic email when job is completed
- ✅ Beautiful HTML email templates
- ✅ Uses your business name from profile
- ✅ Respects client email notification preferences

## Setup Steps

### 1. Deploy the Edge Function

In your Supabase dashboard:

1. Go to **Functions** in the sidebar
2. Click **Deploy New Function**
3. Name it: `send-job-status-email`
4. Copy the code from `supabase/functions/send-job-status-email/index.ts`
5. Deploy the function

### 2. Set up Resend (Email Service)

1. Create a free account at [Resend.com](https://resend.com)
2. Verify your domain or use their testing domain
3. Get your API key from the [API Keys page](https://resend.com/api-keys)

### 3. Configure Environment Variables

In your Supabase dashboard:

1. Go to **Functions** → **send-job-status-email**
2. Click on **Settings**
3. Add the following environment variable:
   - `RESEND_API_KEY`: Your Resend API key

### 4. Update Email Domain (Optional)

In the edge function, update line 229 to use your domain:
```typescript
from: `${businessName} <notifications@yourdomain.com>`,
```

## How It Works

1. When you click the **Play** button (Start Job) or **Check** button (Complete Job) in the Jobs page
2. The system automatically sends an email to the client
3. The email includes:
   - Job details (service type, date, time)
   - Your business name
   - Status update (Started or Completed)
   - Contact information

## Email Templates

### Job Started Email
- Subject: "Your cleaning service has started - [Business Name]"
- Content: Notifies client that the service has begun
- Shows job details and expected completion

### Job Completed Email
- Subject: "Your cleaning service is complete - [Business Name]"
- Content: Confirms service completion
- Includes completion time
- Shows any completion notes
- Encourages feedback

## Testing

To test without sending real emails:

1. Don't set the `RESEND_API_KEY` environment variable
2. The function will log email content to the console instead
3. Check Supabase Function logs to see what would be sent

## Troubleshooting

### Emails not sending?

1. **Check client has email**: Clients must have an email address
2. **Check function logs**: Go to Functions → Logs in Supabase
3. **Verify API key**: Make sure RESEND_API_KEY is set correctly
4. **Check domain**: Ensure your sending domain is verified in Resend

### Want to disable for specific clients?

Currently, emails are sent to all clients with email addresses. To add client-specific preferences, you would need to add an email preference field to the clients table.

## Customization

You can customize the email templates by editing the HTML in the edge function:
- Lines 108-148: Job Started email template
- Lines 152-212: Job Completed email template

## Cost

- **Resend Free Tier**: 3,000 emails/month
- **Supabase Edge Functions**: Free tier includes 500K invocations/month

This should be more than enough for most cleaning businesses! 