# Sweeply System Test Checklist

## 🔔 Notifications System Tests

### ✅ Database Setup
- [ ] Run migration: `npx supabase db push`
- [ ] Verify `notifications` table created
- [ ] Verify triggers created:
  - `on_job_status_change`
  - `on_new_client`
  - `on_invoice_status_change`

### ✅ Real-Time Notifications
1. **Job Status Notifications**
   - [ ] Create a new job → Should see "Job Scheduled" notification
   - [ ] Click "Start Job" → Should see "Job Started" notification
   - [ ] Click "Complete Job" → Should see "Job Completed" notification
   - [ ] Cancel a job → Should see "Job Cancelled" notification

2. **Client Notifications**
   - [ ] Add a new client → Should see "New Client Added" notification

3. **Invoice Notifications**
   - [ ] Mark invoice as paid → Should see "Payment Received" notification
   - [ ] Invoice becomes overdue → Should see "Invoice Overdue" notification

### ✅ UI Features
- [ ] Unread count shows in blue welcome box (updates in real-time)
- [ ] Bell icon shows number badge when unread > 0
- [ ] Notifications page loads without errors
- [ ] Filter by type works (Job, Payment, Client, etc.)
- [ ] Mark as Read works for individual notifications
- [ ] Mark All as Read works
- [ ] Delete notification works
- [ ] Bulk delete works with checkboxes
- [ ] Action links navigate to correct pages

## 💼 Jobs Page Tests

### ✅ Job Management
1. **Basic Operations**
   - [ ] Jobs page loads without errors
   - [ ] Statistics show correct counts (only parent jobs, not instances)
   - [ ] Create new job works
   - [ ] Edit job works
   - [ ] Delete job works (if implemented)

2. **Status Updates**
   - [ ] Start Job (Scheduled → In Progress) works
   - [ ] Complete Job (In Progress → Completed) works
   - [ ] Cancel Job works
   - [ ] Status updates trigger notifications

3. **Filtering & Search**
   - [ ] Search by job title works
   - [ ] Search by client name works
   - [ ] Search by description works
   - [ ] Search by address works
   - [ ] Filter by status works
   - [ ] Filter by service type works
   - [ ] Filter by recurring/one-time works
   - [ ] Date range filters work
   - [ ] Clear filters works

4. **Recurring Jobs**
   - [ ] Recurring jobs show purple badge
   - [ ] "Recurring Series" filter shows only parent jobs
   - [ ] Recurring instances are hidden by default
   - [ ] Manage Recurring Series button opens modal

5. **Bulk Actions**
   - [ ] Select multiple jobs works
   - [ ] Select all checkbox works
   - [ ] Bulk status update works
   - [ ] Create invoice from selected jobs works
   - [ ] Clear selection works

6. **Visual Indicators**
   - [ ] Overdue jobs show red background
   - [ ] Overdue counter appears when jobs are late
   - [ ] Status badges have correct colors
   - [ ] Revenue calculation is accurate

## 🐛 Common Issues to Check

### Notifications
- [ ] Notifications appear for YOUR actions (not just other users)
- [ ] No duplicate notifications
- [ ] Notifications persist after page refresh
- [ ] Real-time updates work without refresh

### Jobs
- [ ] Recurring instances don't inflate statistics
- [ ] Calendar shows all instances (uses getAllWithInstances)
- [ ] Other pages show only parent jobs
- [ ] Invoice creation validates same client
- [ ] Price calculations are correct

## 🔧 Troubleshooting

If notifications aren't working:
1. Check browser console for errors
2. Verify user is authenticated
3. Check Supabase logs for trigger errors
4. Ensure RLS policies are active

If jobs aren't updating:
1. Check network tab for API errors
2. Verify jobsApi methods are called
3. Check for console errors
4. Ensure proper permissions

## 📝 Test Data Creation

Create test scenarios:
1. Create 5 one-time jobs with different statuses
2. Create 2 recurring weekly jobs
3. Create 1 overdue job (past date, scheduled status)
4. Create jobs for 3 different clients
5. Complete some jobs to test revenue calculation

## ✨ Success Criteria

The system is working properly when:
- All notifications appear instantly
- Job statistics are accurate
- Filters and search work correctly
- No console errors appear
- UI updates reflect database changes immediately 