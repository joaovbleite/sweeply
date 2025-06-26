const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase project credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zbtozsfnbmhvdzzypmrh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This should be the service_role key, not the anon key

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/20241201_create_tasks_table.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });

    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigration(); 