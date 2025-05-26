-- Create employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  date_of_birth DATE,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  
  -- Employment Details
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'cleaner', -- cleaner, supervisor, manager, admin, driver
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, terminated, on_leave
  hire_date DATE NOT NULL,
  termination_date DATE,
  department VARCHAR(100),
  
  -- Compensation
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  salary DECIMAL(10,2),
  payroll_frequency VARCHAR(20) NOT NULL DEFAULT 'bi_weekly', -- weekly, bi_weekly, monthly
  payment_method VARCHAR(20) NOT NULL DEFAULT 'direct_deposit', -- direct_deposit, check, cash
  bank_account VARCHAR(100),
  routing_number VARCHAR(20),
  
  -- Work Schedule
  weekly_hours INTEGER NOT NULL DEFAULT 40,
  schedule_notes TEXT,
  
  -- Skills and Certifications (stored as JSONB arrays)
  skills JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  
  -- Performance Metrics
  current_rating VARCHAR(20), -- excellent, good, satisfactory, needs_improvement, unsatisfactory
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_hours_worked DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payroll_periods table
CREATE TABLE payroll_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, processed, paid
  total_amount DECIMAL(12,2) DEFAULT 0,
  total_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payroll_entries table
CREATE TABLE payroll_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  payroll_period_id UUID REFERENCES payroll_periods(id) ON DELETE CASCADE NOT NULL,
  
  -- Hours and Pay
  regular_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  holiday_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  sick_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  vacation_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  
  -- Rates
  regular_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  overtime_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  holiday_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Calculations
  gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Deduction Details
  tax_deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  insurance_deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Bonuses and Adjustments
  bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
  adjustments DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Job Performance
  jobs_completed INTEGER DEFAULT 0,
  performance_bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_reviews table
CREATE TABLE performance_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  
  -- Review Details
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  review_date DATE NOT NULL,
  reviewer_name VARCHAR(200) NOT NULL,
  
  -- Performance Metrics
  overall_rating VARCHAR(20) NOT NULL,
  punctuality_rating VARCHAR(20) NOT NULL,
  quality_rating VARCHAR(20) NOT NULL,
  teamwork_rating VARCHAR(20) NOT NULL,
  communication_rating VARCHAR(20) NOT NULL,
  initiative_rating VARCHAR(20) NOT NULL,
  
  -- Quantitative Metrics
  jobs_completed INTEGER DEFAULT 0,
  client_satisfaction_score DECIMAL(3,2) DEFAULT 0,
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Feedback (stored as JSONB arrays)
  strengths JSONB DEFAULT '[]',
  areas_for_improvement JSONB DEFAULT '[]',
  goals JSONB DEFAULT '[]',
  comments TEXT,
  employee_comments TEXT,
  
  -- Action Items
  action_items JSONB DEFAULT '[]',
  next_review_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_email ON employees(email);

CREATE INDEX idx_payroll_periods_user_id ON payroll_periods(user_id);
CREATE INDEX idx_payroll_periods_dates ON payroll_periods(period_start, period_end);
CREATE INDEX idx_payroll_periods_status ON payroll_periods(status);

CREATE INDEX idx_payroll_entries_user_id ON payroll_entries(user_id);
CREATE INDEX idx_payroll_entries_employee_id ON payroll_entries(employee_id);
CREATE INDEX idx_payroll_entries_period_id ON payroll_entries(payroll_period_id);

CREATE INDEX idx_performance_reviews_user_id ON performance_reviews(user_id);
CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_review_date ON performance_reviews(review_date);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employees
CREATE POLICY "Users can view their own employees" ON employees
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employees" ON employees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employees" ON employees
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employees" ON employees
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for payroll_periods
CREATE POLICY "Users can view their own payroll periods" ON payroll_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payroll periods" ON payroll_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payroll periods" ON payroll_periods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payroll periods" ON payroll_periods
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for payroll_entries
CREATE POLICY "Users can view their own payroll entries" ON payroll_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payroll entries" ON payroll_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payroll entries" ON payroll_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payroll entries" ON payroll_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for performance_reviews
CREATE POLICY "Users can view their own performance reviews" ON performance_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance reviews" ON performance_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance reviews" ON performance_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own performance reviews" ON performance_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_periods_updated_at 
  BEFORE UPDATE ON payroll_periods 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_entries_updated_at 
  BEFORE UPDATE ON payroll_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at 
  BEFORE UPDATE ON performance_reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate employee ID
CREATE OR REPLACE FUNCTION generate_employee_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := 'EMP' || LPAD(counter::TEXT, 4, '0');
    
    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM employees WHERE employee_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate payroll entry totals
CREATE OR REPLACE FUNCTION calculate_payroll_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate gross pay
  NEW.gross_pay := 
    (NEW.regular_hours * NEW.regular_rate) +
    (NEW.overtime_hours * NEW.overtime_rate) +
    (NEW.holiday_hours * NEW.holiday_rate) +
    NEW.bonus + NEW.performance_bonus + NEW.adjustments;
  
  -- Calculate total deductions
  NEW.deductions := NEW.tax_deductions + NEW.insurance_deductions + NEW.other_deductions;
  
  -- Calculate net pay
  NEW.net_pay := NEW.gross_pay - NEW.deductions;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payroll calculations
CREATE TRIGGER calculate_payroll_before_insert_update
  BEFORE INSERT OR UPDATE ON payroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_payroll_totals(); 
 
 
 