-- Create waitlist table for storing email addresses
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to the table
COMMENT ON TABLE waitlist IS 'Table for storing waitlist email addresses';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Set up Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for the waitlist table
-- Allow anonymous users to insert (sign up)
CREATE POLICY waitlist_insert_policy ON waitlist
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Only allow admins to select, update, delete
CREATE POLICY waitlist_admin_policy ON waitlist
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM user_profiles WHERE is_admin = true
  ));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_waitlist_updated_at
BEFORE UPDATE ON waitlist
FOR EACH ROW
EXECUTE FUNCTION update_waitlist_updated_at(); 