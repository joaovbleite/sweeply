-- Create jobs table for managing cleaning services
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Job Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(50) NOT NULL DEFAULT 'regular', -- regular, deep_clean, move_in, move_out, post_construction, one_time
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  estimated_duration INTEGER, -- in minutes
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  
  -- Pricing
  estimated_price DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  
  -- Location & Instructions
  address TEXT, -- Can override client address if different
  special_instructions TEXT,
  access_instructions TEXT, -- How to get keys, gate codes, etc.
  
  -- Completion Details
  completion_notes TEXT,
  before_photos TEXT[], -- Array of photo URLs
  after_photos TEXT[], -- Array of photo URLs
  
  -- Recurring Job Info
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20), -- weekly, biweekly, monthly, quarterly
  recurring_end_date DATE,
  parent_job_id UUID REFERENCES jobs(id), -- For recurring job instances
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_service_type ON jobs(service_type);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 
 
 
 