# Calendar System Test Checklist

## 🗓️ Calendar Page Integration Tests

### ✅ Basic Calendar Functionality
- [ ] Calendar loads without errors
- [ ] Week view displays 7 days correctly
- [ ] Time slots from 8am to 6pm are visible
- [ ] Current day is highlighted
- [ ] Week navigation (previous/next) works
- [ ] "Today" button returns to current week
- [ ] Week dates display correctly in header

### ✅ Job Display
- [ ] Jobs appear in correct time slots
- [ ] Job colors match status (gray=scheduled, blue=in progress, green=completed, red=cancelled)
- [ ] Property type indicators work (blue border=residential, orange=commercial)
- [ ] Multiple jobs in same slot stack properly
- [ ] Client names display on jobs
- [ ] Job titles/service types show when space allows
- [ ] Status icons appear on jobs

### ✅ Interactive Features
1. **Click Actions**
   - [ ] Clicking empty slot opens Quick Job Modal
   - [ ] Clicking job opens Job Details Modal
   - [ ] Clicking job in "Recent Activity" opens details
   - [ ] Selected date highlights when clicked

2. **Drag & Drop**
   - [ ] Jobs can be dragged to different time slots
   - [ ] Jobs can be dragged to different days
   - [ ] Visual feedback during drag (opacity change)
   - [ ] Drop zones highlight on hover
   - [ ] Job updates in database after drop
   - [ ] Success toast shows after rescheduling

3. **Modals**
   - [ ] Quick Job Modal opens from "New Job" button
   - [ ] Quick Job Modal pre-fills selected date/time
   - [ ] Job Details Modal shows all job information
   - [ ] Status can be changed from Job Details Modal
   - [ ] Edit button navigates to edit page
   - [ ] Delete confirmation works
   - [ ] Duplicate job creates copy with today's date

### ✅ Real-Time Updates
- [ ] New jobs appear immediately when created
- [ ] Job updates reflect instantly
- [ ] Job deletions remove from calendar
- [ ] Toast notifications appear for changes
- [ ] Other users' changes appear in real-time

### ✅ Search & Filters
- [ ] Search by job title works
- [ ] Search by client name works
- [ ] Search by description works
- [ ] Search by address works
- [ ] Property type filter works (All/Residential/Commercial)
- [ ] Filtered results update calendar view
- [ ] Search is case-insensitive

### ✅ Keyboard Shortcuts
- [ ] Ctrl/Cmd + ← = Previous week
- [ ] Ctrl/Cmd + → = Next week
- [ ] Ctrl/Cmd + T = Go to today
- [ ] Ctrl/Cmd + N = New job
- [ ] Ctrl/Cmd + R = Refresh
- [ ] Escape = Close modals
- [ ] Shortcuts disabled when typing in inputs

### ✅ Statistics & Summary
- [ ] Today's job count is accurate
- [ ] In Progress count is correct
- [ ] Completed count is correct
- [ ] Week revenue calculation is accurate
- [ ] Completion rate percentage is correct
- [ ] Job count updates with filters

### ✅ Map View Toggle
- [ ] Map button toggles map view
- [ ] Map view shows job count with addresses
- [ ] Today's jobs with addresses list in order
- [ ] Map placeholder displays correctly

### ✅ Integration with Other Pages

1. **From Dashboard**
   - [ ] Calendar widget navigates to calendar
   - [ ] Today's schedule shows correct jobs

2. **From Jobs Page**
   - [ ] Jobs created appear on calendar
   - [ ] Status updates reflect on calendar
   - [ ] Recurring job instances show correctly

3. **From Clients Page**
   - [ ] Client jobs show on calendar
   - [ ] Client names display correctly

4. **With Notifications**
   - [ ] Job status changes trigger notifications
   - [ ] New job notifications link to calendar

### ✅ Edge Cases
- [ ] Empty calendar displays properly
- [ ] Handles jobs without times (default to 8am)
- [ ] Handles jobs without addresses
- [ ] Handles deleted clients (shows "Unknown Client")
- [ ] Handles very long job titles (truncation)
- [ ] Multiple jobs at same time display correctly

### ✅ Performance
- [ ] Calendar loads quickly with many jobs
- [ ] Week navigation is smooth
- [ ] Drag and drop is responsive
- [ ] Search doesn't lag
- [ ] Real-time updates don't cause flicker

### ✅ Visual Polish
- [ ] Hover states work on all interactive elements
- [ ] Transitions are smooth
- [ ] Loading states display properly
- [ ] Error states are handled gracefully
- [ ] Responsive design works on smaller screens

## 🐛 Common Issues to Check

1. **Time Zone Issues**
   - [ ] Jobs display in correct time zone
   - [ ] Time conversions work properly

2. **Data Integrity**
   - [ ] Recurring job instances display correctly
   - [ ] Parent jobs don't show when instances exist
   - [ ] Deleted jobs disappear immediately

3. **Permissions**
   - [ ] Only user's jobs are visible
   - [ ] Can't drag/edit other users' jobs

## 🔧 Troubleshooting

If calendar isn't working:
1. Check browser console for errors
2. Verify API endpoints are responding
3. Check Supabase real-time is connected
4. Ensure proper authentication
5. Clear browser cache if needed

## 📝 Test Scenarios

1. **Busy Day Test**
   - Create 10+ jobs on same day
   - Verify all display correctly
   - Test scrolling if needed

2. **Drag & Drop Test**
   - Drag job to different day
   - Drag job to occupied slot
   - Drag multiple jobs quickly

3. **Real-Time Test**
   - Open calendar in two tabs
   - Create job in one tab
   - Verify appears in other tab

4. **Search Test**
   - Search for specific client
   - Clear search
   - Search while filtered

## ✨ Success Criteria

The calendar is fully integrated when:
- All interactive features work smoothly
- Real-time updates happen instantly
- Performance remains fast with many jobs
- User experience is intuitive
- No console errors during normal use 