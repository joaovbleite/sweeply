# 🚨 Fix for "house_type column not found" Error

## Quick Solution

You need to run the migration that adds the property-related columns to your jobs table.

### Steps:

1. **Go to your Supabase Dashboard**
   - Open [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run this SQL command:**
   ```sql
   -- Add property_type and related fields to jobs table for residential vs commercial support
   ALTER TABLE jobs 
   ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('residential', 'commercial')) DEFAULT 'residential' NOT NULL;

   -- Add commercial-specific fields
   ALTER TABLE jobs 
   ADD COLUMN IF NOT EXISTS square_footage INTEGER,
   ADD COLUMN IF NOT EXISTS number_of_floors INTEGER,
   ADD COLUMN IF NOT EXISTS building_type TEXT;

   -- Add residential-specific fields  
   ALTER TABLE jobs 
   ADD COLUMN IF NOT EXISTS number_of_bedrooms INTEGER,
   ADD COLUMN IF NOT EXISTS number_of_bathrooms INTEGER,
   ADD COLUMN IF NOT EXISTS house_type TEXT;

   -- Create index for property_type for filtering performance
   CREATE INDEX IF NOT EXISTS idx_jobs_property_type ON jobs(property_type);

   -- Add comments for clarity
   COMMENT ON COLUMN jobs.property_type IS 'Type of property: residential or commercial';
   COMMENT ON COLUMN jobs.square_footage IS 'Total square footage for commercial properties';
   COMMENT ON COLUMN jobs.number_of_floors IS 'Number of floors for commercial properties';
   COMMENT ON COLUMN jobs.building_type IS 'Type of commercial building (office, retail, warehouse, etc.)';
   COMMENT ON COLUMN jobs.number_of_bedrooms IS 'Number of bedrooms for residential properties';
   COMMENT ON COLUMN jobs.number_of_bathrooms IS 'Number of bathrooms for residential properties';
   COMMENT ON COLUMN jobs.house_type IS 'Type of residential property (apartment, house, condo, etc.)';
   ```

4. **Click "Run" button**

5. **Refresh your app**
   - The error should now be resolved!

## Alternative: Remove the fields from the code

If you don't need these property-specific fields right now, I can update the code to not send them. Let me know!

## Note
I've added `IF NOT EXISTS` to the SQL commands to make them safe to run even if some columns already exist. 