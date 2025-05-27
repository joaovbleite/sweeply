-- Add additional fields for advanced recurring job patterns
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS recurring_days_of_week INTEGER[], -- Array of day numbers (0-6, where 0 is Sunday)
ADD COLUMN IF NOT EXISTS recurring_day_of_month INTEGER, -- Day of month for monthly recurrence (1-31)
ADD COLUMN IF NOT EXISTS recurring_occurrences INTEGER, -- Number of occurrences for limited recurrence
ADD COLUMN IF NOT EXISTS recurring_end_type VARCHAR(20); -- 'never', 'date', 'occurrences'

-- Add check constraint for valid day of week values
ALTER TABLE jobs 
ADD CONSTRAINT check_recurring_days_of_week 
CHECK (recurring_days_of_week IS NULL OR 
       (array_length(recurring_days_of_week, 1) > 0 AND 
        recurring_days_of_week <@ ARRAY[0,1,2,3,4,5,6]));

-- Add check constraint for valid day of month
ALTER TABLE jobs 
ADD CONSTRAINT check_recurring_day_of_month 
CHECK (recurring_day_of_month IS NULL OR 
       (recurring_day_of_month >= 1 AND recurring_day_of_month <= 31));

-- Add check constraint for valid recurring end type
ALTER TABLE jobs 
ADD CONSTRAINT check_recurring_end_type 
CHECK (recurring_end_type IS NULL OR 
       recurring_end_type IN ('never', 'date', 'occurrences'));

-- Create a function to generate recurring job instances
CREATE OR REPLACE FUNCTION generate_recurring_job_instances(
  p_parent_job_id UUID,
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL
) RETURNS SETOF jobs AS $$
DECLARE
  v_parent_job jobs%ROWTYPE;
  v_current_date DATE;
  v_instance_count INTEGER := 0;
  v_max_instances INTEGER := 100; -- Safety limit
BEGIN
  -- Get the parent job
  SELECT * INTO v_parent_job FROM jobs WHERE id = p_parent_job_id;
  
  IF NOT FOUND OR NOT v_parent_job.is_recurring THEN
    RETURN;
  END IF;
  
  v_current_date := p_start_date;
  
  -- Generate instances based on frequency
  WHILE v_current_date <= COALESCE(p_end_date, v_parent_job.recurring_end_date, CURRENT_DATE + INTERVAL '1 year') 
    AND v_instance_count < v_max_instances LOOP
    
    -- Check if we should create an instance for this date
    IF should_create_instance(v_parent_job, v_current_date) THEN
      -- Return a job instance
      v_parent_job.id := gen_random_uuid();
      v_parent_job.parent_job_id := p_parent_job_id;
      v_parent_job.scheduled_date := v_current_date;
      v_parent_job.created_at := NOW();
      v_parent_job.updated_at := NOW();
      
      RETURN NEXT v_parent_job;
      v_instance_count := v_instance_count + 1;
    END IF;
    
    -- Move to next potential date based on frequency
    CASE v_parent_job.recurring_frequency
      WHEN 'weekly' THEN
        v_current_date := v_current_date + INTERVAL '1 week';
      WHEN 'biweekly' THEN
        v_current_date := v_current_date + INTERVAL '2 weeks';
      WHEN 'monthly' THEN
        v_current_date := v_current_date + INTERVAL '1 month';
      WHEN 'quarterly' THEN
        v_current_date := v_current_date + INTERVAL '3 months';
      ELSE
        EXIT; -- Unknown frequency
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if an instance should be created for a given date
CREATE OR REPLACE FUNCTION should_create_instance(
  p_job jobs,
  p_date DATE
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if date is within recurrence period
  IF p_job.recurring_end_type = 'date' AND p_date > p_job.recurring_end_date THEN
    RETURN FALSE;
  END IF;
  
  -- For weekly recurrence with specific days
  IF p_job.recurring_frequency = 'weekly' AND p_job.recurring_days_of_week IS NOT NULL THEN
    RETURN EXTRACT(DOW FROM p_date)::INTEGER = ANY(p_job.recurring_days_of_week);
  END IF;
  
  -- For monthly recurrence with specific day of month
  IF p_job.recurring_frequency = 'monthly' AND p_job.recurring_day_of_month IS NOT NULL THEN
    RETURN EXTRACT(DAY FROM p_date) = p_job.recurring_day_of_month;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create index for parent job lookups
CREATE INDEX IF NOT EXISTS idx_jobs_parent_job_id ON jobs(parent_job_id);

-- Add comment to document the new fields
COMMENT ON COLUMN jobs.recurring_days_of_week IS 'Array of day numbers (0-6, where 0 is Sunday) for weekly recurrence';
COMMENT ON COLUMN jobs.recurring_day_of_month IS 'Day of month (1-31) for monthly recurrence';
COMMENT ON COLUMN jobs.recurring_occurrences IS 'Total number of occurrences for limited recurrence';
COMMENT ON COLUMN jobs.recurring_end_type IS 'How the recurrence ends: never, date, or after N occurrences'; 