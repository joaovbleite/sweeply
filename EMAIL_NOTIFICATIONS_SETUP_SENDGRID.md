# 📧 Email Notifications Setup Guide (SendGrid)

This guide will help you set up automatic email notifications using SendGrid that are sent to clients when job status changes to "Started" or "Completed".

## Why SendGrid?

- ✅ **Industry Standard**: Used by companies like Uber, Airbnb, and Spotify
- ✅ **Free Tier**: 100 emails/day forever free
- ✅ **Great Deliverability**: 99%+ inbox placement
- ✅ **Beautiful HTML Emails**: Professional appearance
- ✅ **Simple Setup**: 5-minute integration

## Features

- ✅ Automatic email when job is started (in_progress)
- ✅ Automatic email when job is completed  
- ✅ Beautiful HTML email templates with fallback to plain text
- ✅ Uses your business name from profile
- ✅ Respects client email notification preferences
- ✅ Professional appearance with your branding

## Setup Steps

### 1. Create a SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Click "Start for Free"
3. Fill out the signup form
4. Verify your email address

### 2. Get Your API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Give it a name like "Sweeply Notifications"
4. Select **Full Access** (or **Restricted Access** with Mail Send permissions)
5. Click **Create & View**
6. **Copy the API key** (you won't see it again!)

### 3. Verify Your Sender Email (Important!)

1. Go to **Settings** → **Sender Authentication**
2. Choose one option:
   - **Domain Authentication** (Recommended for production)
   - **Single Sender Verification** (Quick setup for testing)
3. For Single Sender:
   - Click **Verify a Single Sender**
   - Enter your email details
   - Verify the email sent to you

### 4. Deploy the Edge Function

In your Supabase dashboard:

1. Go to **Functions** in the sidebar
2. Click **Deploy New Function**
3. Name it: `send-job-status-email`
4. Copy the code from `supabase/functions/send-job-status-email/index.ts`
5. Deploy the function

### 5. Configure Environment Variables

In your Supabase dashboard:

1. Go to **Functions** → **send-job-status-email**
2. Click on **Settings**
3. Add these environment variables:
   - `SENDGRID_API_KEY`: Your SendGrid API key from step 2
   - `SENDGRID_FROM_EMAIL`: Your verified sender email (e.g., notifications@yourdomain.com)

## Email Templates

### Job Started Email
- Clean, professional design with your business branding
- Yellow "Started" badge
- All job details clearly displayed
- Mobile-responsive design

### Job Completed Email
- Green "Completed" badge
- Completion time included
- Service notes displayed in highlighted box
- Encourages customer feedback

## Testing Your Setup

1. Create a test job in your Sweeply app
2. Click the **Play** button to start the job
3. Check the client's email inbox
4. Click the **Check** button to complete the job
5. Verify the completion email arrives

## Monitoring & Analytics

In SendGrid dashboard, you can see:
- **Email Activity**: Track delivered, opened, clicked emails
- **Statistics**: View delivery rates, engagement metrics
- **Suppressions**: Manage bounces and unsubscribes

## Troubleshooting

### Emails not sending?

1. **Check API Key**: Ensure it's correctly set in Supabase
2. **Verify Sender**: Make sure sender email is verified
3. **Check Function Logs**: 
   - Supabase Dashboard → Functions → Logs
4. **SendGrid Activity Feed**: 
   - SendGrid Dashboard → Activity → Filter by email

### Common Issues:

- **"Sender not verified"**: Complete sender verification in SendGrid
- **"API key invalid"**: Double-check the API key in environment variables
- **Emails in spam**: Complete domain authentication for better deliverability

## Cost

- **Free Forever**: 100 emails/day (3,000/month)
- **Essentials Plan**: $19.95/month for 50,000 emails
- **Pro Plan**: Higher volumes with advanced features

For most cleaning businesses, the free tier is more than enough!

## Advanced Features (Optional)

### Custom Domain
Set up domain authentication for:
- Better deliverability
- Your domain in "from" address
- No "via sendgrid.net" label

### Email Templates
You can customize the templates in the edge function:
- Lines 108-142: Job Started HTML template
- Lines 144-147: Job Started plain text
- Lines 151-188: Job Completed HTML template
- Lines 190-193: Job Completed plain text

### Dynamic Templates
SendGrid also supports dynamic templates created in their UI for even easier customization.

## Support

- **SendGrid Docs**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **Support**: Available even on free plan
- **Status Page**: [status.sendgrid.com](https://status.sendgrid.com) 