# Quick Test Guide for Sweeply Notifications

## 🚀 Fastest Way to Test

### 1. First-time setup (only once):
```bash
npm install @supabase/supabase-js dotenv
```

### 2. Update test credentials:
Edit `test-notifications.js` and update these lines:
```javascript
const TEST_EMAIL = 'your-email@example.com'; // YOUR LOGIN EMAIL
const TEST_PASSWORD = 'your-password'; // YOUR LOGIN PASSWORD
```

### 3. Run the test:
```bash
node test-notifications.js
```

## 📋 What the Test Does:

1. ✅ Logs in with your credentials
2. ✅ Checks if notifications system is set up
3. ✅ Creates a test client (triggers notification)
4. ✅ Creates a test job (triggers notification)
5. ✅ Updates job status (triggers notification)
6. ✅ Shows unread count
7. ✅ Lists recent notifications

## ⚠️ Prerequisites:

- Make sure you've run the notifications migration:
  ```bash
  npx supabase db push
  ```
- Your app should be running on http://localhost:4001

## 🎯 Expected Output:

```
🚀 Starting Automated Notification Tests...

1️⃣ Signing in...
✅ Signed in successfully

2️⃣ Checking notifications system...
✅ Notifications system is set up

3️⃣ Creating test client...
✅ Client created: Test Client 1234567890

4️⃣ Creating test job...
✅ Job created: Test Cleaning Job

5️⃣ Updating job status to in_progress...
✅ Job notification received: Job Started

📊 Unread notifications: 3

✨ Test Summary:
================
Total notifications: 3

Recent notifications:
- Job Started (job) - Unread
- Job Scheduled (job) - Unread
- New Client Added (client) - Unread

✅ Tests completed! Check your app to see the notifications.
🌐 Open http://localhost:4001/notifications to view them
```

## 🔍 Manual Check:

After running the test, open your app and check:
1. Blue welcome box shows unread count
2. Notifications page shows the test notifications
3. Bell icon has a badge with the count

## 🧹 Cleanup:

The test creates:
- 1 test client (named "Test Client {timestamp}")
- 1 test job

You can delete these from your app after testing. 