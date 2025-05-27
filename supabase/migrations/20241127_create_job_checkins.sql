-- Create job_checkins table for GPS check-in/check-out functionality
CREATE TABLE job_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL,
    check_in_location JSONB NOT NULL,
    check_in_address TEXT NOT NULL,
    check_in_notes TEXT,
    check_out_time TIMESTAMPTZ,
    check_out_location JSONB,
    check_out_notes TEXT,
    duration_minutes INTEGER,
    completion_status TEXT CHECK (completion_status IN ('completed', 'partial', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_job_checkins_job_id ON job_checkins(job_id);
CREATE INDEX idx_job_checkins_employee_id ON job_checkins(employee_id);
CREATE INDEX idx_job_checkins_check_in_time ON job_checkins(check_in_time);
CREATE INDEX idx_job_checkins_active ON job_checkins(job_id, employee_id) WHERE check_out_time IS NULL;

-- Create RLS policies
ALTER TABLE job_checkins ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own check-ins
CREATE POLICY "Users can view their own check-ins" ON job_checkins
    FOR SELECT USING (auth.uid() = employee_id);

-- Policy: Users can insert their own check-ins
CREATE POLICY "Users can insert their own check-ins" ON job_checkins
    FOR INSERT WITH CHECK (auth.uid() = employee_id);

-- Policy: Users can update their own check-ins
CREATE POLICY "Users can update their own check-ins" ON job_checkins
    FOR UPDATE USING (auth.uid() = employee_id);

-- Policy: Users can delete their own check-ins
CREATE POLICY "Users can delete their own check-ins" ON job_checkins
    FOR DELETE USING (auth.uid() = employee_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_checkins_updated_at
    BEFORE UPDATE ON job_checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE job_checkins IS 'Stores GPS-verified check-in and check-out records for jobs';
COMMENT ON COLUMN job_checkins.check_in_location IS 'GPS coordinates and accuracy data for check-in location';
COMMENT ON COLUMN job_checkins.check_out_location IS 'GPS coordinates and accuracy data for check-out location';
COMMENT ON COLUMN job_checkins.duration_minutes IS 'Duration of work session in minutes';
COMMENT ON COLUMN job_checkins.completion_status IS 'Status of job completion: completed, partial, or cancelled'; 