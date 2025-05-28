# Notifications System Migration Guide

## Overview
This guide will help you set up the real-time notifications system in your Sweeply app.

## Steps to Apply the Migration

### 1. Apply the Database Migration

Run the following command to apply the notifications system migration:

```bash
npx supabase db push
```

Or manually run the SQL in your Supabase SQL editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/008_create_notifications_system.sql`
4. Click "Run"

### 2. Verify the Migration

After running the migration, verify that the following were created:

- ✅ `notifications` table
- ✅ Indexes for performance
- ✅ RLS policies
- ✅ `create_notification()` function
- ✅ Triggers for automatic notifications:
  - `on_job_status_change` - Creates notifications when job status changes
  - `on_new_client` - Creates notifications when new clients are added
  - `on_invoice_status_change` - Creates notifications for invoice updates

### 3. Test the System

1. **Test Job Notifications:**
   - Create a new job → Should see "Job Scheduled" notification
   - Start a job → Should see "Job Started" notification
   - Complete a job → Should see "Job Completed" notification

2. **Test Client Notifications:**
   - Add a new client → Should see "New Client Added" notification

3. **Test Payment Notifications:**
   - Mark an invoice as paid → Should see "Payment Received" notification

### 4. Features Included

- **Real-time updates** - Notifications appear instantly without refresh
- **Unread counter** - Shows in the blue welcome box
- **Filtering** - Filter by type (job, payment, client, etc.)
- **Bulk actions** - Mark all as read, delete multiple
- **Priority levels** - High priority notifications show in red
- **Action buttons** - Quick links to view related items

### 5. Optional: Set Up Job Reminders

To enable 30-minute job reminders, you can set up a cron job in Supabase:

1. Go to Supabase Dashboard → Database → Extensions
2. Enable `pg_cron` extension
3. Run this SQL to create a cron job:

```sql
SELECT cron.schedule(
  'job-reminders',
  '*/5 * * * *', -- Run every 5 minutes
  $$SELECT create_job_reminders();$$
);
```

## Troubleshooting

If you encounter issues:

1. **Check RLS is enabled:** The notifications table has Row Level Security enabled
2. **Check user authentication:** Notifications are tied to authenticated users
3. **Check browser console:** Look for any JavaScript errors
4. **Verify triggers:** Make sure the database triggers were created successfully

## What's Next?

- The notification system is now fully functional
- Users will receive automatic notifications for important events
- Notifications persist in the database and can be managed by users
- Real-time updates keep users informed instantly 