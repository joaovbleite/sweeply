const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials - update these with your test account
const TEST_EMAIL = 'test@example.com'; // UPDATE THIS
const TEST_PASSWORD = 'testpassword123'; // UPDATE THIS

async function runTests() {
  console.log('🚀 Starting Automated Notification Tests...\n');

  try {
    // 1. Sign in
    console.log('1️⃣ Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (authError) {
      console.error('❌ Auth failed:', authError.message);
      console.log('\n⚠️  Please update TEST_EMAIL and TEST_PASSWORD in this script');
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Signed in successfully\n');

    // 2. Check if notifications table exists
    console.log('2️⃣ Checking notifications system...');
    const { data: notifCheck, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (notifError) {
      console.error('❌ Notifications table not found!');
      console.log('⚠️  Please run the migration: npx supabase db push');
      return;
    }
    console.log('✅ Notifications system is set up\n');

    // 3. Create a test client (should trigger notification)
    console.log('3️⃣ Creating test client...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: 'Test Client ' + new Date().getTime(),
        email: 'testclient@example.com',
        phone: '555-0123',
        address: '123 Test Street',
        user_id: userId
      })
      .select()
      .single();

    if (clientError) {
      console.error('❌ Failed to create client:', clientError.message);
      return;
    }
    console.log('✅ Client created:', client.name);

    // 4. Wait and check for notification
    console.log('⏳ Waiting for notification...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: clientNotif } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'client')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (clientNotif) {
      console.log('✅ Client notification received:', clientNotif.title);
    } else {
      console.log('⚠️  No client notification found');
    }

    // 5. Create a test job (should trigger notification)
    console.log('\n4️⃣ Creating test job...');
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        title: 'Test Cleaning Job',
        client_id: client.id,
        service_type: 'regular',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '14:00:00',
        status: 'scheduled',
        estimated_price: 150,
        user_id: userId
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Failed to create job:', jobError.message);
      return;
    }
    console.log('✅ Job created:', job.title);

    // 6. Update job status (should trigger notification)
    console.log('\n5️⃣ Updating job status to in_progress...');
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ status: 'in_progress' })
      .eq('id', job.id);

    if (updateError) {
      console.error('❌ Failed to update job:', updateError.message);
      return;
    }

    // Wait and check for notification
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: jobNotif } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'job')
      .eq('metadata->>job_id', job.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (jobNotif) {
      console.log('✅ Job notification received:', jobNotif.title);
    } else {
      console.log('⚠️  No job notification found');
    }

    // 7. Get unread count
    console.log('\n6️⃣ Checking unread notifications...');
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    console.log(`📊 Unread notifications: ${count}`);

    // 8. Summary
    console.log('\n✨ Test Summary:');
    console.log('================');
    const { data: allNotifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (allNotifs && allNotifs.length > 0) {
      console.log(`Total notifications: ${allNotifs.length}`);
      console.log('\nRecent notifications:');
      allNotifs.slice(0, 5).forEach(n => {
        console.log(`- ${n.title} (${n.type}) - ${n.read ? 'Read' : 'Unread'}`);
      });
    }

    console.log('\n✅ Tests completed! Check your app to see the notifications.');
    console.log('🌐 Open http://localhost:4001/notifications to view them');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Sign out
    await supabase.auth.signOut();
  }
}

// Run the tests
runTests(); 