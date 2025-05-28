# Recurring Jobs Test Guide

## 🔄 Complete Recurring Job Features Test

### ✅ Database Setup
1. **Check Migration Status**
   ```sql
   -- Run in Supabase SQL editor to verify fields exist
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'jobs' 
   AND column_name LIKE 'recurring%';
   ```
   
   Expected columns:
   - recurring_frequency
   - recurring_end_date
   - recurring_days_of_week
   - recurring_day_of_month
   - recurring_occurrences
   - recurring_end_type

### ✅ Creating Recurring Jobs

#### Test 1: Weekly Recurring Job
1. Go to Create New Job page
2. Fill in basic job details
3. Toggle "Recurring" switch ON
4. Select "Weekly" frequency
5. Select specific days (e.g., Mon, Wed, Fri)
6. Set end type to "Never"
7. Create the job
8. **Verify**: 
   - Parent job created with is_recurring = true
   - Job appears on calendar on selected days
   - Multiple instances generated for next 3 months

#### Test 2: Biweekly Recurring Job
1. Create new job with "Biweekly" frequency
2. Set start date to a Monday
3. Set end type to "After X occurrences" (e.g., 10)
4. **Verify**:
   - Jobs appear every 2 weeks
   - Exactly 10 instances created
   - No instances after 10th occurrence

#### Test 3: Monthly Recurring Job
1. Create job with "Monthly" frequency
2. Set specific day of month (e.g., 15th)
3. Set end type to "On date" (3 months from now)
4. **Verify**:
   - Jobs appear on 15th of each month
   - No jobs after end date
   - Handles months with fewer days correctly

#### Test 4: Quarterly Recurring Job
1. Create job with "Quarterly" frequency
2. **Verify**:
   - Jobs appear every 3 months
   - Correct date calculations

### ✅ Managing Recurring Series

#### Test 5: Recurring Job Manager Modal
1. Go to Jobs page
2. Find a recurring job (purple badge)
3. Click "Manage Recurring Series"
4. **Verify Modal Shows**:
   - List of all instances
   - Checkbox for each instance
   - Status of each instance
   - Dates in chronological order

#### Test 6: Cancel Selected Instances
1. In Recurring Job Manager, select 2-3 future instances
2. Click "Cancel Selected"
3. Confirm the action
4. **Verify**:
   - Selected instances status = 'cancelled'
   - Other instances unchanged
   - Calendar updated immediately

#### Test 7: Cancel Entire Series
1. Click "Cancel Entire Series" button
2. Confirm the action
3. **Verify**:
   - All future instances cancelled
   - Parent job is_recurring = false
   - Past/completed instances unchanged
   - No new instances generated

### ✅ Editing Recurring Jobs

#### Test 8: Edit Single Instance
1. From calendar, click a recurring job instance
2. Edit details (e.g., change time)
3. Save changes
4. **Verify**:
   - Only that instance updated
   - Other instances unchanged
   - Parent job unchanged

#### Test 9: Edit from Jobs Page
1. Go to Jobs page
2. Edit a recurring parent job
3. Change service type or price
4. **Verify**:
   - Changes apply to parent only
   - Future instances may need manual update
   - Recurring pattern preserved

### ✅ Calendar Integration

#### Test 10: Calendar Display
1. Navigate to Calendar page
2. **Verify Recurring Jobs**:
   - All instances appear in correct time slots
   - Drag & drop works for instances
   - Property type indicators show correctly
   - Status colors are accurate

#### Test 11: Quick Job Modal
1. Click empty calendar slot
2. Create recurring job from Quick Job Modal
3. **Verify**:
   - Recurring option available
   - Pattern component appears when toggled
   - Job created successfully

### ✅ Real-time Updates

#### Test 12: Multi-tab Testing
1. Open app in two browser tabs
2. Create recurring job in tab 1
3. **Verify in tab 2**:
   - Jobs page updates
   - Calendar shows new instances
   - Notifications appear

### ✅ Edge Cases

#### Test 13: End of Month Handling
1. Create monthly job on 31st
2. **Verify February behavior**:
   - Job scheduled on 28th/29th
   - March job back on 31st

#### Test 14: Past Date Handling
1. Try to create recurring job with past start date
2. **Verify**:
   - Warning or prevention
   - Only future instances created

#### Test 15: Large Series
1. Create weekly job for 1 year (52 instances)
2. **Verify**:
   - Performance remains good
   - All instances created
   - UI remains responsive

### ✅ Data Integrity

#### Test 16: Parent-Child Relationships
```sql
-- Check parent-child relationships
SELECT 
  p.id as parent_id,
  p.title as parent_title,
  COUNT(c.id) as instance_count
FROM jobs p
LEFT JOIN jobs c ON c.parent_job_id = p.id
WHERE p.is_recurring = true
GROUP BY p.id, p.title;
```

#### Test 17: Orphaned Instances
```sql
-- Find orphaned instances
SELECT * FROM jobs 
WHERE parent_job_id IS NOT NULL 
AND parent_job_id NOT IN (SELECT id FROM jobs WHERE is_recurring = true);
```

### ✅ Performance Tests

#### Test 18: Loading Performance
1. Create 10 different recurring series
2. Navigate between pages
3. **Verify**:
   - Jobs page loads quickly
   - Calendar renders smoothly
   - Search/filter responsive

### 🐛 Common Issues to Check

1. **Timezone Issues**
   - Jobs appear on wrong days
   - Time calculations off by hours

2. **Instance Generation**
   - Missing instances
   - Duplicate instances
   - Instances beyond end date

3. **UI State**
   - Toggle switch not updating
   - Pattern component not showing
   - Preview not updating

### 🔧 Troubleshooting

If recurring jobs aren't working:

1. **Check Browser Console**
   ```javascript
   // Look for errors like:
   // - "recurring_frequency" cannot be null
   // - Failed to generate instances
   ```

2. **Check Database**
   ```sql
   -- Verify parent job
   SELECT * FROM jobs WHERE id = 'job-id-here';
   
   -- Check instances
   SELECT * FROM jobs WHERE parent_job_id = 'job-id-here';
   ```

3. **Check API Calls**
   - Network tab → Filter by "jobs"
   - Look for 400/500 errors
   - Check request payload

### ✅ Success Criteria

The recurring job system is fully functional when:

1. ✨ **Creation Works**
   - All frequency types create correct instances
   - End conditions respected
   - Pattern preview accurate

2. 📅 **Calendar Integration**
   - All instances visible
   - Drag & drop works
   - Real-time updates

3. 🔧 **Management Works**
   - Can cancel individual instances
   - Can cancel entire series
   - Can edit without breaking recurrence

4. 🚀 **Performance Good**
   - No lag with many instances
   - Quick page loads
   - Smooth UI interactions

5. 🔒 **Data Integrity**
   - No orphaned instances
   - Parent-child relationships intact
   - No duplicate instances 