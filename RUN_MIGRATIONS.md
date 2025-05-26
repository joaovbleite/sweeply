# 🗄️ Database Migration Guide for Sweeply

## The Issue
Your Supabase database is missing the required tables (`invoices`, `jobs`, `clients`, `employees`). This is why you're seeing errors like "relation public.invoices does not exist".

## Quick Solution - Run Migrations in Supabase Dashboard

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your Sweeply project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run Migrations in Order

⚠️ **IMPORTANT**: Run these SQL files in this exact order:

1. **First, create the `update_updated_at_column` function** (required by all tables):
```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

2. **Run `001_create_clients_table.sql`**
   - Copy the entire contents of `supabase/migrations/001_create_clients_table.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Run `002_create_jobs_table.sql`**
   - Copy the entire contents of `supabase/migrations/002_create_jobs_table.sql`
   - Paste into SQL Editor
   - Click "Run"

4. **Run `003_create_invoices_table.sql`**
   - Copy the entire contents of `supabase/migrations/003_create_invoices_table.sql`
   - Paste into SQL Editor
   - Click "Run"

5. **Run `004_create_employees_tables.sql`** (optional for now)
   - Copy the entire contents of `supabase/migrations/004_create_employees_tables.sql`
   - Paste into SQL Editor
   - Click "Run"

### Step 3: Verify Tables Were Created
1. Go to **Table Editor** in the left sidebar
2. You should now see:
   - `clients` table
   - `jobs` table
   - `invoices` table
   - `employees`, `teams`, `schedules` tables (if you ran migration 4)

### Step 4: Test Your Dashboard
1. Refresh your Sweeply dashboard at `sweeplypro.com/dashboard`
2. The errors should be gone!

## Alternative: Run All at Once

If you prefer, you can run all migrations in one go. Create a new query in SQL Editor and run:

```sql
-- First, create the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Then run each migration file content here
-- (Copy and paste the contents of each .sql file in order)
```

## Troubleshooting

### If you get "permission denied" errors:
- Make sure you're logged into the correct Supabase project
- Check that you have admin/owner permissions

### If you get "relation already exists" errors:
- Some tables may already exist
- You can check existing tables in Table Editor
- Skip the migrations for tables that already exist

### If the dashboard still shows errors after migrations:
1. Clear your browser cache
2. Check the browser console for new error messages
3. Ensure your environment variables are correct in Vercel

## Next Steps

After running migrations:
1. ✅ Your dashboard should load without errors
2. ✅ You can start creating clients, jobs, and invoices
3. ✅ The database relationships will work properly

Need help? Check the migration files in `supabase/migrations/` for the exact SQL being run. 