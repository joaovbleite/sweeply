# 📧 Email Notifications Setup Guide (Formspree)

This guide will help you set up automatic email notifications using Formspree that are sent to clients when job status changes to "Started" or "Completed".

## Features

- ✅ Automatic email when job is started (in_progress)
- ✅ Automatic email when job is completed
- ✅ Simple text-based email format
- ✅ Uses your business name from profile
- ✅ Respects client email notification preferences
- ✅ No HTML coding required

## Setup Steps

### 1. Create a Formspree Form

1. Go to [Formspree.io](https://formspree.io)
2. Sign up for a free account
3. Create a new form
4. Give it a name like "Sweeply Job Notifications"
5. Copy your form ID (it looks like `xyzabc123`)

### 2. Deploy the Edge Function

In your Supabase dashboard:

1. Go to **Functions** in the sidebar
2. Click **Deploy New Function**
3. Name it: `send-job-status-email`
4. Copy the code from `supabase/functions/send-job-status-email/index.ts`
5. Deploy the function

### 3. Configure Environment Variables

In your Supabase dashboard:

1. Go to **Functions** → **send-job-status-email**
2. Click on **Settings**
3. Add the following environment variable:
   - `FORMSPREE_FORM_ID`: Your Formspree form ID (without the 'f/' prefix)

## How It Works

1. When you click the **Play** button (Start Job) or **Check** button (Complete Job) in the Jobs page
2. The system automatically sends an email to the client through Formspree
3. The email includes:
   - Job details (service type, date, time)
   - Your business name
   - Status update (Started or Completed)
   - Contact information

## Email Templates

### Job Started Email
- Subject: "Your cleaning service has started - [Business Name]"
- Content: Plain text notification that the service has begun
- Shows job details and expected completion

### Job Completed Email
- Subject: "Your cleaning service is complete - [Business Name]"
- Content: Plain text confirmation of service completion
- Includes completion time
- Shows any completion notes
- Encourages feedback

## Formspree Benefits

1. **Simple Setup**: No domain verification required
2. **Free Tier**: 50 submissions/month free
3. **Clean Emails**: Formspree provides nice email templates
4. **Spam Protection**: Built-in spam filtering
5. **Email History**: View all sent emails in Formspree dashboard

## Testing

To test without sending real emails:

1. Don't set the `FORMSPREE_FORM_ID` environment variable
2. The function will log email content to the console instead
3. Check Supabase Function logs to see what would be sent

## Troubleshooting

### Emails not sending?

1. **Check client has email**: Clients must have an email address
2. **Check function logs**: Go to Functions → Logs in Supabase
3. **Verify form ID**: Make sure FORMSPREE_FORM_ID is set correctly (without 'f/' prefix)
4. **Check Formspree dashboard**: See if submissions are appearing there
5. **Verify Formspree limits**: Free tier allows 50 emails/month

### Want to disable for specific clients?

Currently, emails are sent to all clients with email addresses. To add client-specific preferences, you would need to add an email preference field to the clients table.

## Customization

You can customize the email content by editing the plain text templates in the edge function:
- Lines 103-117: Job Started email message
- Lines 119-134: Job Completed email message

## Cost

- **Formspree Free Tier**: 50 emails/month (perfect for testing)
- **Formspree Basic**: $8/month for 250 submissions
- **Formspree Pro**: $40/month for unlimited submissions
- **Supabase Edge Functions**: Free tier includes 500K invocations/month

For most small to medium cleaning businesses, the Formspree Basic plan should be sufficient! 