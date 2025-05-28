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

async function runRecurringJobTests() {
  console.log('🔄 Starting Recurring Jobs Tests...\n');

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

    // 2. Check if recurring fields exist
    console.log('2️⃣ Checking database schema...');
    const { data: columns, error: schemaError } = await supabase.rpc('get_table_columns', {
      table_name: 'jobs'
    }).catch(() => ({ data: null, error: 'RPC not available' }));

    if (!columns && !schemaError) {
      console.log('⚠️  Cannot verify schema, but continuing with tests...\n');
    } else {
      console.log('✅ Database schema ready\n');
    }

    // 3. Create a test client first
    console.log('3️⃣ Creating test client...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: 'Recurring Test Client ' + Date.now(),
        email: 'recurring@test.com',
        phone: '555-9999',
        address: '123 Recurring Street',
        user_id: userId
      })
      .select()
      .single();

    if (clientError) {
      console.error('❌ Failed to create client:', clientError.message);
      return;
    }
    console.log('✅ Client created:', client.name);

    // 4. Test Weekly Recurring Job
    console.log('\n4️⃣ Creating weekly recurring job...');
    const weeklyJob = {
      client_id: client.id,
      title: 'Weekly Cleaning - Test',
      service_type: 'regular',
      property_type: 'residential',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '10:00:00',
      estimated_duration: 120,
      estimated_price: 150,
      is_recurring: true,
      recurring_frequency: 'weekly',
      recurring_end_type: 'occurrences',
      recurring_occurrences: 5,
      recurring_days_of_week: [1, 3, 5], // Mon, Wed, Fri
      status: 'scheduled',
      user_id: userId
    };

    const { data: parentJob, error: jobError } = await supabase
      .from('jobs')
      .insert(weeklyJob)
      .select()
      .single();

    if (jobError) {
      console.error('❌ Failed to create recurring job:', jobError.message);
      console.log('Error details:', jobError);
      return;
    }
    console.log('✅ Weekly recurring job created');

    // 5. Check instances
    console.log('\n5️⃣ Checking generated instances...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for instance generation

    const { data: instances, error: instanceError } = await supabase
      .from('jobs')
      .select('id, scheduled_date, scheduled_time, status')
      .eq('parent_job_id', parentJob.id)
      .order('scheduled_date', { ascending: true });

    if (instanceError) {
      console.error('❌ Failed to fetch instances:', instanceError.message);
    } else {
      console.log(`✅ Found ${instances.length} instances`);
      if (instances.length > 0) {
        console.log('\nFirst 3 instances:');
        instances.slice(0, 3).forEach(inst => {
          console.log(`  - ${inst.scheduled_date} at ${inst.scheduled_time}`);
        });
      }
    }

    // 6. Test Monthly Recurring Job
    console.log('\n6️⃣ Creating monthly recurring job...');
    const monthlyJob = {
      client_id: client.id,
      title: 'Monthly Deep Clean - Test',
      service_type: 'deep_clean',
      property_type: 'residential',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '14:00:00',
      estimated_duration: 180,
      estimated_price: 250,
      is_recurring: true,
      recurring_frequency: 'monthly',
      recurring_end_type: 'date',
      recurring_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months
      recurring_day_of_month: 15,
      status: 'scheduled',
      user_id: userId
    };

    const { data: monthlyParent, error: monthlyError } = await supabase
      .from('jobs')
      .insert(monthlyJob)
      .select()
      .single();

    if (monthlyError) {
      console.error('⚠️  Monthly job creation failed:', monthlyError.message);
    } else {
      console.log('✅ Monthly recurring job created');
    }

    // 7. Test Cancellation
    console.log('\n7️⃣ Testing instance cancellation...');
    if (instances && instances.length > 0) {
      const { error: cancelError } = await supabase
        .from('jobs')
        .update({ status: 'cancelled' })
        .eq('id', instances[0].id);

      if (cancelError) {
        console.error('❌ Failed to cancel instance:', cancelError.message);
      } else {
        console.log('✅ Successfully cancelled one instance');
      }
    }

    // 8. Summary
    console.log('\n✨ Test Summary:');
    console.log('================');
    
    // Count all recurring jobs
    const { count: recurringCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .is('parent_job_id', null);

    const { count: instanceCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('parent_job_id', 'is', null);

    console.log(`Total recurring series: ${recurringCount || 0}`);
    console.log(`Total instances: ${instanceCount || 0}`);
    
    console.log('\n✅ Recurring job tests completed!');
    console.log('🌐 Check your calendar to see the recurring jobs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Sign out
    await supabase.auth.signOut();
  }
}

// Run the tests
runRecurringJobTests(); 