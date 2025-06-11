import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbtozsfnbmhvdzzypmrh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidG96c2ZuYm1odmR6enlwbXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMTk5MTQsImV4cCI6MjA2Mzc5NTkxNH0.1Dxhvt6d_86aWEMKw-hzSWqlNTHk9eHGB1DXHJgZA2E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  console.log('Attempting to apply migration...');
  
  try {
    // Get a service role token by logging in with admin credentials
    console.log('You need to provide admin credentials to apply the migration');
    const email = process.argv[2];
    const password = process.argv[3];
    
    if (!email || !password) {
      console.error('Usage: node apply-migration.js <admin_email> <admin_password>');
      process.exit(1);
    }
    
    // Sign in with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    console.log('Authentication successful');
    
    // The migration SQL
    const migrationSql = `
      -- Add line_items column to jobs table for itemized services
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'::jsonb;
      
      COMMENT ON COLUMN jobs.line_items IS 'Array of line items with description, quantity, and price';
      
      -- Update function to handle line items in the total price calculation
      CREATE OR REPLACE FUNCTION calculate_job_total_from_line_items()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calculate total from line items if they exist
        IF NEW.line_items IS NOT NULL AND jsonb_array_length(NEW.line_items) > 0 THEN
          -- Sum up price * quantity for each line item
          NEW.estimated_price = (
            SELECT COALESCE(SUM((item->>'price')::decimal * COALESCE((item->>'quantity')::integer, 1)), 0)
            FROM jsonb_array_elements(NEW.line_items) AS item
          );
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Create trigger to automatically calculate estimated price from line items
      DROP TRIGGER IF EXISTS calculate_job_price_from_line_items ON jobs;
      CREATE TRIGGER calculate_job_price_from_line_items
        BEFORE INSERT OR UPDATE OF line_items ON jobs
        FOR EACH ROW
        EXECUTE FUNCTION calculate_job_total_from_line_items();
    `;
    
    // Apply the migration using a raw SQL query
    const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', { 
      sql_string: migrationSql
    });
    
    if (sqlError) {
      throw new Error(`Migration failed: ${sqlError.message}`);
    }
    
    console.log('Migration applied successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration(); 