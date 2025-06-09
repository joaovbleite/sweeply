import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = 'https://zbtozsfnbmhvdzzypmrh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidG96c2ZuYm1odmR6enlwbXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODIxOTkxNCwiZXhwIjoyMDYzNzk1OTE0fQ.TgCq9SuQgReaU5J0a571i7qbUzNHPCEagZtK3ltkY-8';

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyQuotesTable() {
  try {
    console.log('Verifying quotes table...');
    
    // Check if quotes table exists by querying its structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('quotes')
      .select('id')
      .limit(1);
    
    if (tableError) {
      if (tableError.code === '42P01') {
        console.error('❌ The quotes table does not exist:', tableError.message);
        return false;
      } else {
        console.error('❌ Error checking quotes table:', tableError.message);
        return false;
      }
    }
    
    console.log('✅ The quotes table exists!');
    
    // Get a valid user ID
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Could not find a valid user:', usersError?.message || 'No users found');
      return false;
    }
    
    const userId = users[0].user_id;
    console.log('✅ Found valid user ID:', userId);
    
    // Get a valid client ID
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      console.error('❌ Could not find a valid client:', clientsError?.message || 'No clients found');
      return false;
    }
    
    const clientId = clients[0].id;
    console.log('✅ Found valid client ID:', clientId);
    
    // Create a test quote with worker field to check if the field exists
    const testQuote = {
      user_id: userId,
      client_id: clientId,
      title: 'Test Quote',
      status: 'draft',
      total_amount: 100,
      line_items: [],
      worker: 'Test Worker'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('quotes')
      .insert([testQuote])
      .select();
    
    if (insertError) {
      console.error('❌ Could not insert test quote:', insertError.message);
      
      // Check if the error is related to the worker field
      if (insertError.message.includes('worker')) {
        console.error('❌ The worker field does not exist in the quotes table.');
      }
      
      return false;
    }
    
    console.log('✅ Successfully inserted test quote with worker field!');
    console.log('Test quote ID:', insertData[0].id);
    
    // Verify the worker field was saved correctly
    const { data: fetchedQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', insertData[0].id)
      .single();
    
    if (fetchError) {
      console.error('❌ Could not fetch test quote:', fetchError.message);
      return false;
    }
    
    if (fetchedQuote.worker === 'Test Worker') {
      console.log('✅ The worker field exists and is working correctly!');
    } else {
      console.error('❌ The worker field was not saved correctly.');
      return false;
    }
    
    // Clean up - delete the test quote
    const { error: deleteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.error('⚠️ Could not delete test quote:', deleteError.message);
    } else {
      console.log('✅ Successfully deleted test quote.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Execute the verification
verifyQuotesTable()
  .then(success => {
    if (success) {
      console.log('✅ Quotes table verification completed successfully!');
      process.exit(0);
    } else {
      console.error('❌ Quotes table verification failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Verification process failed:', error.message);
    process.exit(1);
  }); 